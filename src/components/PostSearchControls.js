import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { SearchControl } from '@wordpress/components';
import { CurrentlySelected } from './CurrentlySelected';
import { PostSearchPopover } from './PostSearchPopover';

export function PostSearchControls( props ) {
	const isMultiPost                 = ( props?.postArray );
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
	const [ queriedPosts,  setQueriedPosts  ] = useState( [] );
	const [ isLoading,     setIsLoading     ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const [ searchTrigger, setSearchTrigger ] = useState( false );
	const searchControlRef                    = useRef( null );
	const searchInputRef                      = useRef( '' );

	// Handle postID changes and pass to onChange() if it exists
	const addPost = ( value ) => {
		if ( isMultiPost && postArray.includes( value ) ) {
			return;
		}

		const updatedArray = isMultiPost ? [ value, ...postArray ] : [ value ];
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
	const handleSearchInputChange = ( inputValue ) => {
		searchInputRef.current = inputValue;
		setSearchTrigger( inputValue );
		setIsPopoverOpen( true );
	}

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
	const constructEndPoint = useCallback( async () => {
		let apiBlogPath;
		let apiRoot;

		const apiDomain = stripSlashes( props?.apiDomain ) || window.location.origin;

		// If blogID or blogPath defined - construct the endpoint, else use wpApiSettings for default
		if ( props?.blogPath ) {
			// ensure the correct amount of slashes are returned
			apiBlogPath = ( '/' === props.blogPath ) ? '/' : `/${ stripSlashes( props.blogPath ) }/`;
			apiRoot     = `${apiDomain}/wp-json${apiBlogPath}`;
		}
		else if ( props?.blogID ) {
			apiBlogPath = await fetchBlogPath( apiDomain );
			apiRoot     = `${apiDomain}/wp-json${apiBlogPath}`;
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
	}, [ props.apiDomain, props.blogPath, props.blogID, props.apiNameSpace, props.postType ] );

	// Fetch posts for selector
	useEffect( () => {
		if ( ! searchTrigger ) {
			setQueriedPosts( [] );
			setIsLoading( false );
			return;
		}

		setIsLoading( true );

		// retrieve post list
		const fetchPosts = async () => {
			try {
				const apiEndPoint = await constructEndPoint();
				const searchQuery = searchInputRef.current
					? `?search=${ searchInputRef.current }&per_page=20`
					: '?per_page=20&orderby=date';
				const apiQuery    = ( apiEndPoint + searchQuery );
				const response    = await fetch ( apiQuery );
				if ( response.ok ) {
					const data = await response.json();
					setQueriedPosts(
						data.map( ( result ) => ( {
							label: result?.title?.rendered || 'Untitled',
							value: result.id,
						} ) )
					);
				}
			}
			catch ( error ) {
				console.warn( 'Error fetching posts: ', error );
			}
			finally {
				setIsLoading( false );
			}
		};

		// Setup the timeout query
		const searchTimeout = setTimeout( fetchPosts, 200 );

		// reset the timeout on additional inputs
		return () => clearTimeout( searchTimeout );

	}, [ searchTrigger, constructEndPoint ] );

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
		<div className='post-search-control'>
			{ posts && (
				<CurrentlySelected
					label='Selected Profile'
					selectedItems={ posts.map( ( post ) => ( { name: post.title?.rendered, id: post.id } ) ) }
					onRemove={ ( value ) => { removePost( value ) } }
				/>
			) }
			<SearchControl
				ref={ searchControlRef }
				className='post-search-control-selector'
				label={ props.searchLabel || 'Search Posts' }
				hideLabelFromVision={ false }
				value={ searchInputRef.current }
				onChange={ handleSearchInputChange }
				__nextHasNoMarginBottom
			/>
			{ isPopoverOpen && (
				<PostSearchPopover
					anchor={ searchControlRef.current }
					className='post-search-control-results'
					onClose={ () => setIsPopoverOpen( false ) }
					position='bottom center'
					isLoading={ isLoading }
					queriedPosts={ queriedPosts }
					handleChange={ ( value ) => { addPost( value ) } }
					setIsPopoverOpen={ setIsPopoverOpen }
				/>
			) }
		</div>
	)
}
