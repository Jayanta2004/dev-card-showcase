// RoninEngine — utils/logger.js  ·  Levelled console logger with toggle
'use strict';

export const LOG_LEVEL = { NONE: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4 };

let _level = LOG_LEVEL.WARN;
const _prefix = '[RoninEngine]';

export const Logger = {
  setLevel(l) { _level = l; },

  error (...a) { if (_level >= LOG_LEVEL.ERROR) console.error(_prefix, ...a); },
  warn  (...a) { if (_level >= LOG_LEVEL.WARN)  console.warn (_prefix, ...a); },
  info  (...a) { if (_level >= LOG_LEVEL.INFO)  console.log  (_prefix, ...a); },
  debug (...a) { if (_level >= LOG_LEVEL.DEBUG) console.debug(_prefix, ...a); },

  group(label, fn) {
    if (_level < LOG_LEVEL.DEBUG) { fn(); return; }
    console.group(_prefix + ' ' + label);
    fn();
    console.groupEnd();
  },
};
