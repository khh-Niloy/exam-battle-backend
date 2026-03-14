"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    moduleFileExtensions: ["ts", "js", "json"],
    testMatch: ["**/*.test.ts", "**/*.spec.ts"],
    clearMocks: true,
};
exports.default = config;
