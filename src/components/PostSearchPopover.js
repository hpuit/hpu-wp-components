import { useState } from '@wordpress/element';
import { Button, Flex, Popover, Spinner } from '@wordpress/components';
import './assets/css/PostSearchPopover.scss';

export function PostSearchPopover ( props ) {
	const {
		postArray,
		isMultiPost,
		isLoading,
		searchInput,
		queriedPosts,
		handleChange,
		isPopoverOpen,
		closePopover,
		...popoverProps
	} = props;

	return (
		<>
			{ isPopoverOpen && searchInput.length ? (
				<Popover { ...popoverProps }
					className='hpu-component-post-search-popover'
					onClose={ () => { closePopover() } }
				>
					{ isMultiPost && (
						<Flex
							justify='flex-end'
						>
							<Button
								variant='tertiary'
								size='small'
								onClick={ () => { closePopover() } }
								aria-label='Close Search List'
							>X</Button>
						</Flex>
					) }
					<ul
						className='search-results'
						aria-live='polite'
					>
						{ isLoading && <Spinner /> }
						{ queriedPosts.map( ( result ) => (
							<li
								role='button'
								tabIndex={ 0 }
								className={
									`search-result${
										postArray.includes( result.value )
											? ' selected'
											: '' 
									}` 
								}
								key={ result.value }
								onClick={ () => {
									handleChange( result.value );
									if ( ! isMultiPost ) {
										closePopover();
									}
								} }
							>
								{ result.label }
							</li>
						) ) }
						{ ! isLoading && ! queriedPosts.length && (
							<li className="search-result no-results">No Results Found. Sorry.</li>
						) }
					</ul>
				</Popover>
			) : ( null ) }
		</>
	)
}
