import {
	stripSlashes,
	buildSearchQuery,
	resultLabel,
	toResultOptions,
} from '../utils/postSearch';

describe( 'postSearch helpers', () => {
	test( 'stripSlashes trims both ends', () => {
		expect( stripSlashes( '/law/' ) ).toBe( 'law' );
		expect( stripSlashes( '//law//' ) ).toBe( 'law' );
		expect( stripSlashes( '/' ) ).toBe( '' );
		expect( stripSlashes( undefined ) ).toBe( '' );
	} );

	test( 'buildSearchQuery sends the typed term, encoded', () => {
		expect( buildSearchQuery( 'nursing' ) ).toBe(
			'?search=nursing&per_page=20'
		);
		expect( buildSearchQuery( 'R&D 101' ) ).toBe(
			'?search=R%26D%20101&per_page=20'
		);
		expect( buildSearchQuery( '' ) ).toBe( '?per_page=20&orderby=date' );
	} );

	test( 'resultLabel reads a title, then a name, without throwing', () => {
		expect( resultLabel( { title: { rendered: 'Biology' } } ) ).toBe(
			'Biology'
		);
		expect(
			resultLabel( { title: { rendered: '' }, name: 'Alumni' } )
		).toBe( 'Alumni' );
		expect( resultLabel( { name: 'Alumni' } ) ).toBe( 'Alumni' );
		expect( resultLabel( {} ) ).toBe( 'Untitled' );
	} );

	test( 'toResultOptions maps results and ignores bad bodies', () => {
		expect(
			toResultOptions( [
				{ id: 4, title: { rendered: 'A' } },
				{ id: 5, name: 'B' },
				null,
			] )
		).toEqual( [
			{ label: 'A', value: 4 },
			{ label: 'B', value: 5 },
		] );
		expect( toResultOptions( { code: 'rest_error' } ) ).toEqual( [] );
	} );
} );
