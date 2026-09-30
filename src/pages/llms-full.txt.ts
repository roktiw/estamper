const sections = [
  ['Overview', 'Estamper adds tiny visible build stamps to apps so QA screenshots identify the exact deploy, commit, actor, and build time.'],
  ['Getting started', 'Install with npm install -D estamper, run npx estamper init, then npx estamper generate --out public/estamper.json.'],
  ['Stamp format', '[env]-[cloud]-[token1]-[token2]-[word1]-[word2]-[date]-[time]-[user]@[commit].'],
  ['Playground', 'The /playground page previews stamps and exports YAML, JSON, and browser snippets.'],
  ['Dogfooding', 'The website reads /estamper.json and mounts its own visible badge.'],
];

export async function GET() {
  return new Response(`# Estamper full LLM context\n\n${sections.map(([title, body]) => `## ${title}\n\n${body}`).join('\n\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
