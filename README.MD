# svg-color-loader
`svg-color-loader` is a webpack plugin for coloring grayscale svg icons at build time.



## Why

We built this tool because we wanted to use [Sass](https://sass-lang.com/) color variables for svg icons. Additionally, we wanted to use the same icon with varying colors without modifying or duplicating the svg images.

When the tool processes an svg, it coverts black elements to your specified color, grey elements to an appropriate shade of your color and leaves white elements alone.

## Usage

In your sass or css file, you simply provide a path to your svg file, with properties to overwrite:

```scss
  background-image: url('/path/to/my.svg?fill=r|g|b')
```
Which the build steps converts to something like this:
```scss
  background-image: url('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')
```



## SASS/SCSS

For users of sass/scss we recommend using a mixin for generating the url:
```scss
@mixin icon($path-to-svg, $color) {
	background-image: url('#{$path-to-svg}?fill=#{red($color)}|#{green($color)}|#{blue($color)}');
}
```

This also enables a really simple pattern for clickable icon:
```scss
@mixin clickable-icon($path-to-svg, $color) {
	@include icon($path-to-svg, $color);

	&:hover, &:focus {
		@include icon($path-to-svg, darken($color, 3%));
	}

	&:active {
		@include icon($path-to-svg, darken($color, 5%));
	}
}
```



## Install

Include in your `package.json` using the current head commit after the `#`:
``` json
{
    "svg-color-loader": "https://github.com/HighGearSoftware/svg-color-loader.git#_HEAD_COMMIT_HASH_",
}
```



After installing, add a rule to your webpack config.
For example, using inlining:

``` js
{
    rules: [
        {
            test: /\.svg$/,
            oneOf: [
                { type: "asset/inline", resourceQuery: /fill=.*/, use: "svg-color-loader" },
                { type: "asset/inline" } //fallback for svg images that shouldn't be recolored.
            ]
        },
        //...
    ]
}
```



## Supported Properties

At this time, here are all of the properties supported through the query string:

| Name | Required | Syntax                                                       |
| ---- | -------- | ------------------------------------------------------------ |
| Fill | ✔        | `r|g|b` - Where each of the colors is an integer in the range `[0, 255]` |

