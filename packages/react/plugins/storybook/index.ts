import PnpWebpackPlugin from 'pnp-webpack-plugin';
import { Configuration } from 'webpack';
import { StorybookConfig } from './types';
const reactWebpackConfig = require('../webpack');
import { logger } from '@storybook/node-logger';
import { mergePlugins } from './merge-plugins';
import * as mergeWebpack from 'webpack-merge';
import { join } from 'path';
import { getBaseWebpackPartial } from '@nrwl/web/src/utils/config';
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
import * as resolve from 'resolve';
import { existsSync } from 'fs';
import { getWebConfig } from '@nrwl/web/src/utils/web.config';

const CWD = process.cwd();

export const babelDefault = (): Record<
  string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  (string | [string, object])[]
> => ({
  presets: [],
  plugins: [],
});

export const webpack = (
  webpackConfig: Configuration = {},
  options: StorybookConfig
): Configuration => {
  logger.info(
    '=> Loading Nrwl React Webpack configuration "@nrwl/react/plugins/webpack"'
  );

  // const webConfig = getWebConfig();
  const nxReactConfig = reactWebpackConfig(webpackConfig);

  const tsconfigPath = join(CWD, options.configDir, 'tsconfig.json');

  const isEnvDevelopment = true;

  const forkCheckerPlugin = new ForkTsCheckerWebpackPlugin({
    typescript: resolve.sync('typescript', {
      basedir: join(CWD, 'node_modules'),
    }),
    async: isEnvDevelopment,
    checkSyntacticErrors: true,
    resolveModuleNameModule: process.versions['pnp']
      ? `${__dirname}/pnpTs.js`
      : undefined,
    resolveTypeReferenceDirectiveModule: process.versions['pnp']
      ? `${__dirname}/pnpTs.js`
      : undefined,
    tsconfig: tsconfigPath,
    // reportFiles: [
    //   // This one is specifically to match during CI tests,
    //   // as micromatch doesn't match
    //   // '../cra-template-typescript/template/src/App.tsx'
    //   // otherwise.
    //   '../**/src/**/*.{ts,tsx}',
    //   '**/src/**/*.{ts,tsx}',
    //   '!**/src/**/__tests__/**',
    //   '!**/src/**/?(*.)(spec|test).*',
    //   '!**/src/setupProxy.*',
    //   '!**/src/setupTests.*',
    // ],
    silent: true,
    // The formatter is invoked directly in WebpackDevServerUtils during development
    // formatter: isEnvProduction ? typescriptFormatter : undefined,
  });

  const nxForkCheckerPlugin = new ForkTsCheckerWebpackPlugin({
    tsconfig: tsconfigPath,
    memoryLimit:
      // options.memoryLimit ||
      ForkTsCheckerWebpackPlugin.DEFAULT_MEMORY_LIMIT,
    workers: /*options.maxWorkers ||*/ ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
    useTypescriptIncrementalApi: false,
  });

  return {
    ...nxReactConfig,
    plugins: mergePlugins(...(nxReactConfig.plugins || []), forkCheckerPlugin),
  };
};
