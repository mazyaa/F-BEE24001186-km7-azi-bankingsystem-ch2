# Banking System

This project demonstrates a simple banking system using JavaScript classes and custom error handling.

## Features
- **Deposit**: tambah dan ke dalam saldo.
- **Withdraw**: Penarikan dana dengan penanganan kesalahan karena saldo tidak cukup.
- **Custom Error**: `InsufficientFundsError` akan berjalan ketika mencoba menarik lebih dari saldo yang tersedia.

### penjelasan flowchart

- Mulai: Proses dimulai.
- Membuat Instance BankAccount: Membuat objek dari kelas BankAccount.
- Deposit 50000: Memanggil metode deposit untuk menambah saldo.
- Tampilkan "Telah melakukan deposit sebanyak: Rp. 50000": Mengonfirmasi bahwa deposit berhasil.
- Withdraw 10000: Memanggil metode withdraw untuk mengurangi saldo.
- Periksa saldo >= amount?: Memeriksa apakah saldo cukup untuk penarikan.
- Jika tidak: Tampilkan pesan kesalahan.
- Jika ya: Lanjutkan dengan pengurangan saldo.
- Tampilkan "Telah melakukan penarikan sebanyak: Rp. 10000": Mengonfirmasi bahwa penarikan berhasil.
- Tampilkan "Saldo setelah penarikan Rp. {saldo}": Menampilkan saldo akhir setelah penarikan.
- End: Proses selesai.
