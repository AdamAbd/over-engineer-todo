// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Custom rules - Moderate config
  {
    rules: {
      // ===== Vue Rules (Moderate) =====
      'vue/multi-word-component-names': 'off', // Izinkan nama komponen satu kata
      'vue/no-multiple-template-root': 'off', // Vue 3 sudah support multi-root
      'vue/require-default-prop': 'warn', // Warn jika props tidak punya default
      'vue/require-prop-types': 'warn', // Warn jika props tidak punya type
      'vue/no-unused-refs': 'warn',
      'vue/no-useless-v-bind': 'warn',
      'vue/padding-line-between-blocks': 'warn',

      // ===== TypeScript Rules (Moderate) =====
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn, bukan error

      // ===== General Rules (Moderate) =====
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Izinkan console.warn/error
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Handled by @typescript-eslint
      'prefer-const': 'warn',
      'no-var': 'error', // Ini tetap error karena sudah outdated
      eqeqeq: ['warn', 'smart'], // Prefer === tapi izinkan == untuk null checks
      curly: ['warn', 'multi-line'], // Curly braces untuk multi-line
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',

      // ===== Import Rules =====
      'import/order': 'off', // Biarkan Nuxt auto-import handle
      'import/no-duplicates': 'warn',
    },
  }
)
