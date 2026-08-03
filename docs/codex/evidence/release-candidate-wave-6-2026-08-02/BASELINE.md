# Wave 6 baseline checkpoint

- Branch base: `8eea33158b613058ea84e0ee7f7edd8f5bcb7083`
- Base tree: `331bb3531863915975bbf57063021267dc288804`
- Security scan target: `222df60f94fb18bbbd556b2ae03efe2978b38087` (same tree)
- Application tests: 60/60 passed.
- Firestore Emulator integration: 6/6 passed against `demo-easylife-wave2` on loopback.
- TypeScript and production build: passed; 210 modules transformed.
- Functions syntax lint: passed.
- Production critical advisory gates: passed; inherited moderate advisories remain for React Router and the Functions UUID chain.
- Root `index.html`: intentional checkout-normalization mismatch preserved and unstaged; raw worktree content matches the HEAD blob.
- Real user data and production Firebase: not accessed.

This checkpoint records the reproduced starting state before Wave 6 hardening changes.
