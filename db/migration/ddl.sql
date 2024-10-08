--create table nasabah
CREATE TABLE IF NOT EXISTS nasabah (
    id BIGSERIAL  NOT NULL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    telepon VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL
);


--rename atribute name from nasabah
ALTER TABLE nasabah RENAME COLUMN id TO id_nasabah;

--create indexing from nasabah
CREATE INDEX idx_nasabah_nama ON nasabah(nama);

--drop indexing
DROP INDEX idx_nasabah_nama;


--create table akun
CREATE TABLE IF NOT EXISTS akun(
	id_akun BIGSERIAL PRIMARY KEY,
	id_nasabah BIGSERIAL NOT NULL REFERENCES nasabah(id_nasabah),
	nomor_rekening varchar(24) UNIQUE NOT NULL,
	saldo NUMERIC(15, 2) NOT NULL
);


--create indexing from akun
CREATE INDEX idx_akun_saldo ON akun(saldo);

--drop indexing
DROP INDEX idx_akun_saldo;


--create table transaksi
CREATE TABLE IF NOT EXISTS transaksi (
	id_transaksi BIGSERIAL PRIMARY KEY,
	id_akun BIGSERIAL NOT NULL REFERENCES Akun(id_akun),
	jumlah NUMERIC(15, 2),
	tanggal_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	tipe_transaksi VARCHAR(50) NOT NULL
);


--create indexing from transaksi
CREATE INDEX idx_transaksi_tipe_transaksi ON transaksi(tipe_transaksi);

--drop indexing
DROP INDEX idx_transaksi_tipe_transaksi;


--create stored procedure for deposit
CREATE OR REPLACE PROCEDURE deposit(account_id BIGINT, amount NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE akun
    SET saldo = saldo + amount
    WHERE id_akun = account_id;

    -- Insert data baru ke tabel transaksi setelah berhasil deposit
    INSERT INTO transaksi (id_akun, jumlah, tipe_transaksi)
    VALUES (account_id, amount, 'deposit');

    RAISE NOTICE 'Telah melakukan deposit sebanyak: Rp. %', amount;
END;
$$;

--create stored procedure for deposit
CREATE OR REPLACE PROCEDURE withdraw(account_id BIGINT, amount NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    IF (SELECT saldo FROM akun WHERE id_akun = account_id) < amount THEN
        RAISE EXCEPTION 'Jumlah penarikan melebihi jumlah saldo!';
    ELSE
        UPDATE akun
        SET saldo = saldo - amount
        WHERE id_akun = account_id;

        -- Insert data baru ke tabel transaksi ketika berhasi wd
        INSERT INTO transaksi (id_akun, jumlah, tipe_transaksi)
        VALUES (account_id, amount, 'withdraw');

        RAISE NOTICE 'Telah melakukan penarikan sebanyak: Rp. %', amount;
    END IF;
END;
$$;







