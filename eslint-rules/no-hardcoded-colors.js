/**
 * @fileoverview Forbid hardcoded color values (hex, rgb, rgba).
 * Use Tamagui $color tokens instead.
 */

const COLOR_REGEX = /#[0-9a-fA-F]{3,8}|rgba?\s*\(/;

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid hardcoded color values — use Tamagui $color tokens instead",
      category: "Governance",
    },
    schema: [],
    messages: {
      forbidden:
        "Hardcoded color '{{value}}' is forbidden. Use Tamagui $color tokens (e.g. $color.primary) instead.",
    },
  },
  create(context) {
    return {
      Property(node) {
        const key = node.key;
        if (key && (key.name === "color" || key.name === "backgroundColor")) {
          if (node.value && node.value.type === "Literal" && typeof node.value.value === "string") {
            if (COLOR_REGEX.test(node.value.value)) {
              context.report({
                node: node.value,
                messageId: "forbidden",
                data: { value: node.value.value },
              });
            }
          }
        }
      },
    };
  },
};
