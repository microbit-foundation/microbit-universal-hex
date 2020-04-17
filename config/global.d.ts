// ============================
// extend existing types
// ============================

// ============================
// Rollup plugins without types
// ============================
type RollupPluginImpl<O extends object = object> = import('rollup').PluginImpl<
  O
>;

declare module 'rollup-plugin-sourcemaps' {
  const plugin: RollupPluginImpl;
  export default plugin;
}

// =====================∫
// missing library types
// =====================

// ts-jest types require 'babel__core'
declare module 'babel__core' {
  interface TransformOptions {}
}
