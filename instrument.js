const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

// Inisialisasi Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN, // Gunakan variabel lingkungan untuk DSN
    integrations: [
        nodeProfilingIntegration(),
    ],
    // Tracing - setel tingkat sampling transaksi (capture 100% transaksi)
    tracesSampleRate: 1.0,
});

// Fungsi untuk memulai dan menghentikan profiling pada bagian kode yang relevan
function profileCriticalSection() {
    Sentry.profiler.startProfiler(); // Memulai profiling
    try {
        // Kode yang ingin diprofiling
        console.log("Profiling critical section...");
        // Simulasikan proses yang memakan waktu
        for (let i = 0; i < 1000000; i++) {
            // Proses berat
        }
    } catch (error) {
        console.error("Error in critical section: ", error);
    } finally {
        // Hentikan profiling setelah bagian kode selesai
        Sentry.profiler.stopProfiler(); // Memastikan profiling dihentikan
    }
}

// Panggil fungsi profiling hanya di tempat yang dibutuhkan
profileCriticalSection();

// Jika perlu, Anda dapat menambahkan logika tambahan untuk memulai dan menghentikan profiler berdasarkan event atau kondisi tertentu
