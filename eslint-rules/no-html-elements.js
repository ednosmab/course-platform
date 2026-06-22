/**
 * @fileoverview Forbid raw HTML elements in JSX.
 * Use Tamagui components (YStack, XStack, Text, Button) from @projeto/ui instead.
 */

const FORBIDDEN_ELEMENTS = [
  "div",
  "span",
  "button",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "ul",
  "ol",
  "li",
  "img",
  "input",
  "textarea",
  "select",
  "form",
  "label",
  "table",
  "tr",
  "td",
  "th",
  "thead",
  "tbody",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "nav",
  "main",
];

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid raw HTML elements — use Tamagui components instead",
      category: "Governance",
    },
    schema: [],
    messages: {
      forbidden:
        "HTML element <{{tag}}> is forbidden. Use Tamagui components (YStack, XStack, Text, Button) from @projeto/ui instead.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name;
        if (name && name.type === "JSXIdentifier" && FORBIDDEN_ELEMENTS.includes(name.name)) {
          context.report({
            node,
            messageId: "forbidden",
            data: { tag: name.name },
          });
        }
      },
    };
  },
};
