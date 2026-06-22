/**
 * @fileoverview Forbid StyleSheet.create() in React Native / Expo projects.
 * Use Tamagui styling instead.
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid StyleSheet.create() — use Tamagui styling instead",
      category: "Governance",
    },
    schema: [],
    messages: {
      forbidden:
        "StyleSheet.create() is forbidden. Use Tamagui styling (styled, variants, HOC) instead.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "StyleSheet" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "create"
        ) {
          context.report({
            node,
            messageId: "forbidden",
          });
        }
      },
    };
  },
};
