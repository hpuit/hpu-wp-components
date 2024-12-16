import { BaseControl, SearchControl, CheckboxControl, ComboboxControl, Spinner } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";

export function AssociatedSiteControls( props ) {

	// States
	const [ isLoading,     setIsLoading     ] = useState( true );
	const [ searchInput,   setSearchInput   ] = useState( '' );
	const [ queriedSites,  setQueriedSites  ] = useState( [] );
	const [ siteArray,     setSiteArray     ] = useState( () => {
		if ( props?.siteArray && Array.isArray( props?.siteArray ) ) {
			return props.siteArray;
		}
		else if ( props?.siteID ) {
			return [ props.siteID ];
		}
		return [];
	} );

	// Consts
	const isMultiSelect = props?.isMultiSelect ?? ( props?.postArray !== undefined );
	const className     = ( props?.className ? props.className + ' ' : '' ) + 'hpu-associated-site-control';
	const onChange	    = props?.onChange || ( () => {} );

	const handleChange = ( value, id ) => {
		let updatedArray;

		if ( value ) {
			updatedArray = addValue( id );
		}
		else {
			updatedArray = removeValue( id );
		}

		const changeValue = isMultiSelect ? updatedArray : updatedArray[0];
		onChange( changeValue );
		setSiteArray( updatedArray );
	}

	const addValue = ( id ) => {
		if ( isMultiSelect && siteArray.includes( id ) ) {
			return;
		}
		const updatedArray = isMultiSelect ? [ ...siteArray, id ] : [ id ];
		return updatedArray;
	}

	const removeValue = ( id ) => {
		const updatedArray = isMultiSelect ? siteArray.filter( ( value ) => value !== id ) : [];
		return updatedArray;
	}

	const handleSearchInputChange = ( value ) => {
		setSearchInput( value );
	}

	useEffect( () => {
		setIsLoading( true );
		const fetchBlogs = async () => {
			try {
				if ( window?.HPUCustomBlockData?.blogs ) {
					return window.HPUCustomBlockData.blogs;
				}
				else {
					const response = await fetch( `${ window.location.origin }/wp-json/hpu/v1/blogs?per_page=0` );
					if ( response.ok ) {
						const data = await response.json();
						return data;
					} else {
						console.warn( 'Failed to fetch blogs:', response.statusText );
						return [];
					}
				}
			}
			catch ( error ) {
				console.warn( 'Failed to fetch blogs:', error );
				return [];
			}
		}

		const filterBlogs = async () => {
			const blogs = await fetchBlogs();
			const selectedSites = blogs.filter( ( blog ) => {
				return siteArray.includes( blog.id );
			} );
			// const selectedSites = [];
			const filteredSites = blogs.filter( ( blog ) => {
				const blogLabel = `${ blog.name } - ${ blog.path }`;
				return ( blogLabel.toLowerCase().includes( searchInput.toLowerCase() ) && ! siteArray.includes( blog.id ) );
			} ).slice( 0, 5 );
			setQueriedSites( [ ...selectedSites, ...filteredSites ] );
		}
		filterBlogs();
		setIsLoading( false );
	}, [ searchInput ] );

	return (
		<BaseControl
			label={ props.label || ( isMultiSelect ? 'Associated Sites' : 'Associated Site' ) }
			className={ className }
			__nextHasNoMarginBottom
		>
			{ isMultiSelect ? (
				// Multi-select
				<>
				<SearchControl
					className='hpu-associated-site-control--search-input'
					hideLabelFromVision={ true }
					value={ searchInput }
					onChange={ handleSearchInputChange }
					__nextHasNoMarginBottom
				/>
				{ queriedSites && queriedSites.map( ( blog ) => (
					<CheckboxControl
						key={ blog.id }
						label={ `${ blog.name } - ${ blog.path }` }
						onChange={ ( value ) => { handleChange( value, blog.id ) } }
						checked={ siteArray.includes( blog.id ) }
						__nextHasNoMarginBottom
					/>
				) ) }
				{ isLoading && ( <Spinner/> ) }
			</>
			) : (
				// Single-select
				<ComboboxControl
					className='hpu-associated-site-control--combobox'
					value={ siteArray[0] }
					onChange={ ( value ) => { handleChange( value, value ) } }
					onFilterValueChange={ handleSearchInputChange }
					options={ queriedSites.map( ( blog ) => ( { value: blog.id, label: `${ blog.name } - ${ blog.path }` } ) ) }
					__nextHasNoMarginBottom
				/>
			) }
		</BaseControl>
	)
}
