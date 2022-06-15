module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  root: true,
  ignorePatterns: [
    '*.js',
    '/**/node_modules/*',
    '/public/*',
    '/src/util/SvgConverter.js'
  ],
  globals: {
    window: true,
    ht: true,
    tpeditor: true,
    tpeditor3d: true,
    tpeditor_config: true,
    cadToSymbolBoundingType: true,
    cadToDisplayBoundingType: true,
    io: true
  }
}
