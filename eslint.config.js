import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Game-feel rule (GDD 10.5): every interactive element must go through the feel kit.
// Raw <button> elements and pointer handlers on plain DOM elements are only allowed
// inside src/ui/feel/, where the instrumented primitives live.
const rawInteractionRestrictions = [
  {
    selector: "JSXOpeningElement[name.name='button']",
    message: 'Use Pressable or Button95 from the feel kit instead of a raw <button>.',
  },
  {
    selector:
      'JSXOpeningElement[name.name=/^[a-z]/] > JSXAttribute[name.name=/^on(Click|PointerDown|PointerUp|MouseDown|MouseUp)$/]',
    message: 'Pointer handlers on DOM elements are not instrumented. Use a feel-kit primitive.',
  },
];

// Engine purity rule (GDD 8.2 / 10.4): no DOM, no wall clock, no Math.random in src/engine/.
const engineRestrictions = [
  { name: 'window', message: 'The engine must not touch the DOM.' },
  { name: 'document', message: 'The engine must not touch the DOM.' },
  { name: 'performance', message: 'Use the injected Clock.' },
];

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-syntax': ['error', ...rawInteractionRestrictions],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['src/ui/feel/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', ...engineRestrictions],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'Use the injected Clock.' },
        { object: 'Math', property: 'random', message: 'Use the seeded Rng.' },
      ],
    },
  },
  {
    files: ['tools/**/*.ts', 'tests/**/*.ts', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
