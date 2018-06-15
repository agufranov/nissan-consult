module.exports = function (wallaby) {
    return {
        files: [
            './**/*.ts',
            './**/*.tsx',
        ],

        tests: [
            './**/*.spec.js',
            './**/*.spec.ts',
        ],
        compilers: {
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                module: 'commonjs',// jscs:ignore
                jsx: 'React'
            })
        },
        env: {
            type: 'node'
        }
    };
};