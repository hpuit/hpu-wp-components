import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { SearchControl, Popover } from '@wordpress/components';

export function SelectBlogControls ( props ) {
	const [ blog, setBlog ] = useState( props?.blogID || null );
	const [ blogList, setBlogList ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const [ searchInput, setSearchInput ] = useState( '' );
	const searchControlRef = useRef( null );


	useEffect( () => {
		// Fetch blogs for select
		const fetchBlogs = async () => {
			let data = null;
			const apiDomain = props?.apiDomain || window.location.origin;
			try {
				const blogApiQuery = apiDomain + '/wp-json/hpu/v1/blogs?per_page=0';
				const response     = await fetch( blogApiQuery );
				if ( response.ok ) {
					data = await response.json();
					setBlogList( data );
				}
			}
			catch ( error ) {
				console.warn( 'Error fetching blog list: ', error );
			}
			finally {
				console.log( data );
			}
		}
		fetchBlogs();
	}, [] );

	return (
		<div className='hpu-component-blog-select-control'>
			<SearchControl
				ref={ searchControlRef }
				className='blog-select-control-selector'
				label={ props?.searchLabel || 'Select Blog' }
				hideLabelFromVision={ false }
				value={ searchInput }
				onChange={ ( value ) => { console.log( value ) } }
				__nextHasNoMarginBottom
			/>
			{ isPopoverOpen && searchInput.length ? (
				<Popover
					anchor={ searchControlRef.current }
					className='hpu-blog-select-control-results'
					placement={ props?.placement || 'bottom' }
					onClose={ () => { setIsPopoverOpen( false ) } }
				>
					<ul
						className='search-results'
						aria-live='polite'
					>
						{ isLoading && <Spinner /> }
						{ ! isLoading ? (
							<li className="search-result no-results">No Results Found. Sorry.</li>
						) : ( null ) }
					</ul>
				</Popover>
			) : ( null ) }
			
		</div>
	)
}