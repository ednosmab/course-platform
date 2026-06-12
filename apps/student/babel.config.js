module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@tamagui/babel-plugin', {
        components: ['tamagui'],
        config: './node_modules/@projeto/ui/src/tamagui.config.ts',
      }],
    ],
  };
};
