import { useState, useEffect, useRef } from '@wordpress/element';
import { SearchControl, Spinner } from '@wordpress/components';
import { CurrentlySelected } from './CurrentlySelected';
import {
	stripSlashes,
	buildSearchQuery,
	toResultOptions,
} from './utils/postSearch';
import './assets/css/PostSearchControls.scss';

/**
 * Component for controlling post search functionality.
 *
 * Results list inline under the search box, inside whatever panel holds the
 * control. Each search sends the value the editor typed, after a short pause.
 *
 * @param {Object} props - The component props.
 * @param {Array} [props.postArray] - An array of post IDs to initialize the component with.
 * @param {number} [props.postID] - A single post ID to initialize the component with.
 * @param {string} [props.blogPath] - The path to the blog for API requests.
 * @param {number} [props.blogID] - The ID of the blog for API requests.
 * @param {string} [props.apiDomain] - The domain for the API requests.
 * @param {string} [props.apiNameSpace] - The namespace for the API requests.
 * @param {string} [props.postType] - The type of posts to search for.
 * @param {string} [props.wpNonce] - The WordPress nonce for API requests.
 * @param {Function} [props.onChange] - Callback function to handle changes in selected posts.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {string} [props.searchLabel] - Label for the search input.
 * @param {string} [props.selectedLabel] - Label for the selected posts section.
 * @param {string} [props.placement] - Deprecated and ignored: results now show in the panel.
 */

export function PostSearchControls( props ) {

	// States
	const [ postArray, setPostArray ] = useState( () => {
		if ( props?.postArray && Array.isArray( props?.postArray ) ) {
			return props.postArray;
		}
		else if ( props?.postID ) {
			return [ props.postID ];
		}
		return [];
	} );
	const [ posts,           setPosts           ] = useState( null );
	const [ isLoading,       setIsLoading       ] = useState( false );
	const [ isResultsOpen,   setIsResultsOpen   ] = useState( false );
	const [ searchInput,     setSearchInput     ] = useState( '' );
	const [ queriedPosts,    setQueriedPosts    ] = useState( [] );

	// Refs
	const searchDebounceTimeout = useRef( null );
	const latestRequest         = useRef( 0 );

	// Constants
	const isMultiPost  = ( props?.postArray !== undefined );
	const blogPath     = props?.blogPath     || null;
	const blogID       = props?.blogID       || null;
	const apiDomain    = props?.apiDomain    || window.location.origin;
	const apiNameSpace = props?.apiNameSpace || 'wp/v2';
	const postType     = props?.postType     || ( props?.apiNameSpace ? '' : 'posts' );
	const wpNonce      = props?.wpNonce      || null;
	const onChange     = props?.onChange     || ( () => {} );
	const className    = [ props?.className, 'hpu-post-search-control' ].filter( Boolean ).join( ' ' );

	// Synchronize local state with props.postArray
	useEffect(() => {
		if (props?.postArray && Array.isArray(props.postArray)) {
			setPostArray(props.postArray); // Update local state when props.postArray changes
		}
	}, [props.postArray]);

	// Drop open results when the api settings change
	useEffect( () => {
		latestRequest.current++;
		clearTimeout( searchDebounceTimeout.current );
		setIsResultsOpen( false );
		setQueriedPosts( [] );
		setIsLoading( false );
	}, [ blogPath, blogID, apiDomain, apiNameSpace, postType, wpNonce ] );

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
		const value = ( isMultiPost ) ? updatedArray : updatedArray[0];
		onChange( value );
	}

	// Handle changes to the search input. The request reads inputValue, the
	// value just typed, and only the newest request may set the results.
	const handleSearchInputChange = ( inputValue ) => {
		setSearchInput( inputValue );
		clearTimeout( searchDebounceTimeout.current );
		const requestId = ++latestRequest.current;

		if ( inputValue.length === 0 ) {
			setIsResultsOpen( false );
			setQueriedPosts( [] );
			setIsLoading( false );
			return;
		}

		setIsResultsOpen( true );
		setIsLoading( true );

		searchDebounceTimeout.current = setTimeout( async () => {
			try {
				const apiEndPoint = await constructEndPoint();
				const nonce       = wpNonce ? `&_wpnonce=${ wpNonce }` : '';
				const response    = await fetch( apiEndPoint + buildSearchQuery( inputValue ) + nonce );
				const data        = response.ok ? await response.json() : [];
				if ( requestId === latestRequest.current ) {
					setQueriedPosts( toResultOptions( data ) );
				}
			}
			catch ( error ) {
				console.warn( 'Error fetching posts: ', error );
				if ( requestId === latestRequest.current ) {
					setQueriedPosts( [] );
				}
			}
			finally {
				if ( requestId === latestRequest.current ) {
					setIsLoading( false );
				}
			}
		}, 600 );
	};

	// Cleanup debounce on unmount
	useEffect( () => {
		return () => clearTimeout( searchDebounceTimeout.current );
	}, [] );

	// Get blog path for API if needed
	const fetchBlogPath = async () => {
		if ( ! blogID ) {
			return '/';
		}

		// Check for blog path in custom blog data object
		if ( window?.HPUCustomBlocksData?.blogs?.[ blogID ]?.path ) {
			return window.HPUCustomBlocksData.blogs[ blogID ].path;
		}

		let apiBlogPath = '/';

		try {
			const blogApiQuery = `${ apiDomain }/wp-json/hpu/v1/blogs/${ blogID }/`;
			const response     = await fetch( blogApiQuery );
			if ( response.ok ) {
				const data = await response.json();
				apiBlogPath = ( data?.path || '/' );
			}
		}
		catch ( error ) {
			console.warn( 'Error fetching blog list: ', error );
		}

		return apiBlogPath;
	}

	// Construct API endpoint for queries
	const constructEndPoint = async () => {
		let queryRoot;

		const queryDomain = stripSlashes( apiDomain );

		// If blogID or blogPath defined - construct the endpoint, else use wpApiSettings for default
		if ( blogPath || blogID ) {
			const path          = blogPath || await fetchBlogPath();
			const queryBlogPath = stripSlashes( path ) ? `/${ stripSlashes( path ) }/` : '/';
			queryRoot           = `${ queryDomain }${ queryBlogPath }wp-json/`;
		}
		else {
			queryRoot = window.wpApiSettings.root;
		}

		// if using a custom namespace for the api, do not assume a default post-type is needed
		const queryNameSpace = stripSlashes( apiNameSpace );
		const queryPostType  = stripSlashes( postType );
		return stripSlashes( `${ queryRoot }${ queryNameSpace }/${ queryPostType }` );
	};

	const maybeFetchPosts = () => {
		if ( ! postArray || postArray.length === 0 ) {
			setPosts( null );
			return;
		}
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

	// Fetch post(s) when the postArray or postID changes
	useEffect( () => {
		maybeFetchPosts();
	}, [ postArray ] );

	const selectResult = ( value ) => {
		addPost( value );
		if ( ! isMultiPost ) {
			setIsResultsOpen( false );
		}
	};

	// Render Component
	return (
		<div className={ className }>
			<div>
				{ /* Escape clears the box (core SearchControl), which closes the results. */ }
				<SearchControl
					className='hpu-post-search-control--search-input'
					label={ props?.searchLabel || 'Search Posts' }
					hideLabelFromVision={ false }
					value={ searchInput }
					onChange={ handleSearchInputChange }
					__nextHasNoMarginBottom
				/>
				{ isResultsOpen && searchInput.length ? (
					<div className='hpu-post-search-control--results'>
						{ isLoading && <Spinner /> }
						<ul
							className='search-results'
							aria-live='polite'
							aria-busy={ isLoading }
						>
							{ queriedPosts.map( ( result ) => {
								const isSelected = postArray.includes( result.value );
								return (
									<li
										className={ `search-result${ isSelected ? ' selected' : '' }` }
										key={ result.value }
									>
										<button
											type='button'
											className='search-result--button'
											aria-pressed={ isSelected }
											onClick={ () => selectResult( result.value ) }
										>
											{ result.label }
										</button>
									</li>
								);
							} ) }
							{ ! isLoading && ! queriedPosts.length ? (
								<li className='search-result no-results'>No Results Found. Sorry.</li>
							) : ( null ) }
						</ul>
					</div>
				) : ( null ) }
			</div>
			{ posts && (
				<CurrentlySelected
					label={ props?.selectedLabel || 'Selected Posts' }
					className='hpu-post-search-control--currently-selected'
					selectedItems={ posts.map( ( post ) => ( { name: ( post.title?.rendered || post?.name || 'Untitled' ), id: post.id } ) ) }
					onRemove={ ( value ) => { removePost( value ) } }
				/>
			) }
		</div>
	)
}
