/**
 * Component for rendering associated site controls.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.label] - The label for the control.
 * @param {string} [props.className] - Additional class names for the control.
 * @param {boolean} [props.isMultiSelect] - Whether the control allows multiple selections.
 * @param {Array} [props.taxArray] - Array of taxonomy IDs to be pre-selected.
 * @param {number} [props.taxID] - Single taxonomy ID to be pre-selected.
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
	// const blogPath      = props?.blogPathnull;
	const apiNameSpace  = props?.apiNameSpace || 'wp/v2';
	const taxType       = props?.taxType      || null;
	const onChange      = props?.onChange     || ( () => {} );

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
		setTaxArray( updatedArray );
	}

	const addValue = ( id ) => {
		if ( isMultiSelect && taxArray.includes( id ) ) {
			return;
		}
		const updatedArray = isMultiSelect ? [ ...taxArray, id ] : [ id ];
		return updatedArray;
	}

	const removeValue = ( id ) => {
		const updatedArray = isMultiSelect ? taxArray.filter( ( value ) => value !== id ) : [];
		return updatedArray;
	}

	const handleSearchInputChange = ( value ) => {
		setSearchInput( value );
	}

	useEffect( () => {
		setIsLoading( true );
		const fetchTaxonomies = async () => {
			try {
				const queryTaxType = taxType ? `/${ taxType }` : '';
				const response = await fetch( `${ apiDomain }/wp-json/${ apiNameSpace }${ queryTaxType }?per_page=10` );
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
				return taxArray.includes( taxonomy.id );
			} );
			const filteredTaxonomies = taxonomies.filter( ( taxonomy ) => {
				const taxonomyLabel = `${ taxonomy.name }`;
				return ( taxonomyLabel.toLowerCase().includes( searchInput.toLowerCase() ) && ! taxArray.includes( taxonomy.id ) );
			} ).slice( 0, 5 );
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
							key={ tax.id }
							label={ `${ tax.name }` }
							onChange={ ( value ) => { handleChange( value, tax.id ) } }
							checked={ taxArray.includes( tax.id ) }
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
					options={ queriedTaxonomies.map( ( tax ) => ( { value: tax.id, label: `${ tax.name }` } ) ) }
					__nextHasNoMarginBottom
				/>
			) }
		</BaseControl>
	)
}
