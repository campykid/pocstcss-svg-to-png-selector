
'use strict';

var postcss = require('postcss');

var backgroundImageRegex = /url\('?([^')]+\.svg)'?\)/;


module.exports = postcss.plugin('postcss-svg-fallback', function(options) {
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
			}
		});
	};
});
