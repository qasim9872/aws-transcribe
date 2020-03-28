const ignoreFiles = ["/node_modules/", "./src/__tests__/utils.ts", "./src/examples", "./src/aws-signature-v4"]
module.exports = {
    testEnvironment: "node",
    modulePaths: ["src"],
    roots: ["<rootDir>/src"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: ignoreFiles,
    coverageDirectory: "<rootDir>/coverage",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
    transform: {
        "\\.(ts|tsx)": "ts-jest",
    },
    testPathIgnorePatterns: ignoreFiles,
    moduleFileExtensions: ["ts", "tsx", "js"],
    verbose: true,
}
