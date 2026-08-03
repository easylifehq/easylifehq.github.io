# Deterministic rollback rehearsal

The rehearsal used the reviewed Wave 7 implementation/CI SHA `8a299a25bab2722523d5f187ea966373cb6741aa`, explicit commit timestamp `2026-08-03T19:32:12.000Z`, and the isolated clean-checkout worktree.

- authoritative candidate: `C:\Dev\easylife-wave7-publication-candidate-8a299a25-clean`;
- independent repeat: `C:\Dev\easylife-wave7-publication-candidate-8a299a25-rehearsal-copy`;
- both verified 91 payload hashes;
- both SHA-256 inventory file hashes: `4257C56AEC78D082EB15DB16464FF666A55081A892241C2218C4489BE4BB6E4F`;
- result: byte-identical inventory, pass.

The 20 publication tests also rehearse isolated `--apply`, exact stale-owned removal, unknown-file preservation, partial/stale target refusal, deliberate apply refusal, `CNAME` pre/post integrity, and post-apply root verification. The real repository root was never an apply target.

Browser rehearsal proved a fresh `easylife-shell-v6` activation removed a synthetic stale `easylife-shell-v4` cache and preserved an unrelated origin cache. The unrelated rehearsal cache was removed afterward.

The future operational rollback remains gated on a human-selected last-known-good SHA. It must be rebuilt, staged, hashed, browser-tested, and applied as a new reviewed generated-output commit. If that SHA fails the current artifact/security contract, select another reviewed compatible SHA; never weaken the contract, force-push, or manually copy live files.
