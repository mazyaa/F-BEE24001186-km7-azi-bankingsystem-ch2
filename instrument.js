const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
    dsn : 'https://f1a63aa848fdf193783b38a02d08010f@o4508284617031680.ingest.us.sentry.io/4508284618801152',
    integrations : [
        nodeProfilingIntegration(),
    ],
    // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});


// Manually call startProfiler and stopProfiler
// to profile the code in between
Sentry.profiler.startProfiler();
// this code will be profiled

// Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
// your application until the process exits or stopProfiling is called.
Sentry.profiler.stopProfiler();

