const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/src/test/**/*.test.ts"], // <--- Añadido: dónde buscar los tests
  moduleFileExtensions: ["ts", "js", "json", "node"], // <--- Opcional pero útil
  verbose: true, // <--- Para ver qué test pasa/falla
};
