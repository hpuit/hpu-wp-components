import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { PostSearchControls } from '../PostSearchControls';

global.IS_REACT_ACT_ENVIRONMENT = true;

const flush = async () => {
	for ( let i = 0; i < 5; i++ ) {
		await act( async () => {
			await Promise.resolve();
		} );
	}
};

const type = async ( input, value ) => {
	const setter = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		'value'
	).set;
	await act( async () => {
		setter.call( input, value );
		input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
	} );
};

const respond = ( body ) =>
	Promise.resolve( { ok: true, json: () => Promise.resolve( body ) } );

let container;
let root;

beforeEach( () => {
	jest.useFakeTimers();
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	root = createRoot( container );
} );

afterEach( () => {
	act( () => root.unmount() );
	container.remove();
	jest.useRealTimers();
	delete global.fetch;
} );

const mount = async ( props = {} ) => {
	await act( async () => {
		root.render(
			<PostSearchControls
				blogPath="/"
				apiDomain="https://example.test"
				apiNameSpace="hpu/v1/directory"
				postID={ 0 }
				onChange={ () => {} }
				{ ...props }
			/>
		);
	} );
	return container.querySelector( 'input' );
};

describe( 'PostSearchControls', () => {
	test( 'the debounced search sends the value just typed', async () => {
		global.fetch = jest.fn( () => respond( [] ) );
		const input = await mount();

		await type( input, 'S' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await flush();
		await type( input, 'Sm' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await flush();

		const urls = global.fetch.mock.calls.map( ( call ) => call[ 0 ] );
		expect( urls ).toEqual( [
			'https://example.test/wp-json/hpu/v1/directory?search=S&per_page=20',
			'https://example.test/wp-json/hpu/v1/directory?search=Sm&per_page=20',
		] );
	} );

	test( 'typing fast sends one request, for the last value', async () => {
		global.fetch = jest.fn( () => respond( [] ) );
		const input = await mount();

		await type( input, 'b' );
		await type( input, 'bi' );
		await type( input, 'bio' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await flush();

		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
		expect( global.fetch.mock.calls[ 0 ][ 0 ] ).toContain( '?search=bio&' );
	} );

	test( 'results show inside the control, title-less results included', async () => {
		global.fetch = jest.fn( () =>
			respond( [
				{ id: 11, title: { rendered: 'Jane Smith' } },
				{ id: 12, name: 'No Title Person' },
			] )
		);
		const input = await mount();

		await type( input, 'Smith' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await flush();

		const items = container.querySelectorAll(
			'.hpu-post-search-control--results .search-result--button'
		);
		expect( Array.from( items ).map( ( el ) => el.textContent ) ).toEqual( [
			'Jane Smith',
			'No Title Person',
		] );
		// Nothing is rendered outside the control (no popover slot or portal).
		expect(
			document.body.querySelectorAll( '.search-result' ).length
		).toBe( container.querySelectorAll( '.search-result' ).length );
	} );

	test( 'a slow earlier response never replaces the newer results', async () => {
		let resolveFirst;
		global.fetch = jest
			.fn()
			.mockImplementationOnce(
				() => new Promise( ( r ) => ( resolveFirst = r ) )
			)
			.mockImplementationOnce( () =>
				respond( [ { id: 2, title: { rendered: 'Newer' } } ] )
			);
		const input = await mount();

		await type( input, 'Ol' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await type( input, 'New' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await flush();
		await act( async () => {
			resolveFirst( {
				ok: true,
				json: () =>
					Promise.resolve( [
						{ id: 1, title: { rendered: 'Older' } },
					] ),
			} );
		} );
		await flush();

		const labels = Array.from(
			container.querySelectorAll( '.search-result--button' )
		).map( ( el ) => el.textContent );
		expect( labels ).toEqual( [ 'Newer' ] );
	} );

	test( 'picking a result calls onChange with its id', async () => {
		const biology = { id: 42, title: { rendered: 'Biology' } };
		global.fetch = jest.fn( ( url ) =>
			respond( url.endsWith( '/42' ) ? biology : [ biology ] )
		);
		const onChange = jest.fn();
		const input = await mount( {
			onChange,
			postID: undefined,
			postArray: [],
		} );

		await type( input, 'Bio' );
		await act( async () => jest.advanceTimersByTime( 600 ) );
		await flush();
		await act( async () => {
			container.querySelector( '.search-result--button' ).click();
		} );

		expect( onChange ).toHaveBeenCalledWith( [ 42 ] );
		await flush();
		expect(
			container.querySelector( '.hpu-currently-selected' ).textContent
		).toContain( 'Biology' );
	} );
} );
