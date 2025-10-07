// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';

const importOrder = {
  'import/order': [
    'error',
    {
      groups: [
        ['parent', 'sibling', 'index'],
        'builtin',
        'external',
        'internal',
        ['object', 'unknown'],
        'type',
      ],
      pathGroups: [
        {
          pattern: 'core/**',
          group: 'parent',
        },
        {
          pattern: 'node_modules/**',
          group: 'external',
        },
        {
          pattern: 'modules/**',
          group: 'internal',
        },
        {
          pattern: 'gateways/**',
          group: 'internal',
        },
        {
          pattern: 'controllers/**',
          group: 'internal',
        },
        {
          pattern: 'services/**',
          group: 'internal',
        },
        {
          pattern: 'listeners/**',
          group: 'internal',
        },
        {
          pattern: 'repositories/**',
          group: 'internal',
        },
        {
          pattern: 'models/**',
          group: 'internal',
        },
        {
          pattern: '.*/**',
          group: 'type',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: eslintPluginImport,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',

      ...importOrder,
    },
  },
);
