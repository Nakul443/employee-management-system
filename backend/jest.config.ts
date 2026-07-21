import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '.*/generated/prisma/client\\.js$': '<rootDir>/src/__mocks__/prismaEnums.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;