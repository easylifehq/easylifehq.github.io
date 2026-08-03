import assert from 'node:assert/strict'
import { mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { createCandidateServer, resolveCandidateRequest } from '../serve-pages-candidate.mjs'

async function startFixture() {
  const root = await mkdtemp(join(tmpdir(), 'easylife-candidate-server-'))
  await writeFile(join(root, 'index.html'), '<main>candidate</main>')
  await writeFile(join(root, '404.html'), '<main>fallback</main>')
  await writeFile(join(root, 'manifest.webmanifest'), '{"name":"EasyLife"}')
  const server = createCandidateServer({ root })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.equal(typeof address, 'object')
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
    root,
  }
}

test('serves publication files with exact manifest media type', async () => {
  const fixture = await startFixture()
  try {
    const response = await fetch(`${fixture.baseUrl}/manifest.webmanifest`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'application/manifest+json; charset=utf-8')
    assert.equal(await response.text(), '{"name":"EasyLife"}')
  } finally {
    await fixture.close()
  }
})

test('serves the static 404 shell with a truthful 404 status for deep links', async () => {
  const fixture = await startFixture()
  try {
    const response = await fetch(`${fixture.baseUrl}/app/today?demo=1`)
    assert.equal(response.status, 404)
    assert.equal(await response.text(), '<main>fallback</main>')
  } finally {
    await fixture.close()
  }
})

test('rejects traversal and backslash request paths', () => {
  const root = join(tmpdir(), 'candidate-root')
  assert.throws(() => resolveCandidateRequest(root, '/../secret'), /Unsafe request path/)
  assert.throws(() => resolveCandidateRequest(root, '/..\\secret'), /Unsafe request path/)
})

test('does not follow symlinks from the candidate root', async (context) => {
  if (process.platform === 'win32') {
    context.skip('Windows symlink creation requires an optional developer-mode privilege')
    return
  }

  const fixture = await startFixture()
  try {
    const secret = join(fixture.root, '..', 'secret.txt')
    await writeFile(secret, 'do not serve')
    await symlink(secret, join(fixture.root, 'linked.txt'))
    const response = await fetch(`${fixture.baseUrl}/linked.txt`)
    assert.equal(response.status, 404)
    assert.equal(await response.text(), '<main>fallback</main>')
  } finally {
    await fixture.close()
  }
})
