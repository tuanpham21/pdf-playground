import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

const tsConfigs = tseslint.configs['flat/recommended']
const reactConfig = reactPlugin.configs.flat.recommended
const reactHooksConfig = reactHooksPlugin.configs.flat.recommended

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  ...tsConfigs,
  reactConfig,
  reactHooksConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]
