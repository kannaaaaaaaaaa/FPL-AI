var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// worker/utils/storage.js
async function createAnalysisRecord(db, payload) {
  const {
    managerId,
    gameweek,
    executionId,
    status = "pending",
    errorMessage,
    startedAt,
    completedAt,
    modelName,
    tokensInput,
    tokensOutput,
    latencyMs,
    inputSnapshot,
    rawAiOutput,
    result
  } = payload;
  const id = `${managerId}-${gameweek}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(
    `INSERT INTO gameweek_analysis (
        id, manager_id, gameweek, execution_id, status, error_message,
        started_at, completed_at, created_at, updated_at,
        model_name, tokens_input, tokens_output, latency_ms,
        input_snapshot, raw_ai_output, payload
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)
      ON CONFLICT(id) DO UPDATE SET
        execution_id = excluded.execution_id,
        status = excluded.status,
        error_message = excluded.error_message,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at,
        model_name = excluded.model_name,
        tokens_input = excluded.tokens_input,
        tokens_output = excluded.tokens_output,
        latency_ms = excluded.latency_ms,
        raw_ai_output = excluded.raw_ai_output,
        payload = excluded.payload`
  ).bind(
    id,
    managerId,
    gameweek,
    executionId ?? null,
    status,
    errorMessage ?? null,
    startedAt ?? now,
    completedAt ?? null,
    now,
    now,
    modelName ?? "@cf/meta/llama-3.3-70b-instruct",
    tokensInput ?? null,
    tokensOutput ?? null,
    latencyMs ?? null,
    inputSnapshot ? JSON.stringify(inputSnapshot) : "{}",
    rawAiOutput ?? null,
    result ? JSON.stringify(result) : "{}"
  ).run();
  return id;
}
__name(createAnalysisRecord, "createAnalysisRecord");
async function getAnalysisRecord(db, id) {
  const row = await db.prepare(`SELECT * FROM gameweek_analysis WHERE id = ?1`).bind(id).first();
  if (!row) return null;
  return {
    id: row.id,
    managerId: row.manager_id,
    gameweek: row.gameweek,
    executionId: row.execution_id,
    status: row.status,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    modelName: row.model_name,
    tokensInput: row.tokens_input,
    tokensOutput: row.tokens_output,
    latencyMs: row.latency_ms,
    inputSnapshot: JSON.parse(row.input_snapshot ?? "{}"),
    rawAiOutput: row.raw_ai_output,
    result: JSON.parse(row.payload ?? "{}")
  };
}
__name(getAnalysisRecord, "getAnalysisRecord");
async function updateAnalysisStatus(db, id, status, errorMessage = null) {
  const completedAt = status === "completed" || status === "failed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
  await db.prepare(
    `UPDATE gameweek_analysis
       SET status = ?1, error_message = ?2, completed_at = ?3, updated_at = datetime('now')
       WHERE id = ?4`
  ).bind(status, errorMessage, completedAt, id).run();
}
__name(updateAnalysisStatus, "updateAnalysisStatus");

// worker/utils/prompt.js
var OUTPUT_SCHEMA = {
  schema_version: "1.0.0",
  gameweek_review: {
    top_performers: [
      {
        player_name: "string",
        points: "number",
        rationale: "string"
      }
    ],
    honorable_mentions: [
      {
        player_name: "string",
        points: "number",
        note: "string"
      }
    ],
    underperformers: [
      {
        player_name: "string",
        points: "number",
        issue: "string"
      }
    ],
    captain_verdict: "string"
  },
  tactical_form_takeaways: [
    {
      category: "string",
      // e.g., "Team Form", "Positional Trends", "Fixture Difficulty"
      insight: "string",
      actionable: "boolean"
    }
  ],
  transfer_recommendations: {
    transfers_in: [
      {
        player_name: "string",
        position: "string",
        price: "number",
        rationale: "string",
        priority: "string"
        // "high", "medium", "low"
      }
    ],
    transfers_out: [
      {
        player_name: "string",
        position: "string",
        reason: "string",
        urgency: "string"
        // "immediate", "soon", "consider"
      }
    ],
    holds: [
      {
        player_name: "string",
        position: "string",
        justification: "string"
      }
    ]
  }
};
var VALIDATION_RULES = {
  schema_version: /* @__PURE__ */ __name((val) => typeof val === "string" && val.match(/^\d+\.\d+\.\d+$/), "schema_version"),
  gameweek_review: {
    top_performers: /* @__PURE__ */ __name((arr) => Array.isArray(arr) && arr.every(
      (item) => item.player_name && item.points != null && item.rationale
    ), "top_performers"),
    honorable_mentions: /* @__PURE__ */ __name((arr) => Array.isArray(arr), "honorable_mentions"),
    underperformers: /* @__PURE__ */ __name((arr) => Array.isArray(arr), "underperformers"),
    captain_verdict: /* @__PURE__ */ __name((val) => typeof val === "string" && val.length > 0, "captain_verdict")
  },
  tactical_form_takeaways: /* @__PURE__ */ __name((arr) => Array.isArray(arr) && arr.every(
    (item) => item.category && item.insight
  ), "tactical_form_takeaways"),
  transfer_recommendations: /* @__PURE__ */ __name((obj) => obj && Array.isArray(obj.transfers_in) && Array.isArray(obj.transfers_out) && Array.isArray(obj.holds), "transfer_recommendations")
};
function validateOutput(output) {
  const errors = [];
  if (!output || typeof output !== "object") {
    return { valid: false, errors: ["Output must be an object"] };
  }
  if (!output.schema_version || !VALIDATION_RULES.schema_version(output.schema_version)) {
    errors.push("Missing or invalid schema_version");
  }
  if (!output.gameweek_review) {
    errors.push("Missing gameweek_review");
  } else {
    const gr = output.gameweek_review;
    if (!VALIDATION_RULES.gameweek_review.top_performers(gr.top_performers || [])) {
      errors.push("Invalid top_performers format");
    }
    if (!VALIDATION_RULES.gameweek_review.captain_verdict(gr.captain_verdict || "")) {
      errors.push("Missing or empty captain_verdict");
    }
  }
  if (!VALIDATION_RULES.tactical_form_takeaways(output.tactical_form_takeaways || [])) {
    errors.push("Invalid tactical_form_takeaways format");
  }
  if (!VALIDATION_RULES.transfer_recommendations(output.transfer_recommendations || {})) {
    errors.push("Invalid transfer_recommendations format");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
__name(validateOutput, "validateOutput");
function repairOutput(output) {
  const repaired = {
    schema_version: "1.0.0",
    gameweek_review: {
      top_performers: [],
      honorable_mentions: [],
      underperformers: [],
      captain_verdict: "No analysis available"
    },
    tactical_form_takeaways: [],
    transfer_recommendations: {
      transfers_in: [],
      transfers_out: [],
      holds: []
    }
  };
  if (!output || typeof output !== "object") return repaired;
  if (output.gameweek_review) {
    repaired.gameweek_review = { ...repaired.gameweek_review, ...output.gameweek_review };
  }
  if (Array.isArray(output.tactical_form_takeaways)) {
    repaired.tactical_form_takeaways = output.tactical_form_takeaways;
  }
  if (output.transfer_recommendations) {
    repaired.transfer_recommendations = {
      ...repaired.transfer_recommendations,
      ...output.transfer_recommendations
    };
  }
  return repaired;
}
__name(repairOutput, "repairOutput");
var SYSTEM_PROMPT = `You are FPL Matchweek Analyst, an AI assistant specializing in Fantasy Premier League analysis.

You will receive:
- Manager's team picks and squad details
- Gameweek performance data
- Historical trends
- Upcoming fixtures
- User's personal notes

Your task is to generate a structured JSON analysis following this EXACT schema:

${JSON.stringify(OUTPUT_SCHEMA, null, 2)}

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations outside the JSON
2. Include schema_version: "1.0.0" as the first field
3. All player names must match the provided data exactly
4. Points and prices must be numbers, not strings
5. Captain verdict must summarize the captain choice and outcome
6. Tactical takeaways should identify 2-4 key trends or patterns
7. Transfer recommendations should be specific and actionable
8. Priority levels: "high", "medium", "low"
9. Urgency levels: "immediate", "soon", "consider"

Keep analysis:
- Concise (1-2 sentences per point)
- Data-driven (reference specific stats)
- Actionable (clear next steps)
- Professional tone

Return the JSON object directly without any wrapper or formatting.`;

// worker/workflows/analyze.js
import { WorkflowEntrypoint } from "cloudflare:workers";

// worker/utils/retry.js
var RetryableError = class extends Error {
  static {
    __name(this, "RetryableError");
  }
  constructor(message, statusCode = null, retryAfter = null) {
    super(message);
    this.name = "RetryableError";
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    this.retryable = true;
  }
};
var PermanentError = class extends Error {
  static {
    __name(this, "PermanentError");
  }
  constructor(message, statusCode = null) {
    super(message);
    this.name = "PermanentError";
    this.statusCode = statusCode;
    this.retryable = false;
  }
};
function classifyHttpError(status, message = "") {
  if (status >= 500 || status === 429 || status === 408) {
    return new RetryableError(message, status);
  }
  if (message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT") || message.includes("DNS")) {
    return new RetryableError(message);
  }
  if (status >= 400 && status < 500) {
    return new PermanentError(message, status);
  }
  return new RetryableError(message, status);
}
__name(classifyHttpError, "classifyHttpError");
var DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1e3,
  maxDelayMs: 1e4,
  backoffMultiplier: 2,
  jitterMs: 100,
  timeoutMs: 3e4
  // 30 seconds
};
function sleep(ms, jitter = 0) {
  const actualDelay = ms + Math.random() * jitter;
  return new Promise((resolve) => setTimeout(resolve, actualDelay));
}
__name(sleep, "sleep");
function calculateBackoff(attempt, config2) {
  const delay = Math.min(
    config2.initialDelayMs * Math.pow(config2.backoffMultiplier, attempt),
    config2.maxDelayMs
  );
  return delay;
}
__name(calculateBackoff, "calculateBackoff");
async function withRetry(fn, config2 = {}) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config2 };
  let lastError;
  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const result = await withTimeout(fn(), cfg.timeoutMs);
      return result;
    } catch (error3) {
      lastError = error3;
      const classified = error3.retryable !== void 0 ? error3 : classifyHttpError(error3.statusCode || 0, error3.message);
      if (!classified.retryable) {
        throw classified;
      }
      if (attempt === cfg.maxRetries) {
        throw new PermanentError(
          `Failed after ${cfg.maxRetries + 1} attempts: ${classified.message}`,
          classified.statusCode
        );
      }
      const backoffDelay = calculateBackoff(attempt, cfg);
      await sleep(backoffDelay, cfg.jitterMs);
      console.warn(`Retry attempt ${attempt + 1}/${cfg.maxRetries} after ${backoffDelay}ms: ${error3.message}`);
    }
  }
  throw lastError;
}
__name(withRetry, "withRetry");
async function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise(
      (_, reject) => setTimeout(
        () => reject(new RetryableError(`Operation timed out after ${timeoutMs}ms`, 408)),
        timeoutMs
      )
    )
  ]);
}
__name(withTimeout, "withTimeout");
var CircuitBreaker = class {
  static {
    __name(this, "CircuitBreaker");
  }
  constructor(config2 = {}) {
    this.failureThreshold = config2.failureThreshold || 5;
    this.resetTimeoutMs = config2.resetTimeoutMs || 6e4;
    this.state = "CLOSED";
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new PermanentError("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error3) {
      this.onFailure();
      throw error3;
    }
  }
  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }
};
var circuitBreakers = {
  fpl: new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 6e4 }),
  ai: new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 3e4 })
};
async function withCircuitBreaker(fn, service = "default") {
  const breaker = circuitBreakers[service] || circuitBreakers.fpl;
  return breaker.execute(fn);
}
__name(withCircuitBreaker, "withCircuitBreaker");

// worker/utils/fpl.js
var BASE = "https://fantasy.premierleague.com/api";
var TTL = {
  bootstrap: 60 * 5,
  // 5 minutes
  fixtures: 60 * 30,
  // 30 minutes
  player: 60 * 15,
  // 15 minutes
  manager: 60 * 5,
  // 5 minutes
  picks: 60 * 60 * 24
  // 24 hours (picks don't change after deadline)
};
var RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1e3,
  maxDelayMs: 1e4,
  backoffMultiplier: 2,
  jitterMs: 200,
  timeoutMs: 15e3
  // 15 seconds per request
};
async function cachedFetch(env2, key, url, ttlSeconds) {
  const cached = await env2.FPL_CACHE.get(key, "json");
  if (cached) return cached;
  const fetchFn = /* @__PURE__ */ __name(async () => {
    const res = await fetch(url, {
      cf: { cacheTtl: ttlSeconds },
      signal: AbortSignal.timeout(RETRY_CONFIG.timeoutMs)
    });
    if (!res.ok) {
      const error3 = classifyHttpError(
        res.status,
        `FPL API failed for ${url}: ${res.status} ${res.statusText}`
      );
      throw error3;
    }
    return res.json();
  }, "fetchFn");
  const data = await withRetry(
    () => withCircuitBreaker(fetchFn, "fpl"),
    RETRY_CONFIG
  );
  await env2.FPL_CACHE.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
  return data;
}
__name(cachedFetch, "cachedFetch");
async function getBootstrap(env2) {
  return cachedFetch(env2, "bootstrap-static", `${BASE}/bootstrap-static/`, TTL.bootstrap);
}
__name(getBootstrap, "getBootstrap");
async function getFixtures(env2, limit = 5) {
  const data = await cachedFetch(env2, "fixtures", `${BASE}/fixtures/?future=1`, TTL.fixtures);
  return data.slice(0, limit);
}
__name(getFixtures, "getFixtures");
async function getManagerData(env2, managerId) {
  if (!managerId) throw new Error("Manager ID required");
  return cachedFetch(
    env2,
    `manager-${managerId}`,
    `${BASE}/entry/${managerId}/`,
    TTL.manager
  );
}
__name(getManagerData, "getManagerData");
async function getManagerHistory(env2, managerId) {
  if (!managerId) throw new Error("Manager ID required");
  return cachedFetch(
    env2,
    `manager-history-${managerId}`,
    `${BASE}/entry/${managerId}/history/`,
    TTL.manager
  );
}
__name(getManagerHistory, "getManagerHistory");
async function getManagerPicks(env2, managerId, gameweek) {
  if (!managerId) throw new Error("Manager ID required");
  if (!gameweek) throw new Error("Gameweek required");
  return cachedFetch(
    env2,
    `manager-picks-${managerId}-${gameweek}`,
    `${BASE}/entry/${managerId}/event/${gameweek}/picks/`,
    TTL.picks
  );
}
__name(getManagerPicks, "getManagerPicks");
async function getEnrichedPicks(env2, managerId, gameweek) {
  const [picks, bootstrap] = await Promise.all([
    getManagerPicks(env2, managerId, gameweek),
    getBootstrap(env2)
  ]);
  const playerMap = new Map(bootstrap.elements.map((p) => [p.id, p]));
  const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t]));
  return {
    ...picks,
    picks: picks.picks.map((pick) => {
      const player = playerMap.get(pick.element);
      const team = player ? teamMap.get(player.team) : null;
      return {
        ...pick,
        player_name: player ? player.web_name : "Unknown",
        team_name: team ? team.short_name : "Unknown",
        position: pick.position,
        is_captain: pick.is_captain,
        is_vice_captain: pick.is_vice_captain,
        multiplier: pick.multiplier
      };
    })
  };
}
__name(getEnrichedPicks, "getEnrichedPicks");
async function getAnalysisContext(env2, managerId, gameweek) {
  const [managerData, history, picks, bootstrap, fixtures] = await Promise.all([
    getManagerData(env2, managerId),
    getManagerHistory(env2, managerId),
    getEnrichedPicks(env2, managerId, gameweek),
    getBootstrap(env2),
    getFixtures(env2, 5)
  ]);
  const currentGameweek = history.current?.find((gw) => gw.event === gameweek) || bootstrap.events.find((e) => e.id === gameweek);
  return {
    manager: {
      id: managerData.id,
      name: managerData.name,
      team_name: managerData.name,
      overall_points: managerData.summary_overall_points,
      overall_rank: managerData.summary_overall_rank,
      gameweek_points: currentGameweek?.points || 0,
      gameweek_rank: currentGameweek?.rank || 0,
      bank: managerData.last_deadline_bank / 10,
      // Convert to pounds
      value: managerData.last_deadline_value / 10
    },
    picks: picks.picks,
    gameweek: {
      id: gameweek,
      deadline: currentGameweek?.deadline_time,
      finished: currentGameweek?.finished || false,
      highest_score: currentGameweek?.highest_score,
      average_score: currentGameweek?.average_entry_score
    },
    recent_history: history.current?.slice(-5) || [],
    upcoming_fixtures: fixtures
  };
}
__name(getAnalysisContext, "getAnalysisContext");

// worker/workflows/analyze.js
var AnalyzeWorkflow = class extends WorkflowEntrypoint {
  static {
    __name(this, "AnalyzeWorkflow");
  }
  /**
   * @param {{ managerId: string; gameweek: number; notes?: string }} event
   */
  async run(event, step) {
    const { managerId, gameweek, notes = "" } = event;
    const recordId = `${managerId}-${gameweek}`;
    const executionId = this.env.ANALYZE_WORKFLOW?.id || crypto.randomUUID();
    const startTime = Date.now();
    await step.run(
      "init-record",
      () => createAnalysisRecord(this.env.DB, {
        managerId,
        gameweek,
        executionId,
        status: "pending",
        inputSnapshot: { managerId, gameweek, notes },
        startedAt: new Date(startTime).toISOString()
      })
    );
    try {
      await step.run(
        "mark-running",
        () => updateAnalysisStatus(this.env.DB, recordId, "running")
      );
      const analysisContext = await step.run(
        "fetch-fpl-data",
        () => getAnalysisContext(this.env, managerId, gameweek)
      );
      const mergedContext = await step.run("merge-inputs", async () => {
        return {
          ...analysisContext,
          user_notes: notes
        };
      });
      const aiStartTime = Date.now();
      const aiResult = await step.run("call-llm", async () => {
        const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze the following data:
${JSON.stringify(mergedContext, null, 2)}`
            }
          ],
          max_output_tokens: 800
        });
        return response;
      });
      const aiLatency = Date.now() - aiStartTime;
      const parsed = await step.run("parse-ai-output", async () => {
        try {
          let result;
          if (typeof aiResult?.response === "string") {
            result = JSON.parse(aiResult.response);
          } else if (aiResult?.response && typeof aiResult.response === "object") {
            result = aiResult.response;
          } else if (typeof aiResult?.result === "string") {
            result = JSON.parse(aiResult.result);
          } else {
            throw new Error("No valid response field found in AI result");
          }
          return result;
        } catch (error3) {
          throw new Error(`Failed to parse AI output: ${error3.message}`);
        }
      });
      const validated = await step.run("validate-and-repair", async () => {
        const validation = validateOutput(parsed);
        if (validation.valid) {
          return { output: parsed, repaired: false, errors: [] };
        }
        const repaired = repairOutput(parsed);
        const revalidation = validateOutput(repaired);
        if (revalidation.valid) {
          return {
            output: repaired,
            repaired: true,
            errors: validation.errors
          };
        }
        throw new Error(
          `AI output validation failed: ${validation.errors.join(", ")}. Repair also failed: ${revalidation.errors.join(", ")}`
        );
      });
      await step.run(
        "persist-success",
        () => createAnalysisRecord(this.env.DB, {
          managerId,
          gameweek,
          executionId,
          status: "completed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          modelName: "@cf/meta/llama-3.3-70b-instruct",
          tokensInput: aiResult?.meta?.tokens_input,
          tokensOutput: aiResult?.meta?.tokens_output,
          latencyMs: aiLatency,
          rawAiOutput: JSON.stringify(aiResult),
          result: validated.output,
          inputSnapshot: {
            managerId,
            gameweek,
            notes,
            validation: {
              repaired: validated.repaired,
              original_errors: validated.errors
            }
          }
        })
      );
      return {
        recordId,
        status: "completed",
        payload: validated.output,
        metadata: {
          repaired: validated.repaired,
          validation_errors: validated.errors
        }
      };
    } catch (error3) {
      await step.run(
        "persist-failure",
        () => createAnalysisRecord(this.env.DB, {
          managerId,
          gameweek,
          executionId,
          status: "failed",
          errorMessage: error3.message,
          completedAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      );
      return { recordId, status: "failed", error: error3.message };
    }
  }
};

// worker/src/index.js
var json = /* @__PURE__ */ __name((data, init = {}) => new Response(JSON.stringify(data, null, 2), {
  headers: { "Content-Type": "application/json" },
  ...init
}), "json");
var src_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const isApiRoute = url.pathname.startsWith("/analyze") || url.pathname.startsWith("/gameweek/") || url.pathname.startsWith("/execution/");
    if (!isApiRoute) {
      if (env2.ASSETS?.fetch) {
        return env2.ASSETS.fetch(request);
      }
    }
    if (request.method === "POST" && url.pathname === "/analyze") {
      const body = await request.json().catch(() => ({}));
      const { managerId, gameweek, notes } = body;
      if (!managerId || typeof gameweek !== "number") {
        return json({ error: "managerId and gameweek are required." }, { status: 400 });
      }
      const payload = { managerId, gameweek, notes: notes ?? "", prompt: SYSTEM_PROMPT };
      const execution = await env2.ANALYZE_WORKFLOW.createExecution({
        input: payload
      });
      return json(
        {
          message: "Workflow accepted",
          executionId: execution.id
        },
        { status: 202 }
      );
    }
    if (request.method === "GET" && url.pathname.startsWith("/gameweek/")) {
      const [, , gameweekId] = url.pathname.split("/");
      if (!gameweekId) return json({ error: "Missing gameweek identifier" }, { status: 400 });
      const record = await getAnalysisRecord(env2.DB, gameweekId);
      if (!record) return json({ error: "Not found" }, { status: 404 });
      return json(record);
    }
    if (request.method === "GET" && url.pathname.startsWith("/execution/")) {
      const [, , executionId] = url.pathname.split("/");
      if (!executionId) return json({ error: "Missing execution identifier" }, { status: 400 });
      try {
        const execution = await env2.ANALYZE_WORKFLOW.get(executionId);
        if (!execution) {
          return json({ error: "Execution not found" }, { status: 404 });
        }
        const statusMap = {
          complete: "completed",
          errored: "failed",
          terminated: "failed",
          paused: "running",
          unknown: "running"
        };
        const normalizedStatus = statusMap[execution.status] || execution.status;
        const records = await env2.DB.prepare(
          `SELECT * FROM gameweek_analysis WHERE execution_id = ?1 LIMIT 1`
        ).bind(executionId).all();
        const record = records.results?.[0];
        return json({
          executionId: execution.id,
          status: normalizedStatus,
          rawStatus: execution.status,
          createdAt: execution.createdAt,
          analysis: record ? {
            id: record.id,
            managerId: record.manager_id,
            gameweek: record.gameweek,
            status: record.status,
            startedAt: record.started_at,
            completedAt: record.completed_at,
            errorMessage: record.error_message
          } : null
        });
      } catch (error3) {
        return json({ error: "Failed to fetch execution status", details: error3.message }, { status: 500 });
      }
    }
    return json({
      ok: true,
      routes: [
        "POST /analyze - Start analysis workflow",
        "GET /gameweek/:id - Get analysis by composite ID (managerId-gameweek)",
        "GET /execution/:id - Get workflow execution status"
      ]
    });
  }
};

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-3S68uV/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-3S68uV/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  AnalyzeWorkflow,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
