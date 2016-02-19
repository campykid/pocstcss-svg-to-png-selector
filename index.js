'use strict';
var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var backgroundImageRegex = /url\('?([^')]+\.svg)'?\)/;

module.exports = postcss.plugin('postcss-svg-to-png-selector', function(options) {
	var fallbackSelector;

	options = options || {};

	fallbackSelector = options.fallbackSelector || '.no-svg';

	return function (css, result) {
		var images = [];

		css.walkRules(function(rule) {
			var backgroundImage;
			var newImage;
			var newRule;
			var newDecl;
			var matchedBackgroundImageDecl;
			var yamoneyProjectPathToNewImage;

			// skip our added rules
			if (rule.selector.indexOf(fallbackSelector) !== -1) {
				return;
			}

			rule.walkDecls(function(decl) {
				var backgroundImageMatch;


				if (decl.prop.match(/^background(-image)?$/)) {
					backgroundImageMatch = backgroundImageRegex.exec(decl.value);

					if (backgroundImageMatch) {
						backgroundImage = backgroundImageMatch[1];
						matchedBackgroundImageDecl = decl;
					}
				}


			});

			if (backgroundImage) {
				newImage = backgroundImage.replace(/\.svg$/, '.png');

				var pathToPng = path.dirname(css.source.input.file) + '/' + newImage;

				var checkExistPng = function() {
					var exists;
					try {
						exists = fs.statSync(pathToPng).isFile();
					} catch (err) {
						exists = false;
					}
					return exists
				}

				if (checkExistPng()) {

					images.push({
						postcssResult: result,
						postcssRule: rule,
						image: backgroundImage,
					});

					newRule = postcss.rule({ selector: fallbackSelector + ' ' + rule.selector });
					newRule.source = rule.source;

					newDecl = postcss.decl({
						prop: 'background-image',
						value: 'url(' + newImage + ')',
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
