module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { esmodules: false, node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
