#!/usr/bin/env node

import path from 'node:path';
import { build } from 'esbuild';
import ts from 'typescript';

const cwd = process.cwd();

async function run() {
  const { tsConfig, tsConfigFile } = getTSConfig();

  await build({
    platform: 'node',
    minify: false,
    target: 'es2020',
    format: 'cjs',
    entryPoints: [...tsConfig.fileNames],
    outdir: path.join(cwd, 'dist'),
    tsconfig: tsConfigFile,
  });
}

function getTSConfig(_tsConfigFile = 'tsconfig.json') {
  const tsConfigFile = ts.findConfigFile(cwd, ts.sys.fileExists, _tsConfigFile);
  if (!tsConfigFile) {
    throw new Error(`tsconfig.json not found in the current directory! ${cwd}`);
  }
  const configFile = ts.readConfigFile(tsConfigFile, ts.sys.readFile);
  const tsConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd);
  return { tsConfig, tsConfigFile };
}

run();
