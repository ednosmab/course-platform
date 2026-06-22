/**
 * Custom ESLint plugin for governance enforcement.
 * Rules based on FORBIDDEN_OPERATIONS.md and AGENTS.md.
 */

const noLucideReact = require("./no-lucide-react");
const noHtmlElements = require("./no-html-elements");
const noStylesheetCreate = require("./no-stylesheet-create");
const noHardcodedColors = require("./no-hardcoded-colors");

module.exports = {
  rules: {
    "no-lucide-react": noLucideReact,
    "no-html-elements": noHtmlElements,
    "no-stylesheet-create": noStylesheetCreate,
    "no-hardcoded-colors": noHardcodedColors,
  },
};
