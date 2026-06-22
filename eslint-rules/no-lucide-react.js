/**
 * @fileoverview Forbid direct imports from lucide-react or lucide-react-native.
 * Use <Icon name="IconName" /> from @projeto/ui instead.
 */

const FORBIDDEN_SOURCES = ["lucide-react", "lucide-react-native"];

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid direct imports from lucide-react/lucide-react-native",
      category: "Governance",
    },
    schema: [],
    messages: {
      forbidden:
        "Direct import from '{{source}}' is forbidden. Use <Icon name='{{name}}' /> from @projeto/ui instead.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (FORBIDDEN_SOURCES.includes(source)) {
          node.specifiers.forEach((spec) => {
            context.report({
              node: spec,
              messageId: "forbidden",
              data: {
                source,
                name: spec.local.name,
              },
            });
          });
        }
      },
    };
  },
};
