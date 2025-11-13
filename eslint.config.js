const next = require('eslint-config-next');

module.exports = {
  ...next,
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    // React specific rules
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js

    // General code quality rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',

    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // Performance rules
    'react/jsx-no-bind': 'warn',
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],

    // Import rules - disabled for now due to config issues
    'import/no-unresolved': 'off', // Let TypeScript handle this
    // 'import/order': [
    //   'error',
    //   {
    //     groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    //     'newlines-between': 'always',
    //   },
    // ],
  },
};
