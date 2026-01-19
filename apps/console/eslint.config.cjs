const nextEslintPluginNext = require('@next/eslint-plugin-next');
const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.js');

module.exports = [
  { plugins: { '@next/next': nextEslintPluginNext } },

  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*'],
  },
];
