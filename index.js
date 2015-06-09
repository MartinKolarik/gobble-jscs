var path = require('path');
var Checker = require('jscs');
var sander = require('sander');
var findup = require('findup-sync');

var jscsRC = findup('.jscsrc');
var defaults = {};

if (jscsRC) {
	try {
		defaults = JSON.parse(sander.readFileSync(jscsRC).toString());
	} catch (err) {
		throw new Error('Could not parse .jscsrc.');
	}
}

module.exports = function jscs (inputDir, options) {
	var log = this.log;
	var accept = options.accept || '.js';
	var reportOnly = !!options.reportOnly;
	var reporter = options.reporter || defaultReporter;
	var reports = [];
	var checker;

	delete options.accept;
	delete options.reporter;
	delete options.reportOnly;

	if (!Object.keys(options).length) {
		options = defaults;
	}

	checker = new Checker(options);

	checker.getConfiguration().registerDefaultRules();
	checker.configure(options);

	return sander.lsr(inputDir).then(function (files) {
		return files.filter(function (file) {
			if (!Array.isArray(accept)) {
				accept = [ accept ];
			}

			return accept.some(function (accept) {
				return typeof accept === 'string'
					? ~file.indexOf(accept, file.length - accept.length)
					: accept.test(file);
			});
		}).reduce(function (current, file) {
			return current.then(function () {
				var filePath = path.join(inputDir, file);
				log('Linting %s.', file);

				return checker.checkFile(filePath)
					.then(function (results) {

						if (results._errorList.length) {
							reports.push({
								file: file,
								errors: results._errorList,
								filePath: filePath,
							});
						}
					});
			});
		}, sander.Promise.resolve());
	}).then(function () {
		if (reports.length) {
			reporter(reports);

			if (!reportOnly) {
				throw new Error( 'Linting failed.' );
			}
		}
	});
};

function defaultReporter(reports) {
	reports.forEach(function (report) {
		report.errors.forEach(function (error) {
			console.log('%s: line %d, col %d, %s.', report.filePath, error.line, error.column, error.message);
		});
	});
}
