const path = require('path');
const fs = require('fs');
const less = require('less');

let allCssProp = ["animation-delay", "animation-direction", "animation-duration", "animation-fill-mode", "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function", "background-attachment", "background-blend-mode", "background-clip", "background-color", "background-image", "background-origin", "background-position", "background-repeat", "background-size", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-collapse", "border-image-outset", "border-image-repeat", "border-image-slice", "border-image-source", "border-image-width", "border-left-color", "border-left-style", "border-left-width", "border-right-color", "border-right-style", "border-right-width", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width", "bottom", "box-shadow", "box-sizing", "break-after", "break-before", "break-inside", "caption-side", "clear", "clip", "color", "content", "cursor", "direction", "display", "empty-cells", "float", "font-kerning", "font-size", "font-stretch", "font-style", "font-variant", "font-variant-ligatures", "font-variant-caps", "font-variant-numeric", "font-weight", "height", "image-rendering", "isolation", "justify-items", "justify-self", "left", "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type", "margin-bottom", "margin-left", "margin-right", "margin-top", "max-height", "max-width", "min-height", "min-width", "mix-blend-mode", "object-fit", "object-position", "offset-distance", "offset-path", "offset-rotate", "offset-rotation", "opacity", "orphans", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow-anchor", "overflow-wrap", "overflow-x", "overflow-y", "padding-bottom", "padding-left", "padding-right", "padding-top", "pointer-events", "position", "resize", "right", "speak", "table-layout", "tab-size", "text-align", "text-align-last", "text-decoration", "text-decoration-line", "text-decoration-style", "text-decoration-color", "text-decoration-skip", "text-underline-position", "text-indent", "text-rendering", "text-shadow", "text-size-adjust", "text-overflow", "text-transform", "top", "touch-action", "transition-delay", "transition-duration", "transition-property", "transition-timing-function", "unicode-bidi", "vertical-align", "visibility", "white-space", "widows", "width", "will-change", "word-break", "word-spacing", "word-wrap", "z-index", "zoom", "-webkit-appearance", "backface-visibility", "-webkit-background-clip", "-webkit-background-origin", "-webkit-border-horizontal-spacing", "-webkit-border-image", "-webkit-border-vertical-spacing", "-webkit-box-align", "-webkit-box-decoration-break", "-webkit-box-direction", "-webkit-box-flex", "-webkit-box-flex-group", "-webkit-box-lines", "-webkit-box-ordinal-group", "-webkit-box-orient", "-webkit-box-pack", "-webkit-box-reflect", "column-count", "column-gap", "column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "align-content", "align-items", "align-self", "flex-basis", "flex-grow", "flex-shrink", "flex-direction", "flex-wrap", "justify-content", "-webkit-font-smoothing", "grid-auto-columns", "grid-auto-flow", "grid-auto-rows", "grid-column-end", "grid-column-start", "grid-template-areas", "grid-template-columns", "grid-template-rows", "grid-row-end", "grid-row-start", "grid-column-gap", "grid-row-gap", "-webkit-highlight", "hyphens", "-webkit-hyphenate-character", "-webkit-line-break", "-webkit-line-clamp", "-webkit-locale", "-webkit-margin-before-collapse", "-webkit-margin-after-collapse", "-webkit-mask-box-image", "-webkit-mask-box-image-outset", "-webkit-mask-box-image-repeat", "-webkit-mask-box-image-slice", "-webkit-mask-box-image-source", "-webkit-mask-box-image-width", "-webkit-mask-clip", "-webkit-mask-composite", "-webkit-mask-image", "-webkit-mask-origin", "-webkit-mask-position", "-webkit-mask-repeat", "-webkit-mask-size", "order", "perspective", "perspective-origin", "-webkit-print-color-adjust", "-webkit-rtl-ordering", "shape-outside", "shape-image-threshold", "shape-margin", "-webkit-tap-highlight-color", "-webkit-text-combine", "-webkit-text-decorations-in-effect", "-webkit-text-emphasis-color", "-webkit-text-emphasis-position", "-webkit-text-emphasis-style", "-webkit-text-fill-color", "-webkit-text-orientation", "-webkit-text-security", "-webkit-text-stroke-color", "-webkit-text-stroke-width", "transform", "transform-origin", "transform-style", "-webkit-user-drag", "-webkit-user-modify", "user-select", "-webkit-writing-mode", "-webkit-app-region", "buffered-rendering", "clip-path", "clip-rule", "mask", "filter", "flood-color", "flood-opacity", "lighting-color", "stop-color", "stop-opacity", "color-interpolation", "color-interpolation-filters", "color-rendering", "fill", "fill-opacity", "fill-rule", "marker-end", "marker-mid", "marker-start", "mask-type", "shape-rendering", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width", "alignment-baseline", "baseline-shift", "dominant-baseline", "text-anchor", "writing-mode", "vector-effect", "paint-order", "d", "cx", "cy", "x", "y", "r", "rx", "ry", "caret-color"]
allCssProp = allCssProp.concat('list-style', 'margin', 'padding', 'background', 'font-size', 'border', 'overflow', 'transition');
allCssProp = allCssProp.concat('-o-.+', '-ms-.+', '-moz-.+', '-webkit-.+', 'border-.+', 'margin-.+');
const nonFontFamilyCssProps = allCssProp.filter(prop => !/font(-family)?\s*:/.test(prop));
const otherCssPropReg = new RegExp(`^\\s*(${nonFontFamilyCssProps.join('|')})\s*:.+\\r?\\n`, 'mg');

const findFamily = (content) => {
  const arr = [];
  const STATE = {
    WAIT_FONT_PROP: 1,
    MATCH_FONT_PROP: 2,
  };
  let state = STATE.WAIT_FONT_PROP;
  const startCurlyStack = [];
  let lastTopBlockEndIndex = -1;
  let index = 0;
  const len = content.length;

  const reg = /font(-family):/g;
  let regResult;
  let toBreak = false;
  while ((regResult = reg.exec(content))) {
    const matchIndex = regResult.index;
    while (index < len) {
      if (toBreak) {
        toBreak = false;
        break;
      }
      if (index === matchIndex) {
        state = STATE.MATCH_FONT_PROP;
      }
      const ch = content[index];
      if (ch === '{') {
        startCurlyStack.push(index)
      } else if (ch === '}') {
        startCurlyStack.pop()
        if (startCurlyStack.length === 0) {
          if (state === STATE.MATCH_FONT_PROP) {
            const strTopBlock = content.substring(lastTopBlockEndIndex + 1, index + 1);
            if (strTopBlock.indexOf('@font-face') === -1) {
              arr.push(strTopBlock);
            }
            toBreak = true;
            state = STATE.WAIT_FONT_PROP
          }
          lastTopBlockEndIndex = index;
        }
      }
      index++;
    }
  }
  return arr;
};

const filename = __dirname + '/theme-ui/less/main.less';
const content = fs.readFileSync(filename).toString();
less.render(content, {
  filename: filename
}).then(({ css }) => {
  let result = css;
  // result = result.replace(/\/\*.+?\*\/[\r\n]*/g, '');
  // result = result.replace(/@import.*[\r\n]*/g, '')
  let blocks = findFamily(result).map(block => {
    let filteredStrBlock = block.replace(otherCssPropReg, '')
    filteredStrBlock = filteredStrBlock.replace(/[^{}]+{\r?\n\s*}/mg, '');
    if (/font-family\s*:\s*['"]?(line-icons|FontAwesome|weather|.*icon.*)['"]?/i.test(filteredStrBlock)) {
      return ''
    }
    filteredStrBlock = filteredStrBlock.replace(/font-family\s*:\s*([^!}]+)\s*(!important)?/g, (match, val, strImportant) => {
      return `font-family: @font-family${strImportant || ''};`;
    });
    return filteredStrBlock;
  });
  fs.writeFileSync(
    path.join(__dirname, 'font-override-auto-gen-dont-edit.less'),
    '@import "var.less";\n' + blocks.join('\n')
  );
});



