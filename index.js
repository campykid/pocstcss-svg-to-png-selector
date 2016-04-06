
'use strict';
var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var backgroundImageRegex = /url\(['"]?(.+\.svg)['"]?\)/;

module.exports = postcss.plugin('postcss-svg-to-png-selector', function (options) {
	var fallbackSelector;
	options = options || {};
	fallbackSelector = options.fallbackSelector || '.no-svg';

	return function (css, result) {
		css.walkRules(function(rule) {
			var backgroundImage;
			var pngImage;
			var newRule;
			var newDecl;
			var matchedBackgroundImageDecl;
			var pathToSourceFile;

			// Skip added rules
			if (rule.selector.indexOf(fallbackSelector) !== -1) {
				return;
			}

			rule.walkDecls(function(decl) {
				var backgroundImageMatch;
				if (decl.prop.match(/^background/)) {
					backgroundImageMatch = decl.value.match(backgroundImageRegex);
					pathToSourceFile = decl.source.input.file;
					if (backgroundImageMatch) {
						backgroundImage = backgroundImageMatch[1];
						matchedBackgroundImageDecl = decl;
					}
				}
			});

			if (backgroundImage) {
				pngImage = backgroundImage.replace(/\.svg/, '.png');
				var pathToPng = path.resolve(path.dirname(pathToSourceFile), pngImage);
				var checkExistPng = function() {
					var exists;
					try {
						exists = fs.statSync(pathToPng).isFile();
					} catch (err) {
						exists = false;
					};
					return exists;
				}

				if (checkExistPng()) {
					newRule = postcss.rule({ selector: fallbackSelector + ' ' + rule.selector });
					newRule.source = rule.source;
					newDecl = postcss.decl({
						prop: 'background-image',
						value: 'url(' + pngImage + ')',
					});
					newDecl.source = matchedBackgroundImageDecl.source;
					newRule.append(newDecl);
					rule.parent.insertAfter(rule, newRule);
				} else {
					return;
				}
			}
		});
	};
});
