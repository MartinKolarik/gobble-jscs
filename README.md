# gobble-jscs

Check JavaScript files with gobble and jscs.

## Installation

```bash
npm install gobble-jscs
```

## Usage

```js
gobble('src/js').observe( 'jscs', {
	// string, array, or RegExp
	accept: '.js',
	
	// if `true`, errors will not cause the whole build to fail
	reportOnly: false,

	// custom reporter
	reporter: function (results) {
		// `results` is an array of { file, filePath, errors } objects
	},

	// all other options are jscs options
});
```

If no jscs options are supplied with the second argument, gobble-jscs will use the nearest `.jscsrc` file instead (recommended). See 
the [jscs](http://jscs.info/) website for documentation on the options you can specify.

## License

MIT. Copyright (c) 2015 Martin Kolárik.
