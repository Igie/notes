use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("7YLJ1sK4aRMzRzqkPrHchAGEa9kfKYr5XTgsPMVVSHAJ");

#[program]
pub mod notes {
    use super::*;

    pub fn initialize_note(
        ctx: Context<InitializeNote>,
        name: String,
        value: String,
    ) -> Result<()> {
        initialize_note::handle(ctx, name, value)
    }

        pub fn edit_note(
        ctx: Context<EditNote>,
        value: String,
    ) -> Result<()> {
        edit_note::handle(ctx, value)
    }

    pub fn close_note(
        ctx: Context<CloseNote>,
    ) -> Result<()> {
        close_note::handle(ctx)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
