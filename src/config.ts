export const ignore = [
  '**/build/**/*',
  '**/out/**/*',
  '**/dist/**/*',
  '**/typings',
  '**/out',
  '**/target/**',
  '.vscode',
  '.history'
];

export const ignoreWorkspace = [
  ...ignore,
  '**/node_modules/**/*',
  '**/bower_components/**/*',
  '**/mobile/**/*'
];
