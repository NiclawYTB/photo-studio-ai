// Source unique des options de customisation.
// Importé côté client (UI) ET côté serveur (validation + build du prompt).
// Le serveur ne fait JAMAIS confiance à un prompt envoyé par le client :
// il ne reçoit que des IDs, qu'il valide ici.

export const OPTIONS = {
  productType: {
    label: 'Type de produit',
    defaultId: 'generic',
    choices: [
      { id: 'video_game_box',       label: 'Boîte de jeu',   icon: '🎮', prompt: 'video game box with the original cover art clearly visible on the front' },
      { id: 'video_game_cartridge', label: 'Cartouche',      icon: '💾', prompt: 'video game cartridge or disc' },
      { id: 'dvd',                  label: 'DVD / Blu-ray',  icon: '💿', prompt: 'DVD or Blu-ray case' },
      { id: 'tshirt',               label: 'T-shirt',        icon: '👕', prompt: 'folded or neatly hanging t-shirt' },
      { id: 'hoodie',               label: 'Hoodie',         icon: '🧥', prompt: 'folded or neatly hanging hoodie' },
      { id: 'jacket',               label: 'Veste',          icon: '🧥', prompt: 'jacket presented from the front' },
      { id: 'shoes',                label: 'Chaussures',     icon: '👟', prompt: 'pair of shoes presented side by side' },
      { id: 'generic',              label: 'Autre',          icon: '📦', prompt: 'product' },
    ],
  },

  background: {
    label: 'Fond',
    defaultId: 'white',
    choices: [
      { id: 'white',   label: 'Blanc pur',    swatch: '#ffffff', prompt: 'pure white seamless background' },
      { id: 'black',   label: 'Noir profond', swatch: '#0a0a0a', prompt: 'deep matte black seamless background' },
      { id: 'gray',    label: 'Anthracite',   swatch: '#3a3a3a', prompt: 'dark anthracite gray seamless background' },
      { id: 'beige',   label: 'Beige sable',  swatch: '#e8d9c0', prompt: 'warm sand beige seamless background' },
      { id: 'pink',    label: 'Rose pâle',    swatch: '#f5dce0', prompt: 'pale soft pink seamless background' },
      { id: 'sage',    label: 'Vert sauge',   swatch: '#b8c9a8', prompt: 'muted sage green seamless background' },
      { id: 'sky',     label: 'Bleu ciel',    swatch: '#c8dcec', prompt: 'pale sky blue seamless background' },
      { id: 'sunset',  label: 'Sunset Glow',  swatch: 'linear-gradient(135deg, #ffd5b0, #ff9d7d)', prompt: 'subtle warm orange gradient background, soft sunset glow ambiance' },
      { id: 'nordic',  label: 'Nordic Mist',  swatch: 'linear-gradient(135deg, #d4dde8, #8fa3b8)', prompt: 'subtle cool blue-gray gradient background, nordic mist ambiance' },
      { id: 'mint',    label: 'Soft Mint',    swatch: 'linear-gradient(135deg, #d5ebd9, #a3cba8)', prompt: 'subtle soft mint green gradient background' },
    ],
  },

  support: {
    label: 'Support',
    defaultId: 'black_stand',
    choices: [
      { id: 'black_stand', label: 'Support noir',  prompt: 'displayed on a sleek matte black display stand' },
      { id: 'no_support',  label: 'À plat',        prompt: 'laid flat on the surface, viewed from above or at a slight angle, no support visible' },
      { id: 'transparent', label: 'Transparent',   prompt: 'displayed on a clear transparent acrylic stand' },
      { id: 'floating',    label: 'Flottant',      prompt: 'floating mid-air, levitating, no visible support, subtle drop shadow' },
      { id: 'fabric',      label: 'Sur tissu',     prompt: 'resting on softly draped fabric' },
    ],
  },

  lighting: {
    label: 'Éclairage',
    defaultId: 'studio',
    choices: [
      { id: 'studio',    label: 'Studio propre',     prompt: 'clean professional studio lighting, evenly diffused, no harsh shadows' },
      { id: 'dramatic',  label: 'Dramatique',        prompt: 'dramatic directional lighting with defined shadows, high contrast' },
      { id: 'soft',      label: 'Doux',              prompt: 'soft diffused lighting, minimal subtle shadows, minimalist clean look' },
      { id: 'warm',      label: 'Chaud / lifestyle', prompt: 'warm ambient lighting, wooden lifestyle ambiance, golden hour tones' },
    ],
  },
};

function resolve(category, id) {
  const cat = OPTIONS[category];
  if (!cat) return null;
  return (
    cat.choices.find((c) => c.id === id) ||
    cat.choices.find((c) => c.id === cat.defaultId)
  );
}

export function buildPrompt(selections = {}) {
  const product  = resolve('productType', selections.productType);
  const bg       = resolve('background',  selections.background);
  const support  = resolve('support',     selections.support);
  const lighting = resolve('lighting',    selections.lighting);

  return [
    'Transform this photo into a professional studio product photograph for an online resale listing.',
    `Product: ${product.prompt}.`,
    `Background: ${bg.prompt}.`,
    `Display: ${support.prompt}.`,
    `Lighting: ${lighting.prompt}.`,
    'Slightly distant framing, sharp focus, high resolution, commercial e-commerce photography style.',
    'Keep the original product exactly as shown in the source photo — same colors, artwork, shape and proportions — only restyle the studio environment around it.',
  ].join(' ');
}

export function describeSelections(selections = {}) {
  const product  = resolve('productType', selections.productType);
  const bg       = resolve('background',  selections.background);
  const support  = resolve('support',     selections.support);
  const lighting = resolve('lighting',    selections.lighting);
  return `${product.label} · ${bg.label} · ${support.label} · ${lighting.label}`;
}
