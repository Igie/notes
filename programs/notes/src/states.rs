use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
#[derive(InitSpace)]
pub struct Note {
    pub author:Pubkey,
    
    pub init_time: i64,
    
    #[max_len(MAX_NAME_SIZE)]
    pub name: String,

      #[max_len(MAX_VALUE_SIZE)]
    pub value: String,
}
