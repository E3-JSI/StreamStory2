module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
    },
    extends: ['plugin:@typescript-eslint/recommended', 'airbnb-base', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        // ## Typescript
        // -------------
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],

        // ## Import
        // ---------
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
            },
        ],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

        // ## Common
        // ---------
        'no-console': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-shadow': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
    },
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
    ignorePatterns: ['build/', 'node_nodules/'],
};
