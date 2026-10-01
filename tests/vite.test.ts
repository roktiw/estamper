import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { estamperVitePlugin } from '../src/vite/index.js';
async function config() {
  const dir = await mkdtemp(join(tmpdir(), 'estamper-vite-')); const path = join(dir, 'config.json');
  await writeFile(path, JSON.stringify({ security: { access:'max' } })); return path;
}
describe('Vite protected delivery', () => {
  it('emits no JSON, injects external script without private metadata', async () => {
    const plugin = estamperVitePlugin({ config: await config(), inject:true, meta:true });
    await plugin.buildStart();
    const assets: unknown[] = [];
    plugin.generateBundle.call({ emitFile: asset => { assets.push(asset); } }, {});
    expect(assets).toHaveLength(1); expect(JSON.stringify(assets)).not.toContain('parts');
    expect(JSON.stringify(assets)).not.toContain('estamper.json');
    const html = plugin.transformIndexHtml('<head></head>');
    expect(html).toContain('src="/assets/estamper.js"'); expect(html).not.toContain('<script>');
  });
  it('rejects production JSON including explicit legacy flags and stale assets', async () => {
    for (const option of [{ out:'public/estamper.json' }, { emitAsset:true }]) {
      await expect(estamperVitePlugin({ config: await config(), ...option }).buildStart()).rejects.toThrow('forbidden');
    }
    const plugin = estamperVitePlugin();
    expect(() => plugin.generateBundle.call({ emitFile: () => {} }, {}, { 'estamper.json':{} })).toThrow('stale');
  });
  it('rejects unsafe global names', () => {
    for (const globalName of ['bad;alert(1)', '__proto__', 'constructor']) expect(() => estamperVitePlugin({ inject:true,globalName }).transformIndexHtml('<head></head>')).toThrow('globalName');
  });
});

it('real Vite build respects base and rejects stale files copied from public', async () => {
  const { build } = await import('vite');
  const { mkdir, readFile, realpath } = await import('node:fs/promises');
  const dir = await realpath(await mkdtemp(join(tmpdir(), 'estamper-real-build-')));
  await writeFile(join(dir,'index.html'), '<html><head></head><body>Hello</body></html>');
  const pluginConfig = await config();
  await build({ root:dir, base:'/app/', logLevel:'silent', plugins:[estamperVitePlugin({config:pluginConfig,inject:true})] });
  expect(await readFile(join(dir,'dist/index.html'),'utf8')).toContain('/app/assets/estamper.js');
  expect(await readFile(join(dir,'dist/assets/estamper.js'),'utf8')).not.toContain('parts');
  await mkdir(join(dir,'public')); await writeFile(join(dir,'public/estamper.json'), '{"secret":"stale"}');
  await expect(build({root:dir,logLevel:'silent',plugins:[estamperVitePlugin({config:pluginConfig})]})).rejects.toThrow('stale');
});
