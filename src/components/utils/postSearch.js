/**
 * Pure helpers for PostSearchControls, kept apart from the component so they
 * can be unit tested without a DOM.
 */

/**
 * Strip leading and trailing slashes.
 *
 * @param {string} string Value to trim.
 * @return {string} The value with no slash at either end.
 */
export const stripSlashes = ( string ) =>
	string?.replace( /^\/+|\/+$/g, '' ) || '';

/**
 * Query string for a search request. The term is the value the editor typed,
 * URL encoded.
 *
 * @param {string} term    Search term.
 * @param {number} perPage Results per request.
 * @return {string} Query string starting with "?".
 */
export const buildSearchQuery = ( term, perPage = 20 ) =>
	term
		? `?search=${ encodeURIComponent( term ) }&per_page=${ perPage }`
		: `?per_page=${ perPage }&orderby=date`;

/**
 * Label for one REST result: a post's rendered title, or a term's name.
 *
 * @param {Object} result REST result.
 * @return {string} Label.
 */
export const resultLabel = ( result ) =>
	result?.title?.rendered || result?.name || 'Untitled';

/**
 * Map a REST response body to { label, value } options.
 *
 * @param {Array} data REST response body.
 * @return {Array} Options.
 */
export const toResultOptions = ( data ) =>
	Array.isArray( data )
		? data
				.filter( ( result ) => result && result.id !== undefined )
				.map( ( result ) => ( {
					label: resultLabel( result ),
					value: result.id,
				} ) )
		: [];
