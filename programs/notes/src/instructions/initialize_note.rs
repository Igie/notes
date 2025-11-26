use crate::constants::*;
use crate::errors::NotesErrors;
use crate::states::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeNote<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + Note::INIT_SPACE,
        seeds = [NOTE_SEED, signer.key().as_ref(), name.as_bytes()],
        bump,
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<InitializeNote>, name: String, value: String) -> Result<()> {
    require!(name.len() <= MAX_NAME_SIZE, NotesErrors::NameTooLong);
    require!(value.len() <= MAX_VALUE_SIZE, NotesErrors::ValueTooLong);

    let note = &mut ctx.accounts.note;
    note.author = ctx.accounts.signer.key();
    note.init_time = Clock::get()?.unix_timestamp;
    note.name = name;
    note.value = value;
    Ok(())
}
