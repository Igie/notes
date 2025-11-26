import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Notes } from "../target/types/notes";

import { Keypair, PublicKey } from '@solana/web3.js';
import { assert } from "chai";

const program = anchor.workspace.notes as Program<Notes>;

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

describe("notes", () => {
  const firstUser = new Keypair();
  const secondUser = new Keypair();

  const firstNoteName = "Note name";
  const firstNoteValue = "Note value";

  const firstNote = getNoteAddress(firstNoteName, firstUser.publicKey);
  const secondNote = getNoteAddress(firstNoteName, secondUser.publicKey);

  const firstNoteFakeName = getNoteAddress(firstNoteName + "fake", firstUser.publicKey);

  before(async () => {
    await airdrop(firstUser.publicKey);
    await airdrop(secondUser.publicKey);
  });

  it("Creates first note intended way", async () => {
    await tryThrowError(async () => {
      await program.methods.initializeNote(firstNoteName, firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
    await initializeNoteCheckEq(firstUser.publicKey, firstNote, firstNoteName, firstNoteValue);
  });

  it("Fails to create note second time", async () => {
    await tryThrowNoError(async () => {
      await program.methods.initializeNote(firstNoteName, firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote
        })
        .signers([firstUser])
        .rpc();
    });
  });

  it("Fails to create note for another user", async () => {
    await tryThrowNoError(async () => {
      await program.methods.initializeNote(firstNoteName, firstNoteValue)
        .accountsPartial({
          signer: secondUser.publicKey,
          note: secondNote,
        })
        .signers([firstUser])
        .rpc();
    });
    await tryThrowNoError(async () => {
      await program.methods.initializeNote(firstNoteName, firstNoteValue)
        .accountsPartial({
          signer: secondUser.publicKey,
          note: firstNote,
        })
        .signers([secondUser])
        .rpc();
    });
    await tryThrowNoError(async () => {
      await program.methods.initializeNote(firstNoteName, firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: secondNote,
        })
        .signers([secondUser])
        .rpc();
    });
    await initializeNoteCheckEq(firstUser.publicKey, firstNote, firstNoteName, firstNoteValue);
  });

  it("Fails to close note for another user", async () => {
    await tryThrowNoError(async () => {
      await program.methods.closeNote()
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNoteFakeName,
        })
        .signers([firstUser])
        .rpc();
    });
    await tryThrowNoError(async () => {
      await program.methods.closeNote()
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([secondUser])
        .rpc();
    });
    await tryThrowNoError(async () => {
      await program.methods.closeNote()
        .accountsPartial({
          signer: secondUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
  });

  it("Closes note intended way", async () => {
    await tryThrowError(async () => {
      const tx = await program.methods.closeNote()
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .transaction();

      await provider.sendAndConfirm(tx, [firstUser]);
    });
  });

  it("Fails to close note second time", async () => {
    await tryThrowNoError(async () => {
      await program.methods.closeNote()
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
  });

  it("Creates first note again", async () => {
    await tryThrowError(async () => {
      await program.methods.initializeNote(firstNoteName, firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
    await initializeNoteCheckEq(firstUser.publicKey, firstNote, firstNoteName, firstNoteValue);
  });

  it("Fails to edit note for another user", async () => {
    await tryThrowNoError(async () => {
      await program.methods.editNote("new value")
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNoteFakeName,
        })
        .signers([firstUser])
        .rpc();
    }, "0");
    await tryThrowNoError(async () => {
      await program.methods.editNote("new value")
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([secondUser])
        .rpc();
    }, "1");
    await tryThrowNoError(async () => {
      await program.methods.editNote("new value")
        .accountsPartial({
          signer: secondUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    }, "2");
    await tryThrowNoError(async () => {
      await program.methods.editNote(firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNoteFakeName,
        })
        .signers([firstUser])
        .rpc();
    }, "3");
    await tryThrowNoError(async () => {
      await program.methods.editNote(firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([secondUser])
        .rpc();
    }, "4");
    await tryThrowNoError(async () => {
      await program.methods.editNote(firstNoteValue)
        .accountsPartial({
          signer: secondUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    }, "5");
    await tryThrowNoError(async () => {
      await program.methods.editNote(firstNoteValue)
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    }, "6");
  });

  it("Edits note intended way", async () => {
    await tryThrowError(async () => {
      await program.methods.editNote("new value")
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
    await initializeNoteCheckEq(firstUser.publicKey, firstNote, firstNoteName, "new value");
  });

  it("Closes note again", async () => {
    await tryThrowError(async () => {
      await program.methods.closeNote()
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
  });

  it("Fails to edit closed note", async () => {
    await tryThrowNoError(async () => {
      await program.methods.editNote("new value")
        .accountsPartial({
          signer: firstUser.publicKey,
          note: firstNote,
        })
        .signers([firstUser])
        .rpc();
    });
  });
});

function getNoteAddress(name: string, author: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("notes"),
      author.toBuffer(),
      anchor.utils.bytes.utf8.encode(name),
    ], program.programId)[0];
}

async function airdrop(address: PublicKey, amount = 1000000000) {
  await provider.connection.confirmTransaction(await provider.connection.requestAirdrop(address, amount), "confirmed");
}

async function initializeNoteCheckEq(author: PublicKey, note: PublicKey, name: string, value: string) {
  const noteAddress = getNoteAddress(name, author)
  const noteAcc = await program.account.note.fetch(note);
  assert(note.toString() === noteAddress.toString(), "Failed check on note address");
  assert(author.toString() === noteAcc.author.toString(), "Failed check on author");
  assert(name === noteAcc.name, "Failed check on note name");
  assert(value === noteAcc.value, "Failed check on note name");
}

async function initializeNoteCheckAnyNotEq(
  author: PublicKey,
  note: PublicKey,
  name: string,
  value: string
) {
  const noteAddress = getNoteAddress(name, author);
  const noteAcc = await program.account.note.fetch(note);

  const comparisons = [
    {
      label: "note address",
      expected: noteAddress.toString(),
      actual: note.toString(),
      equal: note.toString() === noteAddress.toString(),
    },
    {
      label: "author",
      expected: author.toString(),
      actual: noteAcc.author.toString(),
      equal: author.toString() === noteAcc.author.toString(),
    },
    {
      label: "name",
      expected: name,
      actual: noteAcc.name,
      equal: name === noteAcc.name,
    },
    {
      label: "value",
      expected: value,
      actual: noteAcc.value,
      equal: value === noteAcc.value,
    },
  ];

  // List which fields do not match
  const mismatches = comparisons.filter(c => !c.equal);

  // If all match → this is a failure
  if (mismatches.length === 0) {
    console.log("\n❌ All fields unexpectedly matched:");
    for (const c of comparisons) {
      console.log(`  - ${c.label}: expected=${c.expected}, actual=${c.actual}`);
    }
    assert(false, "Expected at least one mismatch, but all fields matched");
  }

  // Otherwise print mismatches
  console.log("\n⚠️  Mismatches detected:");
  for (const m of mismatches) {
    console.log(`  - ${m.label}: expected=${m.expected}, actual=${m.actual}`);
  }
}

async function tryThrowError(func: () => Promise<void>) {
  try {
    await func();
    console.log("Expected: Error not thrown");
  } catch (e) {
    assert.fail("Unexpected: " + e.toString());
  }
}

async function tryThrowNoError(func: () => Promise<void>, memo: string = "") {
  try {
    await func();
  } catch (e) {
    console.log("Expected: Error thrown: " + e.toString());
    return;
  }

  assert.fail(`Unexpected ${memo}: Should have thrown error`)
}