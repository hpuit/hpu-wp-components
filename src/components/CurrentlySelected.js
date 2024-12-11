import { Button, Flex, Card, CardBody, BaseControl } from '@wordpress/components';

export function CurrentlySelected( { label, selectedItem, selectedItems, onRemove } ) {

	// Normalize selectedItems to handle single and multi-select scenarios
	selectedItems = selectedItems || ( selectedItem ? [ selectedItem ] : [] );

	return (
		<BaseControl
			label={ label || 'Currently Selected' }
			className='hpu-component-currently-selected'
			__nextHasNoMarginBottom
		>
			{ selectedItems.length ? selectedItems?.map( ( item ) => (
				<Card key={ item?.id }>
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
