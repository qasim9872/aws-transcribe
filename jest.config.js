module.exports = {
    testEnvironment: "node",
    modulePaths: ["src"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: ["/node_modules/", "./src/aws-signature-v4"],
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
    testPathIgnorePatterns: ["/node_modules/", "./src/__tests__/utils.ts"],
    moduleFileExtensions: ["ts", "tsx", "js"],
    verbose: true,
}
