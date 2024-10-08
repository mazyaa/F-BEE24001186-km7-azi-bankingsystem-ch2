--implement CRUD

INSERT INTO nasabah (nama, telepon, email)
SELECT 
	'Nasabah' || gs AS nama,
	'08582378371' || gs AS telepon, 
	'EmailNasabah' || gs AS email 
	
FROM generate_series(1, 50) AS gs;

--READ
SELECT * FROM nasabah;



INSERT INTO akun (id_nasabah, nomor_rekening, saldo)
SELECT 
    n.id_nasabah ,  
    'Rekening-' || n.id_nasabah || '-' || gs AS nomor_rekening,  
    ROUND((RANDOM() * 1000000)::numeric, 2) AS saldo  
FROM Nasabah n  
JOIN generate_series(1, 2) AS gs ON TRUE 
WHERE n.id_nasabah <= 25;  

--READ 
SELECT * FROM akun;



INSERT INTO transaksi (id_akun, jumlah, tipe_transaksi)
SELECT 
    a.id_akun, 
    ROUND((RANDOM() * 10000)::numeric, 2) AS jumlah, 
    CASE 
        WHEN gs % 2 = 0 THEN 'deposit'  
        ELSE 'withdraw'  
    END AS tipe_transaksi  
FROM Akun a
JOIN generate_series(1, 3) AS gs ON TRUE;  

--READ
SELECT * FROM transaksi;

--implement getBalance()
SELECT id_akun, saldo FROM akun WHERE id_akun = $1;


--implement wihdraw() & deposit()

--deposit
CALL deposit(1, 100000);

--withdraw
CALL withdraw(1, 50000);

--SELECT table transaksi
SELECT * FROM transaksi;


--Delete (hard delete)
--Delete value in table
DELETE FROM akun;
DELETE FROM nasabah;
DELETE FROM transaksi;

--Drop table
DROP TABLE akun;
DROP TABLE nasabah;
DROP TABLE transaksi;