const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Caminho para o app Next.js para carregar next.config.js e arquivos .env
  dir: './',
})

// Adicionar qualquer configuração customizada do Jest abaixo
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js que é assíncrona
module.exports = createJestConfig(customJestConfig)
