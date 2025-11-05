use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction::create_account,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let pda = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let seeds = &[user_account.key.as_ref(), b"user"];
    let (pda_pub_key, bump) = Pubkey::find_program_address(seeds, program_id);

    let ix = create_account(user_account.key, pda.key, 1000000000, 8, program_id);

    invoke_signed(&ix, accounts, &[&[seeds, &[bump]]]);

    Ok(())
}
