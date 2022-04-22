var { optimize, extendDefaultPlugins } = require("svgo");
var chroma = require("chroma-js");
var { parseQueryString } = require('./util')

module.exports = async function(content) {
	this.cacheable && this.cacheable()
	var callback = this.async()

	var params = parseQueryString(this.resourceQuery)

	// Assert that we have a fill parameter
	if (!params.fill) {
		callback(new Error("No fill parameter provided for SVG: " + this.resourcePath))
		return 
	}
	
	var fillColor = chroma(params.fill.split("|"));
	
	try {
		var result = optimize(content.toString(), {
			plugins: [
				{ 
					name: "preset-default",
					overrides: {
						inlineStyles: {
							onlyMatchedOnce: false,
						}
					}
				},
				{
					name: "convertStyleToAttrs",
				},
				{
					name: "ReFillColors",
					type: "perItem",
					fn: function(item) {
						if (item.isElem(["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"])) {
							const currValue = item.attr("fill");
							let computed = fillColor;
	
							if (!!currValue) {
								const [h,s,l] = fillColor.hsl()
								const currColorLightness = chroma(currValue.value).hsl()[2];

								// Take the hue and saturation values from the requested color and then calculate the correct lightness.
								// To do that, we need to invert the lightness value (which is 0.0 - 1.0) so that has the correct multiplicative properties:
								//   - we want black -> color requested (identity property)
								//   - we want white -> white (zero multiplication property)
								// However, this requires inverting the scale because it's normally black = 0, white = 1 and we want black = 1, white = 0.
								// Since we've inverted the scale, we have to undo that again as the final step as well.
								computed = chroma.hsl(h, s, 1 - ((1 - l) * (1 - currColorLightness)));
							}
			
							item.addAttr({ name: "fill", value: computed.hex(), prefix: "", local: "fill" });
						}
					}
				},
				{
					name: "ViewBoxToWidthHeight",
					type: "perItem",
					fn: function(item) {
						//A lot of code here came from: https://github.com/svg/svgo/blob/master/plugins/removeViewBox.js
						var regViewBox = /^0\s0\s([\-+]?\d*\.?\d+([eE][\-+]?\d+)?)\s([\-+]?\d*\.?\d+([eE][\-+]?\d+)?)$/;
						if (item.isElem("svg") && item.hasAttr("viewBox")) {
							var match = item.attr("viewBox").value.match(regViewBox);
							if (match) {
								var width = match[1];
								var height = match[3];
					
								item.addAttr({ name: "width", value: width, prefix: "", local: "width" });
								item.addAttr({ name: "height", value: height, prefix: "", local: "height" });
				
								item.removeAttr("viewBox");
							}
						}
					}
				},
			]
		})
	
		callback(null, result.data)
	} catch (e) {
		callback(e)
	}
}

module.exports.raw = true;
