import { Button, Flex, Card, CardBody, BaseControl } from '@wordpress/components';
import './assets/css/CurrentlySelected.scss';

/**
 * CurrentlySelected component.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.label] - The label for the control.
 * @param {Object} [props.selectedItem] - The currently selected item (for single-select scenarios).
 * @param {Object[]} [props.selectedItems] - The list of currently selected items (for multi-select scenarios).
 * @param {Function} props.onRemove - Callback function to handle the removal of an item.
 */

export function CurrentlySelected( { label, selectedItem, selectedItems, onRemove } ) {

	// Normalize selectedItems to handle single and multi-select scenarios
	selectedItems = selectedItems || ( selectedItem ? [ selectedItem ] : [] );

	return (
		<BaseControl
			label={ label || 'Currently Selected' }
			className='hpu-currently-selected'
			__nextHasNoMarginBottom
		>
			{ selectedItems.length ? selectedItems?.map( ( item ) => (
				<Card
					key={ item?.id }
				>
					<CardBody
						size='xSmall'
					>
						<Flex
							justify='space-between'
							align='center'
						>
							<div>{ item?.name }</div>
							<Button
								variant='tertiary'
								size='small'
								isDestructive
								onClick={ () => { onRemove( item?.id ) } }
								aria-label={ `remove ${ item?.name }` }
							>
								X
							</Button>
						</Flex>
					</CardBody>
				</Card>
			) ) : ( null ) }
		</BaseControl>
	)
}
