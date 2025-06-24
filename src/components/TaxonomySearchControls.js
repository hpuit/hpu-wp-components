/**
 * Component for rendering associated site controls.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.label] - The label for the control.
 * @param {string} [props.className] - Additional class names for the control.
 * @param {boolean} [props.isMultiSelect] - Whether the control allows multiple selections.
 * @param {string} [props.useSlugs] - Whether to use slugs instead of IDs for taxonomy values.
 * @param {Array} [props.taxArray] - Array of taxonomy IDs (or slugs) to be pre-selected.
 * @param {number} [props.taxID] - Single taxonomy ID (or slug) to be pre-selected.
 * @param {string} [props.apiDomain] - The API domain to fetch taxonomies from.
 * @param {string} [props.apiNameSpace] - The API namespace to use for fetching taxonomies.
 * @param {string} [props.taxType] - The type of taxonomy to filter by.
 * @param {string} [props.blogPath] - The path to the blog.
 * @param {Function} [props.onChange] - Callback function to handle changes.
 */
import { BaseControl, SearchControl, CheckboxControl, ComboboxControl, Spinner } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";

export function TaxonomySearchControls( props ) {

	// States
	const [ isLoading,         setIsLoading         ] = useState( true );
	const [ searchInput,       setSearchInput       ] = useState( '' );
	const [ queriedTaxonomies, setQueriedTaxonomies ] = useState( [] );
	const [ taxArray,          setTaxArray          ] = useState( () => {
		if ( props?.taxArray && Array.isArray( props?.taxArray ) ) {
			return props.taxArray;
		}
		else if ( props?.taxID ) {
			return [ props.taxID ];
		}
		return [];
	} );

	// Consts
	const isMultiSelect = props?.isMultiSelect ?? ( props?.taxArray !== undefined );
	const className     = ( props?.className ? props.className + ' ' : '' ) + 'hpu-directory-department-control';
	const apiDomain     = props?.apiDomain    || window.location.origin;
	const apiNameSpace  = props?.apiNameSpace || 'wp/v2';
	const taxType       = props?.taxType      || null;
	const useSlugs      = props?.useSlugs     || false;
	const onChange      = props?.onChange     || ( () => {} );

	const handleChange = ( value, key ) => {
		let updatedArray;

		if ( value ) {
			updatedArray = addValue( key );
		}
		else {
			updatedArray = removeValue( key );
		}

		const changeValue = isMultiSelect ? updatedArray : updatedArray[0];
		onChange( changeValue );
		setTaxArray( updatedArray );
	}

	const addValue = ( key ) => {
		if ( isMultiSelect && taxArray.includes( key ) ) {
			return;
		}
		const updatedArray = isMultiSelect ? [ ...taxArray, key ] : [ key ];
		return updatedArray;
	}

	const removeValue = ( key ) => {
		const updatedArray = isMultiSelect ? taxArray.filter( ( tax ) => tax !== key ) : [];
		return updatedArray;
	}

	const handleSearchInputChange = ( value ) => {
		setSearchInput( value );
	}

	const getTaxKey = ( tax ) => {
		return useSlugs ? tax.slug : tax.id;
	}

	useEffect( () => {
		setIsLoading( true );
		const fetchTaxonomies = async () => {
			try {
				const queryTaxType = taxType ? `/${ taxType }` : '';
				const querySearch  = searchInput ? `&search=${ encodeURIComponent( searchInput ) }` : '';
				const response     = await fetch( `${ apiDomain }/wp-json/${ apiNameSpace }${ queryTaxType }?per_page=10${ querySearch }` );
				if ( response.ok ) {
					const data = await response.json();
					return data;
				} else {
					console.warn( 'Failed to fetch taxonomies:', response.statusText );
					return [];
				}
			} catch ( error ) {
				console.warn( 'Failed to fetch taxonomies:', error );
				return [];
			}
		}

		const filterTaxonomies = async () => {
			const taxonomies         = await fetchTaxonomies();
			const selectedTaxonomies = taxonomies.filter( ( taxonomy ) => {
				return taxArray.includes( getTaxKey( taxonomy ) );
			} );
			const filteredTaxonomies = taxonomies.filter( ( taxonomy ) => {
				const taxonomyLabel = `${ taxonomy.name }`;
				return ( taxonomyLabel.toLowerCase().includes( searchInput.toLowerCase() ) && ! taxArray.includes( getTaxKey( taxonomy ) ) );
			} ).slice( 0, 10 );
			setQueriedTaxonomies( [ ...selectedTaxonomies, ...filteredTaxonomies ] );
		}
		filterTaxonomies();
		setIsLoading( false );
	}, [ searchInput ] );

	return (
		<BaseControl
			label={ props.label || ( isMultiSelect ? 'Taxonomies' : 'Taxonomy' ) }
			className={ className }
			__nextHasNoMarginBottom
		>
			{ isMultiSelect ? (
				// Multi-select
				<>
					<SearchControl
						className='hpu-taxonomy-search-control--search-input'
						hideLabelFromVision={ true }
						value={ searchInput }
						onChange={ handleSearchInputChange }
						__nextHasNoMarginBottom
					/>
					{ queriedTaxonomies && queriedTaxonomies.map( ( tax ) => (
						<CheckboxControl
							key={ getTaxKey( tax ) }
							label={ `${ tax.name }` }
							onChange={ ( value ) => { handleChange( value, getTaxKey( tax ) ) } }
							checked={ taxArray.includes( getTaxKey( tax ) ) }
							__nextHasNoMarginBottom
						/>
					) ) }
					{ isLoading && ( <Spinner/> ) }
				</>
			) : (
				// Single-select
				<ComboboxControl
					className='hpu-taxonomy-search-control--combobox'
					value={ taxArray[0] }
					onChange={ ( value ) => { handleChange( value, value ) } }
					onFilterValueChange={ handleSearchInputChange }
					options={ queriedTaxonomies.map( ( tax ) => ( { value: getTaxKey( tax ), label: `${ tax.name }` } ) ) }
					__nextHasNoMarginBottom
				/>
			) }
		</BaseControl>
	)
}
