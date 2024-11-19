import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
    { ignores: ['dist/', 'src/__generated__/'] },
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    { languageOptions: { globals: globals.browser } },
    {
        plugins: {
            jsdoc
        },
        rules: {
            'jsdoc/require-jsdoc': ['error', { publicOnly: true }]
        }
    },
    {
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
            semi: ['error']
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended
];
