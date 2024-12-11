import { useState, useEffect } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import './assets/css/SelectBlogControls.scss';

export function SelectBlogControls ( props ) {
	const [ selectedBlog, setSelectedBlog ] = useState( props?.blogID ? `${ props.blogID }` : '1' );
	const [ blogFilter,   setBlogFilter   ] = useState( '' );
	const [ blogList,     setBlogList     ] = useState( [] );
	const [ options,      setOptions      ] = useState( [] );

	const handleChange = props?.onChange || ( () => {} );

	// Handle changes to selected blog
	useEffect( () => {
		handleChange( selectedBlog );
	}, [ selectedBlog ] );

	// Update bloglist on filter change
	useEffect( () => {
		fetchBlogs();
	}, [ blogFilter, selectedBlog ] );

	// Update options when blogList or selected blog changes
	useEffect( () => {
		updateOptions();
	}, [ blogList, selectedBlog ] );

	const fetchSingleBlog = async () => {
		if ( ! selectedBlog ) {
			return [];
		}

		let data = null;
		const apiDomain = props?.apiDomain || window.location.origin;

		try {
			const blogApiQuery = `${ apiDomain }/wp-json/hpu/v1/blogs/${ selectedBlog }`;
			const response     = await fetch( blogApiQuery );
			if ( response.ok ) {
				data = await response.json();
			}
		}
		catch ( error ) {
			console.warn( 'Error fetching single blog: ', error );
		}
		finally {
			return data;
		}
	}
	
	// Fetch blogs for select
	const fetchBlogs = async () => {
		let data = [];
		let filter = '';
		const apiDomain = props?.apiDomain || window.location.origin;

		if ( blogFilter ) {
			filter += '&search=' + blogFilter;
		}

		if ( selectedBlog ) {
			filter += '&exclude=' + selectedBlog;
		}

		try {
			const blogApiQuery = `${ apiDomain }/wp-json/hpu/v1/blogs?per_page=20${ filter }`;
			const response     = await fetch( blogApiQuery );
			if ( response.ok ) {
				data = await response.json();
			}
		}
		catch ( error ) {
			console.warn( 'Error fetching blog list: ', error );
		}
		finally {
			setBlogList( data );
		}
	}

	const parseBlogInfo = ( blog ) => {
		const blogID    = blog?.id || null;
		if ( ! blogID ) {
			return null;
		}

		const blogName  = decodeHtmlEntities( blog?.name ) || 'Untitled';
		const blogPath  = decodeHtmlEntities( blog?.path ) || '';
		const blogLabel = `${ blogName } - ${ blogPath }`;

		return { value: blogID, label: blogLabel };
	}

	const decodeHtmlEntities = ( input ) => {
		const parser = new DOMParser();
		const doc    = parser.parseFromString( input, 'text/html' );
		return doc.documentElement.textContent;
	};

	// Render options for select
	const updateOptions = async () => {
		let newOptions = [];

		const currentOption = await fetchSingleBlog();
		if ( currentOption && currentOption?.id ) {
			newOptions.push( parseBlogInfo( currentOption ) );
		}

		const filteredOptions = blogList.map( ( blog ) => {
			return parseBlogInfo( blog );
		} );

		newOptions = [ ...newOptions, ...filteredOptions ];
		setOptions( newOptions );
	}

	// Return the component
	return (
		<div className='hpu-select-blog-control'>
			<ComboboxControl
				className='hpu-select-blog-control--select'
				label='Select Blog'
				value={ selectedBlog || options[0]?.value || '1' }
				onChange={ ( value ) => { setSelectedBlog( value ) } }
				onFilterValueChange={ ( value ) => { setBlogFilter( value ) } }
				options={ options }
				__nextHasNoMarginBottom
			/>
		</div>
	)
}