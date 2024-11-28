const path = require('path');
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

module.exports = {
	mode: 'production',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'index.js',
		library: '@hpu-wp/components',
		libraryTarget: 'commonjs2',
		globalObject: 'this'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env", "@babel/preset-react"]
					}
				}
			}
		]
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'@wordpress/components': ['wp', 'components'],
		'@wordpress/block-editor': ['wp', 'blockEditor'],
		'@wordpress/blocks': ['wp', 'blocks'],
		'@wordpress/element': ['wp', 'element'],
		'@wordpress/data': ['wp', 'data'],
		'@wordpress/i18n': ['wp', 'i18n']
	},
    plugins: [
        new DependencyExtractionWebpackPlugin(),
    ],
	resolve: {
		extensions: ['.js', '.jsx']
	}
};
