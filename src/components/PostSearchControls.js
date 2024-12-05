import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { SearchControl, Popover, Spinner } from '@wordpress/components';
import { CurrentlySelected } from './CurrentlySelected';
import './assets/css/PostSearchControls.scss';

export function PostSearchControls( props ) {
	const isMultiPost                 = props?.postArray !== undefined;
	const [ postArray, setPostArray ] = useState( () => {
		if ( props?.postArray && Array.isArray( props?.postArray ) ) {
			return props.postArray;
		}
		else if ( props?.postID ) {
			return [ props.postID ];
		}
		return [];
	} );
	const [ posts,         setPosts         ] = useState( null );
	const [ isLoading,     setIsLoading     ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const [ searchInput,   setSearchInput   ] = useState( '' );
	const [ queriedPosts,  setQueriedPosts  ] = useState( [] );
	const searchControlRef                    = useRef( null );
	const searchDebounceTimeout               = useRef( null );

	// Handle postID changes and pass to onChange() if it exists
	const addPost = ( value ) => {
		if ( isMultiPost && postArray.includes( value ) ) {
			return;
		}

		const updatedArray = isMultiPost ? [ ...postArray, value ] : [ value ];
		setPostArray( updatedArray );
		handleChange( updatedArray );
	}

	const removePost = ( value ) => {
		let updatedArray;

		if ( isMultiPost ) {
			updatedArray = value ? postArray.filter( ( post ) => post !== value ) : postArray;
		}
		else {
			updatedArray = [];
		}
		setPostArray( [ ...updatedArray ] );
		handleChange( updatedArray );
	}

	// Wrapper to ensure onChange receives an ID or array of IDs as expected
	const handleChange = ( updatedArray ) => {
		if ( 'function' !== typeof props?.onChange ) {
			return;
		}
		const value = ( isMultiPost ) ? updatedArray : updatedArray[0];
		props.onChange( value );
	}

	// handle changes to search Input
	const handleSearchInputChange = useCallback( ( inputValue ) => {
		setSearchInput( inputValue );
		setIsPopoverOpen( true );
		clearTimeout( searchDebounceTimeout.current );

		if ( inputValue.length === 0 ) {
			setQueriedPosts( [] );
			setIsLoading( false );
			return;
		}

		setIsLoading( true );

		// retrieve post list
		searchDebounceTimeout.current = setTimeout( async () => {
			try {
				const apiEndPoint = await constructEndPoint();
				const searchQuery = searchInput
					? `?search=${ searchInput }&per_page=20`
					: '?per_page=20&orderby=date';
				const apiQuery    = ( apiEndPoint + searchQuery );
				const response    = await fetch ( apiQuery );
				if ( response.ok ) {
					const data = await response.json();
					setQueriedPosts( data.map( ( result ) => ( {
						label: result?.title?.rendered || 'Untitled',
						value: result.id,
					} ) ) );
				}
			}
			catch ( error ) {
				console.warn( 'Error fetching posts: ', error );
			}
			finally {
				setIsLoading( false );
			}
		}, 600 );
	} );

	// Cleanup debounce on component re-render TODO verify that moving back to state for input/isLoading doesn't break this
	useEffect( () => {
		return () => clearTimeout( searchDebounceTimeout.current );
	}, [] );

	// Strip slashes for endpoint construction
	const stripSlashes = ( string ) => string?.replace( /^\/|\/$/, '' ) || '';

	// Get blog path for API if needed
	const fetchBlogPath = async ( apiDomain ) => {
		let apiBlogPath;

		try {
			const blogApiQuery = apiDomain + '/wp-json/hpu/v1/blogs?id=' + blogID;
			const response     = await fetch( blogApiQuery );
			if ( response.ok ) {
				const data = await response.json();
				apiBlogPath = ( data?.path || '/' );
			}
		}
		catch ( error ) {
			console.warn( 'Error fetching blog list: ', error );
			apiBlogPath = '/';
		}

		return apiBlogPath;
	}

	// Construct API endpoint for queries
	const constructEndPoint = async () => {
		let apiBlogPath;
		let apiRoot;

		const apiDomain = stripSlashes( props?.apiDomain ) || window.location.origin;

		// If blogID or blogPath defined - construct the endpoint, else use wpApiSettings for default
		if ( props?.blogPath ) {
			// ensure the correct amount of slashes are returned
			apiBlogPath = ( '/' === props.blogPath ) ? '/' : `/${ stripSlashes( props.blogPath ) }/`;
			apiRoot     = `${apiDomain}${apiBlogPath}wp-json/`;
		}
		else if ( props?.blogID ) {
			apiBlogPath = await fetchBlogPath( apiDomain );
			apiRoot     = `${apiDomain}${apiBlogPath}wp-json/`;
		}
		else {
			apiRoot = wpApiSettings.root;
		}

		// if using a custon namespace for the api, do not assume a default post-type is needed
		const apiNameSpace    = stripSlashes( props?.apiNameSpace ) || 'wp/v2';
		const defaultPostType = ( props?.apiNameSpace ) ? '' : 'posts';
		const postType        = props?.postType || defaultPostType;

		// return the constructed endpoint
		return stripSlashes( `${ apiRoot }${ apiNameSpace }/${ postType }` );
	};

	// Fetch post(s) when the postArray or postID changes
	useEffect( () => {
		if ( postArray && postArray.length > 0 ) {
			const fetchPosts = async () => {
				try {
					const apiEndPoint  = await constructEndPoint();
					const updatedPosts = await Promise.all(
						postArray.map( async ( postID ) => {
							const response = await fetch( `${ apiEndPoint }/${ postID }` )
							if ( response.ok ) {
								return await response.json();
							}
							else {
								console.warn( `Error fetching post with ID ${ postID }: `, response.statusText );
								return null;
							}
						} )
					);
					setPosts( updatedPosts.filter( ( post ) => post !== null ) );
				}
				catch ( error ) {
					console.warn( 'Error fetching selected post: ', error );
				}
			}
			fetchPosts();
		}
		else {
			setPosts( null );
		}
	}, [ postArray, constructEndPoint ] );

	// Render Component
	return (
		<div className='hpu-component-post-search-control'>
			<SearchControl
				ref={ searchControlRef }
				className='post-search-control-selector'
				label={ props?.searchLabel || 'Search Posts' }
				hideLabelFromVision={ false }
				value={ searchInput }
				onChange={ handleSearchInputChange }
				__nextHasNoMarginBottom
			/>
			{ posts && (
				<CurrentlySelected
					label={ props?.selectedLabel || 'Selected Posts' }
					className='post-search-control-currently-selected'
					selectedItems={ posts.map( ( post ) => ( { name: post.title?.rendered, id: post.id } ) ) }
					onRemove={ ( value ) => { removePost( value ) } }
					style={ {
						borderBottom: '1px solid #eee'
					} }
				/>
			) }
			{ isPopoverOpen && searchInput.length ? (
				<Popover
					anchor={ searchControlRef.current }
					className='hpu-post-search-control-results'
					placement={ props?.placement || 'left-start' }
					onClose={ () => { setIsPopoverOpen( false ) } }
				>
					<ul
						className='search-results'
						aria-live='polite'
					>
						{ isLoading && <Spinner /> }
						{ queriedPosts.map( ( result ) => (
							<li
								role='button'
								tabIndex={ 0 }
								className={
									`search-result${
										postArray.includes( result.value )
											? ' selected'
											: '' 
									}` 
								}
								key={ result.value }
								onClick={ () => {
									addPost( result.value );
									setIsPopoverOpen( isMultiPost );
								} }
							>
								{ result.label }
							</li>
						) ) }
						{ ! isLoading && ! queriedPosts.length ? (
							<li className="search-result no-results">No Results Found. Sorry.</li>
						) : ( null ) }
					</ul>
				</Popover>
			) : ( null ) }
		</div>
	)
}
