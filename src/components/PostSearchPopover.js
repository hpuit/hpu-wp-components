import { Spinner, Popover } from '@wordpress/components';

export function PostSearchPopover (
{
    isLoading,
    queriedPosts,
    handleChange,
    setIsPopoverOpen,
    ...popoverProps
} ) {
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