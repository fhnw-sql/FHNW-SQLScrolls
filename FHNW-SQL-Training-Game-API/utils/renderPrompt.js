const Mustache = require('mustache');

// These are the basic HTML entities that are not rendered correctly by Mustache
const htmlUnescapes = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'"
};

/**
 * Render a Mustache template and then un‐escape the 5 basic HTML entities.
 *
 * @param {string} template  The Mustache template string
 * @param {object} view      The data/view to render into the template
 * @returns {string}         The rendered string with &amp;, &lt;, &gt;, &quot;, &#39; all converted back
 */
function renderPrompt(template, view) {
  const rendered = Mustache.render(template, view);

  return rendered.replace(
    /&(amp|lt|gt|quot|#39);/g,
    (_, code) => htmlUnescapes[code]
  );
}

const logger = require("./logger");

module.exports = { renderPrompt };
