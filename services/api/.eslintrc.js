module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: ['plugin:@typescript-eslint/recommended', 'airbnb-base'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    rules: {
        // ## Typescript
        // -------------
        '@typescript-eslint/no-unused-vars': ['warn'],

        // ## Import
        // ---------
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never'
            }
        ],
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

        // ## Common
        // ---------
        'comma-dangle': ['error', 'never'],
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-console': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-unused-vars': 'off',
        'max-len': [
            'warn',
            100,
            4,
            {
                ignoreUrls: true,
                ignoreComments: false,
                ignoreRegExpLiterals: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true
            }
        ]
    },
    settings: {
        'import/resolver': {
            typescript: {}
        }
    },
    ignorePatterns: ['build/', 'node_nodules/']
};
