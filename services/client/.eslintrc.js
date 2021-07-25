module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'airbnb',
        'airbnb/hooks'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 6,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint', 'react'],
    rules: {
        // ## Typescript
        // -------------
        // '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/no-use-before-define': ['error'],

        // ## React
        // --------
        'react/jsx-filename-extension': [
            'warn',
            {
                extensions: ['.tsx']
            }
        ],
        // 'react/jsx-first-prop-new-line': ['error', 'always'],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        // 'react/jsx-max-props-per-line': ['error', {
        //     maximum: 1,
        //     when: 'always'
        // }],
        'react/jsx-props-no-spreading': 'off',
        // 'react/jsx-one-expression-per-line': 'off',
        // 'react/require-default-props': 'off',
        // 'react/prop-types': 'off'

        // ## Import
        // ---------
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never'
            }
        ],
        // 'import/prefer-default-export': 'off',

        // ## Common
        // ---------
        'comma-dangle': ['error', 'never'],
        indent: [
            'error',
            4,
            {
                SwitchCase: 1
            }
        ],
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
        ],
        'no-use-before-define': 'off',
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-unused-vars': 'off',
        'object-property-newline': [
            'error',
            {
                allowAllPropertiesOnSameLine: false
            }
        ]
    },
    settings: {
        'import/resolver': {
            typescript: {}
        },
        react: {
            version: 'detect'
        }
    },
    globals: {
        JSX: true
    },
    ignorePatterns: ['build/', 'node_nodules/', 'src/setupProxy.js']
};
