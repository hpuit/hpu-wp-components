import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { SearchControl, Spinner, Popover } from '@wordpress/components';
import { CurrentlySelected } from './CurrentlySelected';

const PostSearchPopover = ( {
	isLoading,
	queriedPosts,
	handleChange,
	setIsPopoverOpen,
	...popoverProps
} ) => {
	return (
		<Popover { ...popoverProps } >
			<ul
				className='search-results'
				aria-live='polite'
				style={ {
					width: '280px',
					padding: '0 10px'
				} }
			>
				{ isLoading && <Spinner /> }
				{ queriedPosts.map( ( result ) => (
					<li
						role='button'
						tabIndex={ 0 }
						className='is-nowrap'
						key={ result.value }
						onClick={ () => {
							handleChange( result.value );
							setIsPopoverOpen( false );
						} }
					>
						{ result.label }
					</li>
				) ) }
				{ ! isLoading && 0 === queriedPosts.length && (
					<li className="no-results">No Results Found. Sorry.</li>
				) }
			</ul>
		</Popover>
	)
}

export function PostSearchControls( props ) {
	// const [ blogID,        setblogID        ] = useState( props.blogID || null );
	const [ postID,        setPostID        ] = useState( props.postID || null );
	const [ postArray,     setPostArray     ] = useState( props.postArray || [] );
	const [ post,          setPost          ] = useState( null );
	const [ queriedPosts,  setQueriedPosts  ] = useState( [] );
	const [ isLoading,     setIsLoading     ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const [ searchTrigger, setSearchTrigger ] = useState( false );
	const searchControlRef                    = useRef( null );
	const searchInputRef                      = useRef( '' );
	const isMultiPost                         = ( props?.postArray );


	// handle changes to search Input
	const handleSearchInputChange = ( inputValue ) => {
		searchInputRef.current = inputValue;
		setSearchTrigger( inputValue );
		setIsPopoverOpen( true );
	}

	// Handle value changes based on multipost/singlepost status
	const setValue = ( value ) => {
		if ( isMultiPost && 'array' === typeof value ) {
			setPostArray( value );
		}
		else if ( ! isMultiPost && 'array' !== typeof value ) {
			setPostID( value );
		}
		else {
			console.warn( 'received unexpected value type when setting new value: ', typeof value );
		}
	}

	// Handle postID changes and pass to onChange() if it exists
	const handleChange = ( value ) => {
		if ( 'function' === typeof props.onChange ) {
			// TODO handle multipost setup properly :)
			if ( isMultiPost && 'array' !== typeof value ) {
				value = [ value ];
			}
			props.onChange( value );
		}
		setValue( value );
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
			console.log( 'generating blog path from blogPath: ', apiBlogPath );
		}
		else if ( props?.blogID ) {
			apiBlogPath = await fetchBlogPath( apiDomain );
			apiRoot     = `${apiDomain}/wp-json${apiBlogPath}`;
			console.log( 'generating blog path from blogID: ', apiBlogPath );
		}
		else {
			apiRoot = wpApiSettings.root;
			console.log( 'generated apiRoot from wpApiSettings.root: ', apiRoot );
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
				console.log( 'Error fetching posts: ', error );
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

	// Fetch post when the PostID changes
	useEffect( () => {
		if ( postID ) {
			const fetchPost = async () => {
				try {
					const apiEndPoint = await constructEndPoint();
					const response    = await fetch ( `${ apiEndPoint }/${ postID }` )
					if ( response.ok ) {
						const data = await response.json();
						setPost( data );
					}
				}
				catch ( error ) {
					console.log( 'Error fetching selected post: ', error );
				}
			}
			fetchPost();
		}
		else {
			setPost( null );
		}
	}, [ postID, constructEndPoint ] )

	// Fetch post(s) when the postArray or postID changes
	useEffect( () => {
		if
	} )

	// Render Component
	return (
		<div className='post-search-control'>
			{ post && (
				<CurrentlySelected
					label='Selected Profile'
					selectedItem={ { name: post.title?.rendered, id: post.id } }
					onRemove={ ( item ) => { handleChange( null ) } }
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
				/>
			) }
		</div>
	)
}
