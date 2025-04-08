import { Button, Flex, Card, CardBody, BaseControl } from '@wordpress/components';
import './assets/css/CurrentlySelected.scss';

/**
 * CurrentlySelected component.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.label] - The label for the control.
 * @param {string} [props.className] - Additional class names for the control.
 * @param {string} [props.type] - The type of media (image or video).
 * @param {string} [props.typeLabel] - The label for the type of media.
 * @param {boolean} [props.allowUrl] - Whether to allow URL input.
 * @param {string} [props.mediaUrl] - The URL of the media item.
 * @param {Function} [props.onChange] - Callback function to handle changes.
 * @param {Function} [props.onClear] - Callback function to handle clearing the selection.
 */

export function MediaSelector( props ) {
	const label        = props?.label     || 'Media Selector';
	const type         = props?.type      || 'image';
	const typeLabel    = props?.typeLabel || type.charAt( 0 ).toUpperCase() + type.slice( 1 );
	const allowUrl     = props?.allowUrl  || false;
	const mediaUrl     = props?.mediaUrl  || 'mediaUrl';
	const fileName     = mediaUrl ? mediaUrl.split( '/' ).pop() : '';
	const handleChange = ( newValue ) => {
		if ( 'function' === typeof props.onChange ) {
			props.onChange( newValue );
		}
	};
	const handleClear = () => {
		if ( 'function' === typeof props.onClear ) {
			props.onClear();
		}
	};
	const urlDialog = () => {
		alert( 'URL dialog not implemented yet' );
	}

	return (
		<BaseControl
			label={ label || '' }
			className='hpu-media-uploader'
			__nextHasNoMarginBottom
		>
			<VStack>
				{ mediaUrl ? (
					<>
						<Tooltip
							text={ fileName }
						>
							{ 'image' === type ? (
								<img
									src={ mediaUrl }
									alt={ fileName }
									style={ {
										height: '200px',
										width: 'auto',
										marginRight: 'auto',
									} }
								/>
							) : (
								<video
									muted
									src={ mediaUrl }
									alt={ fileName }
									style={ {
										height: '200px',
										width: 'auto',
										marginRight: 'auto',
									} }
								/>
							) }
						</Tooltip>
						<a href={ mediaUrl } target="_blank">{ fileName }</a>
						<div>
							<Button
								variant='secondary'
								onClick={ handleClear }
							>Replace</Button>
						</div>
					</>
				) : (
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( mediaUrl ) => {
								handleChange( mediaUrl );
							} }
							accept={ `${ type }/*` }
							allowedTypes={ [ type ] }
							render={ ( { open } ) => (
								<>
									<FormFileUpload
										label={ `Upload ${ typeLabel }` }
										onChange={ open }
										variant='primary'
									>
										{ `Upload ${ typeLabel }` }
									</FormFileUpload>
									<div>
										<Button
											variant='secondary'
											onClick={ open }
										>{ 'Media Library' }</Button>
									</div>
								</>
							) }
						/>
						{ allowUrl && (
							<div>
								<Button
									variant='secondary'
									onClick={ urlDialog }
								>Insert from URL</Button>
							</div>
						) }
					</MediaUploadCheck>
				) }
			</VStack>
		</BaseControl>
	)
}
