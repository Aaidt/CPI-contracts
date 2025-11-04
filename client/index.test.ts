import { test, expect } from "bun:test";
import { LiteSVM } from "litesvm";
import {
   PublicKey,
   Transaction,
   SystemProgram,
   Keypair,
   LAMPORTS_PER_SOL,
   TransactionInstruction,
} from "@solana/web3.js";

test("one transfer", () => {
   const svm = new LiteSVM();
   const contractPubKey = PublicKey.unique();
   svm.addProgramFromFile(contractPubKey, "../target/sbpf-solana-solana/release/cpi.so");
   const payer = new Keypair();
   svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
   const dataAccount = new Keypair();
   const blockhash = svm.latestBlockhash();
   const lamports = svm.minimumBalanceForRentExemption(BigInt(4))
   const ixs = [
      SystemProgram.createAccount({
         fromPubkey: payer.publicKey,
         newAccountPubkey: dataAccount.publicKey,
         lamports: Number(lamports),
         space: 4,
         programId: contractPubKey,
      }),
   ];
   const tx = new Transaction();
   tx.recentBlockhash = blockhash;
   tx.add(...ixs);
   tx.sign(payer, dataAccount);
   svm.sendTransaction(tx);
   const balanceAfter = svm.getBalance(dataAccount.publicKey);
   expect(balanceAfter).toBe(lamports);

   function double() {

      const ix2 = new TransactionInstruction({
         keys: [{ pubkey: dataAccount.publicKey, isSigner: false, isWritable: true }],
         programId: contractPubKey,
         data: Buffer.from("")
      })

      const blockhash = svm.latestBlockhash();
      const tx2 = new Transaction();
      tx2.recentBlockhash = blockhash;
      tx2.feePayer = payer.publicKey;
      tx2.add(ix2);
      tx2.sign(payer);
      svm.sendTransaction(tx2);
      svm.expireBlockhash();
   }
   double();
   double();
   double();
   double();

   const newDataAcc = svm.getAccount(dataAccount.publicKey);
   expect(newDataAcc?.data[0]).toBe(8);
   expect(newDataAcc?.data[1]).toBe(0);
   expect(newDataAcc?.data[2]).toBe(0);
   expect(newDataAcc?.data[3]).toBe(0);
});
