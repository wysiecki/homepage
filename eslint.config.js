import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        IntersectionObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        screen: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
      },
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['tailwind.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
