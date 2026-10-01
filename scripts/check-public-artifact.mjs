import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
export async function checkPublicArtifact(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink in public artifact: ${path}`);
    if (entry.isDirectory()) { await checkPublicArtifact(path); continue; }
    if (/^(estamper(?:\.config)?\.(json|ya?ml)|\.env(?:\..*)?)$/i.test(entry.name)) throw new Error(`Private metadata/config in public artifact: ${path}`);
    if (entry.name.endsWith('.map')) throw new Error(`Source map in public artifact: ${path}`);
    const body = await readFile(path, 'utf8');
    const secret = process.env.ESTAMPER_PASSWORD;
    if (secret && body.includes(secret)) throw new Error(`Build password leaked into ${path}`);
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(body)) throw new Error(`Private key in ${path}`);
  }
}
await checkPublicArtifact(process.argv[2] ?? 'site-dist');
console.log('Public artifact guard PASS');
