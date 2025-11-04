import { test, expect } from "bun:test";
import { LiteSVM } from "litesvm";
import { Keypair, LAMPORTS_PER_SOL, MessageAccountKeys, PublicKey, SystemInstruction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";


test("CPI working as expected", async () => {
   let svm = new LiteSVM();
   let doubleContract = PublicKey.unique();
   let cpiContract = PublicKey.unique();

   svm.addProgramFromFile(doubleContract, "../target/sbpf-solana-solana/release/cpi.so");
   svm.addProgramFromFile(cpiContract, "../cpi_contract/target/sbpf-solana-solana/release/cpi_contract.so");

   let userAccount = new Keypair();
   let dataAccount = new Keypair();

   svm.airdrop(userAccount.publicKey, BigInt(1 * LAMPORTS_PER_SOL));

   createDataAccountOnChain(svm, dataAccount, userAccount, doubleContract);

   let ix = new TransactionInstruction({
      keys: [
         { pubkey: dataAccount.publicKey, isSigner: true, isWritable: true },
         { pubkey: doubleContract, isSigner: false, isWritable: false }
      ],
      programId: cpiContract,
      data: Buffer.from("")
   })

   const blockhash = svm.latestBlockhash();
   let transaction = new Transaction().add(ix);
   transaction.recentBlockhash = blockhash;
   transaction.feePayer = userAccount.publicKey;
   transaction.sign(userAccount);

   const res = svm.sendTransaction(transaction);
   console.log(res);

   const dataAccountData = svm.getAccount(dataAccount.publicKey);
   expect(dataAccountData?.data[0]).toBe(1);
   expect(dataAccountData?.data[1]).toBe(0);
   expect(dataAccountData?.data[2]).toBe(0);
   expect(dataAccountData?.data[3]).toBe(0);
})

function createDataAccountOnChain(svm: LiteSVM, dataAccount: Keypair, userAccount: Keypair, doubleContract: PublicKey) {
   const blockhash = svm.latestBlockhash();
   const ix = [
      SystemProgram.createAccount({
         fromPubkey: userAccount.publicKey,
         newAccountPubkey: dataAccount.publicKey,
         lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
         space: 4,
         programId: doubleContract
      }),
   ];

   const tx = new Transaction();
   tx.recentBlockhash = blockhash;
   tx.feePayer = userAccount.publicKey;
   tx.add(...ix);
   tx.sign(userAccount, dataAccount);
   svm.sendTransaction(tx);
}
