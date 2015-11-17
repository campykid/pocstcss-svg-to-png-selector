# pocstcss-svg-to-png-selector [![Build Status](https://secure.travis-ci.org/justim/postcss-svg-fallback.png)](https://travis-ci.org/justim/postcss-svg-fallback)

> This plugin  automatically writes CSS rule with fallback selector, built on top of the [PostCSS] ecosystem.

## Usage


Here a way to add [PostCSS] plugin to [project-stub](https://github.com/bem/project-stub) configuration:

```js

	// postCss
	[require('enb-bundle-postcss/techs/enb-bundle-postcss'), {
		source: '?.post.css',
		sourcemap: true,
		plugins: [require('postcss-svg-fallback')({
			fallbackSelector: '.no-svg'
		})]
	}]


```


Converts this:

```css
.icon {
	background: url(images/sun-is-shining.svg) no-repeat;
}
```

to this:

```css
.icon {
	/* original declarations are untouched */
	background: url(images/sun-is-shining.svg) no-repeat;
}

/* same selector, but with a prefix */
.no-svg .icon {
	background-image: url(images/sun-is-shining.png);
}
```
[PostCSS]: https://github.com/postcss/postcss

