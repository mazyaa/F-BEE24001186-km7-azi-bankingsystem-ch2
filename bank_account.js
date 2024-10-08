//custom error jika saldo tidak mencukupi
class InsufficientFundsError extends Error {
    constructor(message) {
        super(message);
        this.name = "InsufficientFundsError";
    }
}

class BankAccount {
    constructor() {
        this.saldo = 0;
        setTimeout(() => {
            console.log(`Saldo awal Rp. ${this.saldo}`);
        }, 500);
    }

    // Menggunakan Promise 
    deposit(amount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.saldo += amount;
                console.log(`Telah melakukan deposit sebanyak: Rp. ${this.saldo}`);
                resolve(this.saldo);
            }, 4000);
        });
    }

     async withdraw(amount) {
            //implement cuntom error
            if (this.saldo < amount) {
                throw new InsufficientFundsError('Jumlah penarikan melebihi jumlah saldo!');
            }

            //untuk mengurangi saldo setelah depo
            setTimeout(()=>{
                this.saldo -= amount;  
                console.log('Telah melakukan penarikan sebanyak Rp.', amount);
            }, 4000)

            // nampilin saldo setelah wd
            setTimeout(() => {
                console.log('Saldo setelah penarikan Rp.', this.saldo);
            }, 7000); 
       
    }
    getBalance() {
        return this.saldo;
    }
    


}

module.exports = { BankAccount, InsufficientFundsError };