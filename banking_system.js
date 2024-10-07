const {BankAccount, InsufficientFundsError} = require('./bank_account');

async function main(){
    const myAccount = new BankAccount();

    try{
        // += saldo
        await myAccount.deposit(50000);

        // -= saldo
        await myAccount.withdraw(10000);

        
    } catch (err){
        //pake custom error
        if (err instanceof InsufficientFundsError){
            console.log('Error: Penarikan gagal, jumlah saldo tidak mencukupi!');
        }else{
            console.log(err);
        }

    }
}

main();