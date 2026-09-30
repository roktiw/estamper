export interface TokenMapping {
  emoji: string;
  ascii2?: string;
  ascii3?: string;
  name: string;
  aliases?: string[];
}

export interface WordAlias {
  word: string;
  code2?: string;
  code3?: string;
  aliases?: string[];
}

export const defaultWords = [
  'silver', 'golden', 'crimson', 'azure', 'violet', 'amber', 'jade', 'coral', 'ivory', 'slate',
  'river', 'forest', 'mountain', 'ocean', 'garden', 'canyon', 'valley', 'island', 'delta', 'glacier',
  'melon', 'mango', 'banana', 'cherry', 'lemon', 'peach', 'plum', 'grape',
  'orbit', 'pixel', 'vector', 'debug', 'patch', 'build', 'deploy', 'branch', 'matrix', 'kernel',
  'socket', 'buffer', 'cipher', 'proxy', 'router', 'rocket', 'thunder', 'signal', 'echo', 'mirror',
  'shadow', 'phantom', 'nova', 'spark', 'comet',
];

export const defaultTokenMappings: TokenMapping[] = [
  { emoji: '🏷️', ascii2: 'ST', ascii3: 'TAG', name: 'tag', aliases: ['label', 'stamp'] },
  { emoji: '✅', ascii2: 'OK', ascii3: 'CHK', name: 'check', aliases: ['approved', 'verified'] },
  { emoji: '🔖', ascii2: 'BM', ascii3: 'BKM', name: 'bookmark', aliases: ['mark'] },
  { emoji: '📌', ascii2: 'PN', ascii3: 'PIN', name: 'pin', aliases: ['pinned', 'marker'] },
  { emoji: '🧾', ascii2: 'RC', ascii3: 'RCP', name: 'receipt', aliases: ['proof'] },
  { emoji: '📜', ascii2: 'DC', ascii3: 'DOC', name: 'document', aliases: ['certificate'] },
  { emoji: '🪪', ascii2: 'ID', ascii3: 'IDC', name: 'identity', aliases: ['badge'] },
  { emoji: '🔏', ascii2: 'SG', ascii3: 'SIG', name: 'signed', aliases: ['sealed'] },
  { emoji: '🖋️', ascii2: 'IN', ascii3: 'INK', name: 'ink', aliases: ['pen'] },
  { emoji: '✒️', ascii2: 'PN', ascii3: 'PEN', name: 'pen', aliases: ['nib'] },
  { emoji: '🧰', ascii2: 'TB', ascii3: 'BOX', name: 'toolbox', aliases: ['tools'] },
  { emoji: '🛠️', ascii2: 'TL', ascii3: 'TLS', name: 'tools', aliases: ['build'] },
  { emoji: '🚀', ascii2: 'RX', ascii3: 'RKT', name: 'rocket', aliases: ['deploy'] },
  { emoji: '🧪', ascii2: 'QA', ascii3: 'TST', name: 'test', aliases: ['lab'] },
  { emoji: '🎟️', ascii2: 'TK', ascii3: 'TKT', name: 'ticket', aliases: ['pass'] },
  { emoji: '🎫', ascii2: 'TK', ascii3: 'TIX', name: 'ticket-alt', aliases: ['token'] },
  { emoji: '🪙', ascii2: 'CN', ascii3: 'CON', name: 'coin', aliases: ['token'] },
  { emoji: '🧱', ascii2: 'BL', ascii3: 'BLD', name: 'brick', aliases: ['build'] },
  { emoji: '🔐', ascii2: 'LK', ascii3: 'LCK', name: 'lock', aliases: ['secure'] },
];

export const defaultEmojis = defaultTokenMappings.map((mapping) => mapping.emoji);

export const defaultAscii = [
  'ST', 'MK', 'TAG', 'LBL', 'SEAL', 'OK', 'CHK', 'SIG', 'ID', 'VER', 'REL', 'BLD', 'DEP',
  'CI', 'QA', 'GIT', 'SHA', 'RUN', 'TKT', 'CERT', 'LOCK', 'PIN',
];

export const defaultWordAliases: WordAlias[] = [
  { word: 'melon', code2: 'ML', code3: 'MLN', aliases: ['watermelon', 'fruit'] },
  { word: 'mango', code2: 'MG', code3: 'MNG' },
  { word: 'banana', code2: 'BN', code3: 'BNA' },
  { word: 'cherry', code2: 'CH', code3: 'CHR' },
  { word: 'lemon', code2: 'LM', code3: 'LMN' },
  { word: 'peach', code2: 'PC', code3: 'PCH' },
  { word: 'plum', code2: 'PL', code3: 'PLM' },
  { word: 'grape', code2: 'GP', code3: 'GRP' },
  { word: 'silver', code2: 'SV', code3: 'SLV' },
  { word: 'golden', code2: 'GD', code3: 'GLD' },
  { word: 'crimson', code2: 'CR', code3: 'CRM' },
  { word: 'azure', code2: 'AZ', code3: 'AZR' },
  { word: 'violet', code2: 'VT', code3: 'VLT' },
  { word: 'amber', code2: 'AM', code3: 'AMB' },
  { word: 'jade', code2: 'JD', code3: 'JDE' },
  { word: 'coral', code2: 'CL', code3: 'CRL' },
  { word: 'river', code2: 'RV', code3: 'RVR' },
  { word: 'forest', code2: 'FR', code3: 'FRS' },
  { word: 'mountain', code2: 'MT', code3: 'MTN' },
  { word: 'ocean', code2: 'OC', code3: 'OCN' },
  { word: 'garden', code2: 'GR', code3: 'GRD' },
  { word: 'canyon', code2: 'CN', code3: 'CYN' },
  { word: 'valley', code2: 'VL', code3: 'VLY' },
  { word: 'island', code2: 'IS', code3: 'ISL' },
  { word: 'orbit', code2: 'OR', code3: 'ORB' },
  { word: 'pixel', code2: 'PX', code3: 'PXL' },
  { word: 'vector', code2: 'VC', code3: 'VEC' },
  { word: 'debug', code2: 'DG', code3: 'DBG' },
  { word: 'patch', code2: 'PT', code3: 'PTC' },
  { word: 'build', code2: 'BD', code3: 'BLD' },
  { word: 'deploy', code2: 'DP', code3: 'DPL' },
  { word: 'branch', code2: 'BR', code3: 'BRN' },
  { word: 'matrix', code2: 'MX', code3: 'MTX' },
  { word: 'kernel', code2: 'KN', code3: 'KRN' },
  { word: 'socket', code2: 'SK', code3: 'SCK' },
  { word: 'buffer', code2: 'BF', code3: 'BUF' },
  { word: 'cipher', code2: 'CP', code3: 'CPH' },
  { word: 'proxy', code2: 'PR', code3: 'PRX' },
  { word: 'router', code2: 'RT', code3: 'RTR' },
  { word: 'rocket', code2: 'RX', code3: 'RKT' },
  { word: 'thunder', code2: 'TH', code3: 'THR' },
  { word: 'signal', code2: 'SG', code3: 'SIG' },
  { word: 'echo', code2: 'EC', code3: 'ECH' },
  { word: 'mirror', code2: 'MR', code3: 'MIR' },
  { word: 'shadow', code2: 'SH', code3: 'SHD' },
  { word: 'phantom', code2: 'PH', code3: 'PHM' },
  { word: 'nova', code2: 'NV', code3: 'NVA' },
  { word: 'spark', code2: 'SP', code3: 'SPK' },
  { word: 'comet', code2: 'CM', code3: 'CMT' },
];

export const presetFormats = {
  minimal: '{env}-{word1}-{word2}-{date}-{user}@{commit}',
  standard: '{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}',
  verbose: '{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}{dirty}{branch}{buildNumber}',
  games: '{token1}-{token2}-{word1}-{word2}-{time}-{user}@{commit}',
  ci: '{env}-{cloud}-{token1}-{token2}-{date}-{time}-{user}@{commit}{buildNumber}',
  ascii: '{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}',
  custom: '{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}',
} as const;

export const defaultFormat = presetFormats.standard;
export const asciiFormat = presetFormats.ascii;
