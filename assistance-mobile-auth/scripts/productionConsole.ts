// Pure-call removal retains argument side effects, unlike esbuild drop: ['console'].
// Copied runtime vendor scripts are not transformed by this configuration.
export const productionConsoleCalls = [
  'log', 'info', 'warn', 'error', 'debug', 'trace', 'table', 'dir', 'dirxml',
  'group', 'groupCollapsed', 'groupEnd', 'time', 'timeLog', 'timeEnd',
  'count', 'countReset', 'assert', 'clear', 'profile', 'profileEnd', 'timeStamp',
].map((method) => `console.${method}`)
