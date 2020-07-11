const path = require('path');
const chalk = require('chalk');

const isBabelRegister = caller => (
  !!(caller && caller.name === '@babel/register')
);

const moduleResolver = () => (
  ['module-resolver', {
    root: ['./',],
    alias: {
      // Should explicitly define dependencies to
      // resolve them in shared folder
      // TODO: what is needed and what is not?
      ...[
        'webpack',
        'optimize-css-assets-webpack-plugin',
        'webpack-bundle-analyzer',
        'prop-types',
        'react',
        'react-intl',
        'react-redux',
        'deep-freeze',
        // eslint-disable-next-line no-return-assign, no-param-reassign
      ].reduce((acc, x) => ((acc[x] = path.resolve(`./node_modules/${x}`)) && acc), {}),
    },
  }]
);

module.exports = api => {
  if (api.caller(isBabelRegister) && api.env() !== 'test') {
    console.info(chalk.cyan(`babel-register is running under ${api.env()} mode. Babel version ${api.version}.`));
    return {
      presets: ['@babel/preset-env'],
      ignore: [/node_modules/],
      plugins: [
        moduleResolver(),
      ],
    };
  }
  const callerName = api.caller(c => c.name);
  console.info(chalk.cyan(`${callerName} is running under ${api.env()} mode. Babel version ${api.version}.`));
  return {
    // Since babel ignores all files outside the cwd, it does not compile sibling packages
    // So rewrite the ignore list to only include node_modules
    // https://github.com/babel/babel/issues/8309#issuecomment-439406408
    // https://github.com/babel/babel/issues/8731
    // https://github.com/webpack/webpack/issues/4817#issuecomment-365757064
    ignore: ['node_modules', /[\/\\]core-js/, /@babel[\/\\]runtime/],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'entry',
          corejs: 3,
          // forceAllTransforms should be added if uglifyjs plugin is used for minification.
          // https://babeljs.io/docs/en/babel-preset-env#forcealltransforms
          // forceAllTransforms: api.env('production'),
          targets: {
            safari: '10',
            ie: '11',
          },
          // debug: true,
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      // Stage 2
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-throw-expressions',
      // Stage 3
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      '@babel/plugin-proposal-json-strings',
      ['@babel/plugin-transform-runtime', {
        absoluteRuntime: true,
        corejs: false,
        helpers: false, // TODO: setting true breaks superagent
        regenerator: true,
        useESModules: false,
      }],
      'macros',
    ],
    overrides: [
      {
        include: ['./src/**/*.js'],
        exclude: [/node_modules/],
        presets: [
          // This plugin already includes babel-plugin-emotion
          ['@emotion/babel-preset-css-prop', {
            // sourceMap: true, // Enabled by default in development
            autoLabel: true,
            // To have the class names like this `.css-1gkpz4g---V-input---V-normal---V-Input-css`
            labelFormat: '--V-[local]',
          }],
        ],
      }, {
        include: ['./app/node_modules/@hapi/joi', './app/node_modules/@testing-library/user-event'],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: 'commonjs',
              targets: {
                safari: '10',
                ie: '11',
              },
            },
          ],
        ],
        plugins: ['@babel/plugin-transform-arrow-functions'],
      },
    ],
    env: {
      test: {
        exclude: [/node_modules/],
        plugins: [
          'istanbul',
          moduleResolver(),
        ],
        presets: [
          [
            '@babel/preset-env', {
              useBuiltIns: 'entry',
              corejs: 3,
              targets: {
                chrome: '83',
              },
            },
          ],
        ],
      },
    },
  };
};
