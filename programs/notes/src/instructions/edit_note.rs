use crate::constants::*;
use crate::errors::NotesErrors;
use crate::states::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct EditNote<'info> {
    #[account(
        mut,
        seeds = [NOTE_SEED, signer.key().as_ref(), note.name.as_bytes()],
        bump,
    )]
    pub note: Account<'info, Note>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<EditNote>, value: String) -> Result<()> {
    let note = &mut ctx.accounts.note;

    require!(value != note.value, NotesErrors::ValueIsSame);

    note.value = value;
    Ok(())
}
