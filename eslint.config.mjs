import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    // Оригиналы заказчика и артефакты сборки линтер не трогает.
    // next-env.d.ts генерируется сборкой — правится не он, а конфиг Next.
    ignores: ['_source/**', '_inbox/**', '.next/**', '.scratch/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default config;
