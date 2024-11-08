// eslint.config.mjs

import babelParser from '@babel/eslint-parser';
import jest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
        },
        sourceType: 'module',
      },
      globals: {
        jest: 'readonly',
        module: 'readonly',
        process: 'readonly',
        describe: 'readonly',   
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        test: 'readonly',
        require: 'readonly',
        document: 'readonly',
        window: 'readonly',
        exports: 'readonly',    
        next: 'readonly',       
        console: 'readonly',    
        setTimeout: 'readonly', 
        __dirname: 'readonly',  
        beforeAll: 'readonly',  
        afterAll: 'readonly',   
      },
    },
    plugins: {
      jest, 
    },
    rules: {
      'no-undef': 'warn',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
