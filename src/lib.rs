use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshSerialize)]
struct OnChainData {
    count: u32,
}

entrypoint!(process_instruction);

fn process_instruction(
    program: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;
    let mut counter = OnChainData::try_from_slice(&data_account.data.borrow_mut())?;

    // if !data_account.is_signer {
    //     return Err(solana_program::program_error::ProgramError::MissingRequiredSignature);
    // }

    if counter.count == 0 {
        counter.count = 1;
    } else {
        counter.count *= 2;
    }

    counter.serialize(&mut *data_account.data.borrow_mut());

    Ok(())
}
