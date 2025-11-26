use anchor_lang::prelude::*;

#[error_code]
pub enum NotesErrors {
    NameTooLong,
    ValueTooLong,
    ValueIsSame
}