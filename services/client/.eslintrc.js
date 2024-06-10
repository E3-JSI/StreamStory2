module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'airbnb',
        'airbnb/hooks',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'react'],
    rules: {
        // ## Typescript
        // -------------
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],

        // ## React
        // --------
        'react/jsx-filename-extension': [
            'warn',
            {
                extensions: ['.tsx'],
            },
        ],
        'react/jsx-props-no-spreading': 'off',
        // 'react/jsx-no-bind': 'off',

        // ## Import
        // ---------
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
            },
        ],

        // ## Common
        // ---------
        'no-use-before-define': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-shadow': 'off',
        'no-unused-vars': 'off',
    },
    settings: {
        'import/resolver': {
            typescript: {},
        },
        react: {
            version: 'detect',
        },
    },
    globals: {
        JSX: true,
    },
    ignorePatterns: ['build/', 'node_nodules/', 'src/setupProxy.js'],
};
