// =============================================================================
// PROMPT OPTIONS — Photo Studio
//
// Architecture :
// - Le client envoie uniquement les IDs sélectionnés (`{ background: 'rug_white_snow', ... }`)
// - Le serveur valide et construit le prompt via buildPrompt()
// - Tout ID inconnu → fallback sur le défaut (impossible d'injecter un prompt brut)
//
// Règles d'or :
// 1. Le vêtement source DOIT être préservé à 100% (matière, motifs, couleurs, draping)
// 2. Seul l'ENVIRONNEMENT change (fond + éclairage)
// 3. Les fonds "Tapis" forcent un cadrage flat-lay top-down
// =============================================================================

export const OPTIONS = {

  // ---------------------------------------------------------------------------
  // TYPE DE PRODUIT — détails visuels par type pour bien guider Kontext
  // ---------------------------------------------------------------------------
  productType: {
    label: 'Type de produit',
    defaultId: 'generic',
    choices: [
      { id: 'tshirt',  label: 'T-shirt', icon: '👕',
        prompt: 'T-shirt laid completely flat, both sleeves spread out symmetrically, collar visible at the top, no folding, fabric perfectly smooth showing the full print or design.' },

      { id: 'hoodie',  label: 'Hoodie', icon: '🧥',
        prompt: 'Hoodie laid completely flat with the hood spread out at the top of the frame, both sleeves spread symmetrically to the sides, front kangaroo pocket visible, drawstrings arranged naturally.' },

      { id: 'sweater', label: 'Pull / Sweat', icon: '🧶',
        prompt: 'Knit sweater laid completely flat, both sleeves spread out symmetrically and slightly bent, collar at the top, fabric showing knit pattern and texture clearly.' },

      { id: 'jacket',  label: 'Veste', icon: '🧥',
        prompt: 'Jacket laid flat, fully buttoned or zipped if applicable, both sleeves spread out symmetrically, collar visible at the top.' },

      { id: 'pants',   label: 'Pantalon / Jean', icon: '👖',
        prompt: 'Pants laid completely flat, both legs perfectly aligned and straight, waistband at the top, no folding.' },

      { id: 'dress',   label: 'Robe', icon: '👗',
        prompt: 'Dress laid completely flat, full silhouette visible, fabric smooth, no creases, viewed from above.' },

      { id: 'shoes',   label: 'Chaussures', icon: '👟',
        prompt: 'Pair of shoes side by side, viewed from above at a slight angle, laces and details fully visible.' },

      { id: 'accessory', label: 'Accessoire', icon: '👜',
        prompt: 'The accessory laid flat or upright, fully visible, all details and hardware showing clearly.' },

      { id: 'generic', label: 'Autre vêtement', icon: '📦',
        prompt: 'The garment laid flat, fully visible from above, all details and patterns clearly shown.' },
    ],
  },

  // ---------------------------------------------------------------------------
  // FONDS — organisés en 3 catégories visuelles
  // ---------------------------------------------------------------------------
  background: {
    label: 'Fond',
    defaultId: 'rug_white_snow',
    // Catégories pour l'UI (l'app filtre selon la tab active)
    categories: [
      { id: 'rug',    label: 'Tapis',           active: true },
      { id: 'studio', label: 'Studio',          active: true },
      { id: 'noble',  label: 'Matières Nobles', active: false, badge: 'Bientôt' },
    ],
    choices: [
      // ===== TAPIS — keywords directs : faux fur, plush, shag =====
      // Style ivory shaggy rug, fluffy faux fur carpet, ultra soft plush texture,
      // long fiber rug, cozy Scandinavian rug, luxury shag carpet.
      { id: 'rug_white_snow', label: 'Blanc Neige', category: 'rug', swatch: '#F5F0E6',
        prompt: 'Place the garment on an ivory shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, white furry mat, cozy Scandinavian rug, luxury shag carpet, minimalist fluffy rug, cream plush carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug texture must completely fill the entire image edge-to-edge — NO visible edges, NO corners, NO borders, NO rug ends anywhere. The rug extends infinitely beyond the photograph in all directions. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_beige_cream', label: 'Beige Crème', category: 'rug', swatch: '#E5D5BC',
        prompt: 'Place the garment on a warm beige shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, cream beige furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges, corners, or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_anthracite', label: 'Anthracite', category: 'rug', swatch: '#3A3A3A',
        prompt: 'Place the garment on a dark anthracite gray shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, charcoal furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges, corners, or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_teal', label: 'Bleu Canard', category: 'rug', swatch: '#1F5F6B',
        prompt: 'Place the garment on a rich teal blue shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, teal furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_dusty_rose', label: 'Vieux Rose', category: 'rug', swatch: '#C9959A',
        prompt: 'Place the garment on a dusty rose pink shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, pink furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_royal_blue', label: 'Bleu Roi', category: 'rug', swatch: '#1F3C8C',
        prompt: 'Place the garment on a vibrant royal blue shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, blue furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_mustard', label: 'Jaune Moutarde', category: 'rug', swatch: '#C99A2E',
        prompt: 'Place the garment on a warm mustard yellow shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, mustard furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_emerald', label: 'Vert Émeraude', category: 'rug', swatch: '#2A6A4E',
        prompt: 'Place the garment on a deep emerald green shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, green furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_sienna', label: 'Terre de Sienne', category: 'rug', swatch: '#9C5536',
        prompt: 'Place the garment on a warm terracotta sienna brown shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, terracotta furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_lavender', label: 'Lavande', category: 'rug', swatch: '#A89CC8',
        prompt: 'Place the garment on a soft lavender purple shaggy rug, fluffy faux fur carpet, ultra soft plush texture, long fiber rug, lavender furry mat, cozy Scandinavian rug, luxury shag carpet, realistic fur texture, fibers naturally arranged in soft wavy patterns. CRITICAL: the rug must fill the entire image edge-to-edge — NO visible edges or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      { id: 'rug_jute', label: 'Jute Tissé', category: 'rug', swatch: '#B8A179',
        prompt: 'Place the garment on a tightly woven flat natural jute texture, warm beige-tan color, with subtle visible weave pattern. CRITICAL: the texture must fill the entire image edge-to-edge — NO visible edges, corners, or borders anywhere. Natural soft daylight, authentic marketplace listing photo style.' },

      // ===== STUDIO (couleurs unies) =====
      { id: 'bg_white',  label: 'Blanc pur',    category: 'studio', swatch: '#ffffff',
        prompt: 'pure white seamless studio background, completely flat color, no texture' },
      { id: 'bg_black',  label: 'Noir profond', category: 'studio', swatch: '#0a0a0a',
        prompt: 'deep matte black seamless studio background, completely flat color' },
      { id: 'bg_gray',   label: 'Anthracite',   category: 'studio', swatch: '#3a3a3a',
        prompt: 'dark anthracite gray seamless studio background, completely flat color' },
      { id: 'bg_beige',  label: 'Beige sable',  category: 'studio', swatch: '#E8D9C0',
        prompt: 'warm sand beige seamless studio background, completely flat color' },
      { id: 'bg_pink',   label: 'Rose pâle',    category: 'studio', swatch: '#F5DCE0',
        prompt: 'pale soft pink seamless studio background, completely flat color' },
      { id: 'bg_sage',   label: 'Vert sauge',   category: 'studio', swatch: '#B8C9A8',
        prompt: 'muted sage green seamless studio background, completely flat color' },
      { id: 'bg_sky',    label: 'Bleu ciel',    category: 'studio', swatch: '#C8DCEC',
        prompt: 'pale sky blue seamless studio background, completely flat color' },
      { id: 'bg_sunset', label: 'Sunset Glow',  category: 'studio', swatch: 'linear-gradient(135deg, #ffd5b0, #ff9d7d)',
        prompt: 'subtle warm orange-to-peach gradient studio background, soft sunset glow ambiance' },
      { id: 'bg_nordic', label: 'Nordic Mist',  category: 'studio', swatch: 'linear-gradient(135deg, #d4dde8, #8fa3b8)',
        prompt: 'subtle cool blue-gray gradient studio background, nordic mist ambiance' },
      { id: 'bg_mint',   label: 'Soft Mint',    category: 'studio', swatch: 'linear-gradient(135deg, #d5ebd9, #a3cba8)',
        prompt: 'subtle soft mint green gradient studio background' },

      // ===== MATIÈRES NOBLES (locked) =====
      { id: 'noble_marble', label: 'Marbre',  category: 'noble', swatch: '#E8E2D5', locked: true,
        prompt: 'place the garment on a polished white Carrara marble surface with subtle gray veining' },
      { id: 'noble_wood',   label: 'Bois clair', category: 'noble', swatch: '#C9A57A', locked: true,
        prompt: 'place the garment on a light oak wood surface with natural grain' },
      { id: 'noble_leather',label: 'Cuir', category: 'noble', swatch: '#5A3A2A', locked: true,
        prompt: 'place the garment on a soft cognac leather surface' },
      { id: 'noble_velvet', label: 'Velours', category: 'noble', swatch: '#3A1F4A', locked: true,
        prompt: 'place the garment on a deep velvet surface' },
    ],
  },

  // ---------------------------------------------------------------------------
  // SUPPORT — pertinence dépend du fond
  // ---------------------------------------------------------------------------
  support: {
    label: 'Présentation',
    defaultId: 'flat_lay',
    choices: [
      { id: 'flat_lay',   label: 'À plat (vue du dessus)',
        prompt: 'Garment laid completely flat on the surface, viewed from directly above (top-down flat-lay view), arranged neatly and symmetrically.' },
      { id: 'flat_angle', label: 'À plat (léger angle)',
        prompt: 'Garment laid flat on the surface, viewed from above at a slight 15° angle for subtle perspective.' },
      { id: 'hanging',    label: 'Suspendu',
        prompt: 'Garment hanging vertically as if on an invisible hanger, fully visible from the front, no support visible.' },
      { id: 'floating',   label: 'Flottant',
        prompt: 'Garment floating mid-air, levitating slightly, no visible support, with a subtle natural drop shadow below.' },
    ],
  },

  // ---------------------------------------------------------------------------
  // ÉCLAIRAGE
  // ---------------------------------------------------------------------------
  lighting: {
    label: 'Éclairage',
    defaultId: 'soft_daylight',
    choices: [
      { id: 'soft_daylight', label: 'Lumière douce',
        prompt: 'Soft natural daylight from above, evenly diffused, gentle minimal shadows, clean and bright atmosphere.' },
      { id: 'studio_clean',  label: 'Studio pro',
        prompt: 'Professional studio lighting, perfectly even, no harsh shadows, commercial photography quality.' },
      { id: 'dramatic',      label: 'Contrasté',
        prompt: 'Directional lighting from one side, defined natural shadows, moderate contrast for depth.' },
      { id: 'golden',        label: 'Chaud',
        prompt: 'Warm golden hour lighting, soft warm tones, gentle long shadows, cozy ambiance.' },
    ],
  },
};

// =============================================================================
// Helpers
// =============================================================================

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

  // Si le fond est un tapis, on force le flat-lay (cohérence visuelle)
  const isRug = bg.category === 'rug';
  const finalSupport = isRug
    ? OPTIONS.support.choices.find((s) => s.id === 'flat_lay')
    : support;

  return [
    // === 1. CONTEXTE GLOBAL ===
    'Transform this photo into a professional product listing photograph for online resale (Vinted, eBay, Leboncoin marketplace style).',

    // === 2. PRÉSERVATION ABSOLUE (le plus important) ===
    'ABSOLUTE PRESERVATION RULES — DO NOT VIOLATE:',
    'The garment fabric, knit pattern, weave, threads, and material composition MUST remain 100% IDENTICAL to the source photo. DO NOT alter the wool, cotton, polyester, or any material in any way — preserve every fiber exactly.',
    'ALL embroideries, prints, logos, labels, motifs, patterns, decorations, brand tags, and stitching MUST be reproduced EXACTLY — same colors, same positions, same shapes, same sizes, same count.',
    'The garment colors MUST be reproduced with PERFECT accuracy. NO color shift, NO saturation boost, NO desaturation, NO white balance change.',
    'The garment\'s proportions, silhouette, draping, folding, and natural creases MUST remain UNCHANGED from the source.',
    'DO NOT add or remove buttons, zippers, seams, pockets, drawstrings, or any structural element.',
    'PERMITTED ONLY: remove dust/lint/hair/stains from fabric, smooth tiny micro-wrinkles (not structural folds), replace the background environment, adjust lighting, add a soft natural drop shadow.',

    // === 3. PRODUIT ===
    `Product framing: ${product.prompt}`,

    // === 4. SCÈNE ===
    `Background scene: ${bg.prompt}.`,
    `Presentation: ${finalSupport.prompt}`,
    `Lighting: ${lighting.prompt}`,

    // === 5. STYLE FINAL ===
    'Sharp focus on the garment, high resolution, no measuring tape, no rulers, no props, no hangers visible, no mannequin. Clean marketplace listing photography aesthetic.',
  ].join(' ');
}

export function describeSelections(selections = {}) {
  const product  = resolve('productType', selections.productType);
  const bg       = resolve('background',  selections.background);
  const support  = resolve('support',     selections.support);
  const lighting = resolve('lighting',    selections.lighting);
  return `${product.label} · ${bg.label} · ${support.label} · ${lighting.label}`;
}
