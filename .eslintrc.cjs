module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    parserOptions: {
        tsconfigRootDir: ".",
        project: "tsconfig.json",
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
        "plugin:unicorn/all",
        "prettier",
    ],
    rules: {
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "unicorn/catch-error-name": [
            "error",
            {
                name: "exception",
                ignore: [/^error/i, /error$/i, /^exception/i, /exception$/i],
            },
        ],
    },
};
