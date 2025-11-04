import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js"
import { LiteSVM } from "litesvm";

const svm = new LiteSVM();
async function main() {
   const kp = new Keypair();
   const dataAccount = new Keypair();

   svm.airdrop(kp.publicKey, BigInt(100 * LAMPORTS_PER_SOL));

   // const balance = svm.getBalance(kp.publicKey)
   const blockhash = await svm.latestBlockhash();

   const ix = SystemProgram.createAccount({
      fromPubkey: kp.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(8))),
      space: 8,
      programId: SystemProgram.programId
   })

   const tx = new Transaction().add(ix);
   tx.recentBlockhash = blockhash;
   tx.feePayer = kp.publicKey;
   tx.sign(kp, dataAccount);

   await svm.sendTransaction(tx);
   console.log(dataAccount.publicKey.toBase58());
   // svm.expireBlockhash();
}
main()