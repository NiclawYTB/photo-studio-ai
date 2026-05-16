// =============================================================================
// PROMPT OPTIONS — v3
//
// Architecture par catégories de "scènes" (Studio, Tapis, Matières Nobles).
// Chaque scène contient des groupes de fonds.
// Tous les fonds sont indexés par un ID global unique (background).
//
// Côté serveur, on reçoit uniquement des IDs depuis le client ; on les
// résout ici. Tout ID inconnu retombe sur le défaut (white).
// =============================================================================

// ---- Catégories de scènes (fonds groupés) ----

export const SCENES = {
  studio: {
    id: 'studio',
    label: 'Studio',
    locked: false,
    groups: {
      solid: {
        label: 'Couleurs unies',
        choices: [
          { id: 'white',   label: 'Blanc pur',    swatch: '#ffffff', prompt: 'pure white seamless studio backdrop' },
          { id: 'black',   label: 'Noir profond', swatch: '#0a0a0a', prompt: 'deep matte black seamless studio backdrop' },
          { id: 'gray',    label: 'Anthracite',   swatch: '#3a3a3a', prompt: 'dark anthracite gray seamless studio backdrop' },
          { id: 'beige',   label: 'Beige sable',  swatch: '#e8d9c0', prompt: 'warm sand beige seamless studio backdrop' },
          { id: 'pink',    label: 'Rose pâle',    swatch: '#f5dce0', prompt: 'pale soft pink seamless studio backdrop' },
          { id: 'sage',    label: 'Vert sauge',   swatch: '#b8c9a8', prompt: 'muted sage green seamless studio backdrop' },
          { id: 'sky',     label: 'Bleu ciel',    swatch: '#c8dcec', prompt: 'pale sky blue seamless studio backdrop' },
        ],
      },
      gradient: {
        label: 'Dégradés subtils',
        choices: [
          { id: 'sunset', label: 'Sunset Glow', swatch: 'linear-gradient(135deg, #ffd5b0, #ff9d7d)', prompt: 'subtle warm orange gradient backdrop, soft sunset glow ambiance' },
          { id: 'nordic', label: 'Nordic Mist', swatch: 'linear-gradient(135deg, #d4dde8, #8fa3b8)', prompt: 'subtle cool blue-gray gradient backdrop, nordic mist ambiance' },
          { id: 'mint',   label: 'Soft Mint',   swatch: 'linear-gradient(135deg, #d5ebd9, #a3cba8)', prompt: 'subtle soft mint green gradient backdrop' },
        ],
      },
    },
  },

  rug: {
    id: 'rug',
    label: 'Tapis',
    locked: false,
    groups: {
      shaggy: {
        label: 'Shaggy Rug',
        choices: [
          { id: 'shaggy_white',      label: 'Blanc Neige',     swatch: '#f0eee8', prompt: 'a soft fluffy plush white snow-toned shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_cream',      label: 'Beige Crème',     swatch: '#d8c8a8', prompt: 'a soft fluffy plush cream beige shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_anthracite', label: 'Gris Anthracite', swatch: '#2a2a2c', prompt: 'a soft fluffy plush dark anthracite gray shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_teal',       label: 'Bleu Canard',     swatch: '#1f4d52', prompt: 'a soft fluffy plush deep teal blue shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_rose',       label: 'Vieux Rose',      swatch: '#c89a96', prompt: 'a soft fluffy plush dusty old rose shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_royal',      label: 'Bleu Roi',        swatch: '#2545a8', prompt: 'a soft fluffy plush royal blue shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_mustard',    label: 'Jaune Moutarde',  swatch: '#c89020', prompt: 'a soft fluffy plush mustard yellow shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_emerald',    label: 'Vert Émeraude',   swatch: '#2a8060', prompt: 'a soft fluffy plush emerald green shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_sienna',     label: 'Terre de Sienne', swatch: '#a85530', prompt: 'a soft fluffy plush sienna terracotta shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
          { id: 'shaggy_lavender',   label: 'Lavande',         swatch: '#a890c8', prompt: 'a soft fluffy plush soft lavender shaggy rug with long deep fibers, photographed from above, the product laid flat resting gently on top of the rug fibers' },
        ],
      },
      natural: {
        label: 'Naturel / Vintage',
        choices: [
          { id: 'jute', label: 'Jute Tissé', swatch: '#c5a572', prompt: 'a woven natural jute rug with visible tight braided texture, photographed from above, the product laid flat resting on the jute surface' },
        ],
      },
    },
  },

  noble: {
    id: 'noble',
    label: 'Matières Nobles',
    locked: true,
    teaser: 'Marbre, bois, cuir, velours — bientôt disponible',
  },
};

// ---- Type de produit ----

export const PRODUCT_TYPES = {
  label: 'Type de produit',
  defaultId: 'generic',
  choices: [
    { id: 'video_game_box',       label: 'Boîte de jeu',   icon: '🎮', prompt: 'a video game box with original cover art' },
    { id: 'video_game_cartridge', label: 'Cartouche',      icon: '💾', prompt: 'a video game cartridge or disc' },
    { id: 'dvd',                  label: 'DVD / Blu-ray',  icon: '💿', prompt: 'a DVD or Blu-ray case' },
    { id: 'tshirt',               label: 'T-shirt',        icon: '👕', prompt: 'a t-shirt' },
    { id: 'hoodie',               label: 'Hoodie',         icon: '🧥', prompt: 'a hoodie' },
    { id: 'jacket',               label: 'Veste',          icon: '🧥', prompt: 'a jacket' },
    { id: 'pants',                label: 'Pantalon',       icon: '👖', prompt: 'a pair of pants' },
    { id: 'shoes',                label: 'Chaussures',     icon: '👟', prompt: 'a pair of shoes' },
    { id: 'generic',              label: 'Autre',          icon: '📦', prompt: 'a product' },
  ],
};

// ---- Support ----

export const SUPPORTS = {
  label: 'Support',
  defaultId: 'flat',
  choices: [
    { id: 'flat',        label: 'À plat',       prompt: 'laid flat in its original folded layout, photographed from directly above or at a slight angle, no visible stand' },
    { id: 'black_stand', label: 'Support noir', prompt: 'displayed on a sleek matte black product stand (only relevant for boxed or rigid products)' },
    { id: 'transparent', label: 'Transparent',  prompt: 'displayed on a clear transparent acrylic stand (only relevant for boxed or rigid products)' },
    { id: 'floating',    label: 'Flottant',     prompt: 'floating mid-air with a subtle drop shadow underneath, no visible support' },
  ],
};

// ---- Éclairage ----

export const LIGHTINGS = {
  label: 'Éclairage',
  defaultId: 'studio',
  choices: [
    { id: 'studio',    label: 'Studio propre',     prompt: 'clean professional studio lighting, evenly diffused, no harsh shadows on the product itself' },
    { id: 'dramatic',  label: 'Dramatique',        prompt: 'dramatic directional lighting with a soft external drop shadow, high contrast on the environment only' },
    { id: 'soft',      label: 'Doux',              prompt: 'soft diffused daylight lighting, minimalist clean look' },
    { id: 'warm',      label: 'Chaud / lifestyle', prompt: 'warm ambient lifestyle lighting, golden hour tones on the surrounding environment' },
  ],
};

// ---- Mise en scène premium (verrouillé — teaser UI seulement) ----

export const PREMIUM_STAGING = [
  { id: 'ghost_mannequin', label: 'Mannequin Invisible', tag: '3D', desc: 'Effet ghost mannequin pro' },
  { id: 'virtual_model',   label: 'Porté Virtuel',       tag: 'IA', desc: 'Silhouette anonyme style Vinted' },
  { id: 'mirror_selfie',   label: 'Photo Miroir',        tag: 'IA', desc: 'Selfie miroir naturel à domicile' },
];

// ============================================================================
// Résolution + construction du prompt côté serveur
// ============================================================================

function findBackgroundChoice(id) {
  for (const scene of Object.values(SCENES)) {
    if (scene.locked || !scene.groups) continue;
    for (const group of Object.values(scene.groups)) {
      const found = group.choices.find((c) => c.id === id);
      if (found) return found;
    }
  }
  return null;
}

function findInSimple(category, id) {
  return category.choices.find((c) => c.id === id);
}

function resolveAll(selections) {
  const product  = findInSimple(PRODUCT_TYPES, selections.productType)
                || findInSimple(PRODUCT_TYPES, PRODUCT_TYPES.defaultId);
  const support  = findInSimple(SUPPORTS, selections.support)
                || findInSimple(SUPPORTS, SUPPORTS.defaultId);
  const lighting = findInSimple(LIGHTINGS, selections.lighting)
                || findInSimple(LIGHTINGS, LIGHTINGS.defaultId);
  const bg       = findBackgroundChoice(selections.background)
                || findBackgroundChoice('white');
  return { product, support, lighting, bg };
}

// Helper : retrouver la scène (studio/rug) d'un id de fond.
export function findSceneForBackground(id) {
  for (const [sceneId, scene] of Object.entries(SCENES)) {
    if (scene.locked || !scene.groups) continue;
    for (const group of Object.values(scene.groups)) {
      if (group.choices.some((c) => c.id === id)) return sceneId;
    }
  }
  return 'studio';
}

export function findBackgroundLabel(id) {
  const c = findBackgroundChoice(id);
  return c ? c.label : null;
}

// Le prompt final — STRICT sur la préservation du produit.
export function buildPrompt(selections = {}) {
  const { product, support, lighting, bg } = resolveAll(selections);

  return [
    `Transform this photo into a professional studio product photograph of ${product.prompt}, for an online resale listing.`,
    `Environment: ${bg.prompt}.`,
    `Display: ${support.prompt}.`,
    `Lighting: ${lighting.prompt}.`,
    '',
    'STRICT PRESERVATION RULES — do not deviate under any circumstance:',
    '- Keep the EXACT fabric, material, texture and weave of the product as in the source photo. Do not change cotton into polyester, knit into woven, matte into shiny, or any other material swap.',
    '- Keep the EXACT folding, layout, draping and overall shape of the product as in the source photo. Do not re-fold, re-arrange, straighten, hang, stretch or otherwise modify how the product is laid.',
    '- Keep the EXACT proportions, dimensions, silhouette and aspect ratio of the product.',
    '- Keep ALL existing visible details: logos, embroidery, prints, seams, stitching, buttons, zippers, labels, drawstrings, hardware.',
    '- Keep the internal shadows, creases and structural folds that define the garment shape — these are part of the product, not flaws.',
    '',
    'PERMITTED IMPROVEMENTS — only these, and only subtly:',
    '- Remove dust, lint, hair, pet fur, small stains and surface dirt.',
    '- Smooth only superficial micro-wrinkles (never structural folds).',
    '- Replace the surrounding environment, surface and ambient lighting only.',
    '- Add a realistic external drop shadow consistent with the new lighting.',
    '',
    'Output: sharp focus, high resolution, slightly elevated overhead or three-quarter framing depending on the support, commercial e-commerce product photography style. The product must remain instantly recognizable as the exact same physical item from the source photo.',
  ].join(' ');
}

export function describeSelections(selections = {}) {
  const { product, support, lighting, bg } = resolveAll(selections);
  return `${product.label} · ${bg.label} · ${support.label} · ${lighting.label}`;
}

// ============================================================================
// COMPAT: ancien export pour ne pas casser d'éventuels imports legacy.
// ============================================================================

export const OPTIONS = {
  productType: PRODUCT_TYPES,
  background: { label: 'Fond', defaultId: 'white' },
  support: SUPPORTS,
  lighting: LIGHTINGS,
};
