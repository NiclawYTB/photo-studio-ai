// =============================================================================
// PROMPT OPTIONS — Photo Studio (multi-catégories)
//
// Architecture :
// - Le client envoie uniquement les IDs sélectionnés
//     { category, productType, background, support, lighting }
// - Le serveur valide et construit le prompt via buildPrompt()
// - Tout ID inconnu → fallback sur le défaut (impossible d'injecter un prompt brut)
//
// NIVEAUX :
//   1. category    → 'vetement' | 'electronique'
//   2. productType → dépend de la catégorie (liste dans choicesByCategory)
//   3. background  → dépend de la catégorie, regroupé en onglets (tab)
//        vetement     : tapis | mannequin
//        electronique : bureau | unique
//
// ⚠️ Les prompts marqués "PROVISOIRE" sont à affiner plus tard.
// =============================================================================

export const OPTIONS = {

  // ---------------------------------------------------------------------------
  // NIVEAU 1 — CATÉGORIE
  // ---------------------------------------------------------------------------
  category: {
    label: 'Catégorie',
    defaultId: 'vetement',
    choices: [
      { id: 'vetement',     label: 'Vêtement',     icon: '👕' },
      { id: 'electronique', label: 'Électronique', icon: '🎮' },
    ],
  },

  // ---------------------------------------------------------------------------
  // NIVEAU 2 — TYPE DE PRODUIT (dépend de la catégorie)
  // ---------------------------------------------------------------------------
  productType: {
    label: 'Type de produit',
    defaultByCategory: {
      vetement: 'tshirt',
      electronique: 'console',
    },
    choicesByCategory: {

      // ===== VÊTEMENT =====
      vetement: [
        { id: 'tshirt',  label: 'T-shirt', icon: '👕',
          prompt: 'T-shirt laid completely flat, both sleeves spread out symmetrically, collar visible at the top, no folding, fabric perfectly smooth showing the full print or design.' },
        { id: 'pull',    label: 'Pull / Sweat', icon: '🧶',
          prompt: 'Knit sweater or sweatshirt laid completely flat, both sleeves spread out symmetrically and slightly bent, collar at the top, fabric showing knit pattern and texture clearly.' },
        { id: 'hoodie',  label: 'Hoodie', icon: '🧥',
          prompt: 'Hoodie laid completely flat with the hood spread out at the top of the frame, both sleeves spread symmetrically to the sides, front kangaroo pocket visible, drawstrings arranged naturally.' },
        { id: 'chemise', label: 'Chemise', icon: '👔',
          prompt: 'Shirt laid completely flat, buttoned, collar visible at the top, both sleeves spread out symmetrically, fabric smooth showing the weave and any pattern.' },
        { id: 'veste',   label: 'Veste / Manteau', icon: '🧥',
          prompt: 'Jacket or coat laid flat, fully buttoned or zipped if applicable, both sleeves spread out symmetrically, collar visible at the top.' },
        { id: 'pantalon', label: 'Pantalon / Jean', icon: '👖',
          prompt: 'Pants laid completely flat, both legs perfectly aligned and straight, waistband at the top, no folding.' },
        { id: 'jogging', label: 'Jogging', icon: '🩳',
          prompt: 'Jogging bottoms / sweatpants laid completely flat, both legs aligned and straight, elastic waistband and drawstrings visible at the top, fabric smooth.' },
        { id: 'short',   label: 'Short', icon: '🩳',
          prompt: 'Shorts laid completely flat, both legs aligned symmetrically, waistband at the top, fabric smooth.' },
        { id: 'robe',    label: 'Robe', icon: '👗',
          prompt: 'Dress laid completely flat, full silhouette visible, fabric smooth, no creases, viewed from above.' },
        { id: 'jupe',    label: 'Jupe', icon: '👗',
          prompt: 'Skirt laid completely flat, waistband at the top, full shape visible, fabric smooth.' },
        { id: 'chaussures', label: 'Chaussures', icon: '👟',
          prompt: 'Pair of shoes side by side, viewed from above at a slight angle, laces and details fully visible.' },
        { id: 'sac',     label: 'Sac / Accessoire', icon: '👜',
          prompt: 'The bag or accessory laid flat or upright, fully visible, all details and hardware showing clearly.' },
      ],

      // ===== ÉLECTRONIQUE ===== (prompts PROVISOIRES, à affiner)
      electronique: [
        { id: 'smartphone', label: 'Smartphone', icon: '📱',
          prompt: 'Smartphone shown from the front, screen clean and visible, centered, all edges and buttons clearly visible.' },
        { id: 'tablette',   label: 'Tablette', icon: '📲',
          prompt: 'Tablet shown from the front, screen clean, centered, full device visible.' },
        { id: 'console',    label: 'Console', icon: '🎮',
          prompt: 'Game console shown at a slight three-quarter angle, full device visible, ports and details sharp.' },
        { id: 'manette',    label: 'Manette', icon: '🕹️',
          prompt: 'Game controller shown from the top at a slight angle, all buttons, sticks and details clearly visible.' },
        { id: 'jeu',        label: 'Jeu vidéo', icon: '💿',
          prompt: 'Video game case presented standing upright and vertical, front cover artwork fully visible and facing the camera, perfectly sharp and centered.' },
        { id: 'casque',     label: 'Casque / Écouteurs', icon: '🎧',
          prompt: 'Headphones or earphones shown clearly, full product visible, details and finish sharp.' },
        { id: 'pc',         label: 'PC portable', icon: '💻',
          prompt: 'Laptop shown open at a slight three-quarter angle, screen and keyboard visible, full device in frame.' },
        { id: 'montre',     label: 'Montre connectée', icon: '⌚',
          prompt: 'Smartwatch shown from the front, screen and strap clearly visible, centered.' },
        { id: 'photo',      label: 'Appareil photo', icon: '📷',
          prompt: 'Camera shown at a slight three-quarter angle, lens and body details sharp, full device visible.' },
        { id: 'accessoire', label: 'Accessoire tech', icon: '🔌',
          prompt: 'The tech accessory shown clearly, full product visible, all connectors and details sharp.' },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // NIVEAU 3 — FOND (dépend de la catégorie + onglet/tab)
  // ---------------------------------------------------------------------------
  background: {
    label: 'Fond',
    // onglets + défaut par catégorie
    byCategory: {
      vetement: {
        defaultId: 'rug_white_snow',
        tabs: [
          { id: 'rug',       label: 'Tapis' },
          { id: 'mannequin', label: 'Mannequin' },
        ],
      },
      electronique: {
        defaultId: 'desk_plant',
        tabs: [
          { id: 'bureau', label: 'Bureau' },
          { id: 'unique', label: 'Fond unique' },
        ],
      },
    },
    // chaque choix est tagué { category, tab }
    choices: [

      // ===== VÊTEMENT · TAPIS (fourrure infinie) =====
      { id: 'rug_white_snow', label: 'Blanc Neige', category: 'vetement', tab: 'rug', swatch: '#F5F0E6',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in soft ivory cream color, ultra soft plush texture with long visible fibers (approximately 4 cm) naturally arranged in soft wavy clusters and patches, realistic fur appearance. The fluffy fur surface is the ONLY thing visible in the entire image besides the garment — it covers 100% of every pixel, from one edge of the frame to the other, extending infinitely in all directions far beyond the photograph. There is no floor, no wall, no furniture, no rug boundary visible anywhere. Top-down close-up flat-lay view. Natural soft daylight. Authentic e-commerce listing photograph style.' },
      { id: 'rug_beige_cream', label: 'Beige Crème', category: 'vetement', tab: 'rug', swatch: '#E5D5BC',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in warm cream beige color, ultra soft plush texture with long visible fibers naturally arranged in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely in all directions. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_anthracite', label: 'Anthracite', category: 'vetement', tab: 'rug', swatch: '#3A3A3A',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in dark anthracite gray color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely in all directions. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_teal', label: 'Bleu Canard', category: 'vetement', tab: 'rug', swatch: '#1F5F6B',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in rich teal blue color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_dusty_rose', label: 'Vieux Rose', category: 'vetement', tab: 'rug', swatch: '#C9959A',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in dusty rose pink color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_royal_blue', label: 'Bleu Roi', category: 'vetement', tab: 'rug', swatch: '#1F3C8C',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in vibrant royal blue color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_mustard', label: 'Jaune Moutarde', category: 'vetement', tab: 'rug', swatch: '#C99A2E',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in warm mustard yellow color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_emerald', label: 'Vert Émeraude', category: 'vetement', tab: 'rug', swatch: '#2A6A4E',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in deep emerald green color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_sienna', label: 'Terre de Sienne', category: 'vetement', tab: 'rug', swatch: '#9C5536',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in warm terracotta sienna brown color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_lavender', label: 'Lavande', category: 'vetement', tab: 'rug', swatch: '#A89CC8',
        prompt: 'Place the garment directly on an endless fluffy faux fur surface in soft lavender purple color, ultra soft plush texture with long visible fibers in soft wavy clusters. The fur surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },
      { id: 'rug_jute', label: 'Jute Tissé', category: 'vetement', tab: 'rug', swatch: '#B8A179',
        prompt: 'Place the garment directly on an endless natural jute woven surface in warm beige-tan color, tightly woven flat texture with subtle visible weave pattern. The jute surface is the ONLY thing visible besides the garment — it covers 100% of every pixel, extending infinitely. No floor, no wall, no rug boundary anywhere. Top-down flat-lay view. Natural soft daylight.' },

      // ===== VÊTEMENT · MANNEQUIN ===== (prompts PROVISOIRES)
      { id: 'mannequin_invisible', label: 'Mannequin invisible', category: 'vetement', tab: 'mannequin', swatch: '#FFFFFF',
        prompt: 'Present the garment worn on an invisible / ghost mannequin so it keeps a natural 3D body shape with no visible mannequin, person, or support. Clean seamless pure white studio background. Front view, full garment visible.' },
      { id: 'mannequin_buste', label: 'Buste neutre', category: 'vetement', tab: 'mannequin', swatch: '#D8CFc4',
        prompt: 'Present the garment on a neutral matte light-gray dressmaker bust mannequin, front view, full garment visible, clean seamless studio background.' },
      { id: 'mannequin_complet', label: 'Mannequin complet', category: 'vetement', tab: 'mannequin', swatch: '#BFb5a8',
        prompt: 'Present the garment on a full neutral matte mannequin, front view, full garment visible from top to bottom, clean seamless light studio background.' },

      // ===== ÉLECTRONIQUE · BUREAU ===== (prompts PROVISOIRES)
      { id: 'desk_plant', label: 'Végétal', category: 'electronique', tab: 'bureau', swatch: '#1F3D2A',
        forceSupport: 'The product is placed on a small smooth surface or low pedestal in front of the foliage, shown from a flattering eye-level three-quarter angle (NOT a flat top-down view, NOT lying down), upright and stable, with a subtle soft reflection on the surface just below it.',
        prompt: 'Place the product in front of a lush dense wall of tropical green foliage — ferns, large monstera leaves and small succulents — that completely fills the entire background and is softly out of focus with creamy bokeh (shallow depth of field). Dark moody deep-green ambiance, a single soft directional light gently illuminating the product so it clearly pops against the darker greenery. Premium collector and reseller product photograph, rich saturated greens, the product perfectly sharp and in crisp focus.' },
      { id: 'desk_decor', label: 'Petit décor', category: 'electronique', tab: 'bureau', swatch: '#C9A57A',
        prompt: 'Place the device on a tidy desk with a few minimal decorative objects softly blurred in the background, warm cozy lifestyle ambiance, the device sharp and in focus.' },
      { id: 'desk_shelf', label: 'Étagère', category: 'electronique', tab: 'bureau', swatch: '#8A6B4F', locked: true,
        prompt: 'Place the device on a wooden shelf with a softly blurred shelving background, modern interior lifestyle ambiance, the device sharp and in focus.' },

      // ===== ÉLECTRONIQUE · FOND UNIQUE ===== (prompts PROVISOIRES)
      { id: 'studio_white',  label: 'Blanc pur',    category: 'electronique', tab: 'unique', swatch: '#FFFFFF',
        prompt: 'pure white seamless studio background, completely flat color, no texture, the device centered and sharp with a soft natural shadow.' },
      { id: 'studio_black',  label: 'Noir profond', category: 'electronique', tab: 'unique', swatch: '#0A0A0A',
        prompt: 'deep matte black seamless studio background, completely flat color, the device centered and sharp with subtle reflection.' },
      { id: 'studio_beige',  label: 'Beige sable',  category: 'electronique', tab: 'unique', swatch: '#E8D9C0',
        prompt: 'warm sand beige seamless studio background, completely flat color, the device centered and sharp with a soft shadow.' },
      { id: 'studio_orange', label: 'Orange',       category: 'electronique', tab: 'unique', swatch: '#E08A3C',
        prompt: 'vibrant warm orange seamless studio background, completely flat color, the device centered and sharp with a soft shadow.' },
      { id: 'studio_gradient', label: 'Dégradé doux', category: 'electronique', tab: 'unique', swatch: 'linear-gradient(135deg, #ffd5b0, #ff9d7d)',
        prompt: 'subtle warm gradient studio background, soft glow ambiance, the device centered and sharp with a soft shadow.' },
    ],
  },

  // ---------------------------------------------------------------------------
  // SUPPORT — présentation (inchangé)
  // ---------------------------------------------------------------------------
  support: {
    label: 'Présentation',
    defaultId: 'flat_lay',
    choices: [
      { id: 'flat_lay',   label: 'À plat (vue du dessus)',
        prompt: 'Product laid completely flat on the surface, viewed from directly above (top-down flat-lay view), arranged neatly and symmetrically.' },
      { id: 'flat_angle', label: 'À plat (léger angle)',
        prompt: 'Product laid flat on the surface, viewed from above at a slight 15° angle for subtle perspective.' },
      { id: 'hanging',    label: 'Suspendu',
        prompt: 'Product presented vertically as if floating or hanging, fully visible from the front, no support visible.' },
      { id: 'floating',   label: 'Flottant',
        prompt: 'Product floating mid-air, levitating slightly, no visible support, with a subtle natural drop shadow below.' },
    ],
  },

  // ---------------------------------------------------------------------------
  // ÉCLAIRAGE (inchangé)
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
// Helpers (resolvers avec fallback systématique sur le défaut)
// =============================================================================

function getCategory(id) {
  return (
    OPTIONS.category.choices.find((c) => c.id === id) ||
    OPTIONS.category.choices.find((c) => c.id === OPTIONS.category.defaultId)
  );
}

function getProductType(categoryId, id) {
  const list = OPTIONS.productType.choicesByCategory[categoryId] || [];
  return (
    list.find((c) => c.id === id) ||
    list.find((c) => c.id === OPTIONS.productType.defaultByCategory[categoryId]) ||
    list[0]
  );
}

function getBackground(categoryId, id) {
  const list = OPTIONS.background.choices.filter((c) => c.category === categoryId);
  const def = OPTIONS.background.byCategory[categoryId]?.defaultId;
  return (
    list.find((c) => c.id === id && !c.locked) ||
    list.find((c) => c.id === def) ||
    list.find((c) => !c.locked) ||
    list[0]
  );
}

function resolve(category, id) {
  const cat = OPTIONS[category];
  if (!cat) return null;
  return (
    cat.choices.find((c) => c.id === id) ||
    cat.choices.find((c) => c.id === cat.defaultId)
  );
}

// =============================================================================
// buildPrompt — construit le prompt final côté serveur
// (prompts PROVISOIRES pour l'électronique / mannequin / bureau — à affiner)
// =============================================================================
export function buildPrompt(selections = {}) {
  const category = getCategory(selections.category);
  const product  = getProductType(category.id, selections.productType);
  const bg       = getBackground(category.id, selections.background);
  const support  = resolve('support',  selections.support);
  const lighting = resolve('lighting', selections.lighting);

  // Présentation finale :
  //  - Tapis (vêtement) → flat-lay forcé pour la cohérence visuelle
  //  - Fond avec mise en scène imposée (ex. Végétal = debout sur présentoir) → on l'applique
  //  - Sinon → choix de l'utilisateur (ou défaut)
  const isRug = bg.tab === 'rug';
  const finalSupport = isRug
    ? OPTIONS.support.choices.find((s) => s.id === 'flat_lay')
    : bg.forceSupport
      ? { prompt: bg.forceSupport }
      : support;

  // Règles de préservation selon la catégorie
  const preservation = category.id === 'vetement'
    ? [
        'ABSOLUTE PRESERVATION RULES — DO NOT VIOLATE:',
        'The garment fabric, knit pattern, weave, threads, and material composition MUST remain 100% IDENTICAL to the source photo. DO NOT alter the material in any way.',
        'ALL embroideries, prints, logos, labels, motifs, patterns, decorations, brand tags, and stitching MUST be reproduced EXACTLY — same colors, positions, shapes, sizes, count.',
        'The garment colors MUST be reproduced with PERFECT accuracy. NO color shift, NO saturation change, NO white balance change.',
        'The proportions, silhouette, draping, folding, and natural creases MUST remain UNCHANGED from the source.',
        'DO NOT add or remove buttons, zippers, seams, pockets, drawstrings, or any structural element.',
        'PERMITTED ONLY: remove dust/lint/hair/stains, smooth tiny micro-wrinkles, replace the background environment, adjust lighting, add a soft natural drop shadow.',
      ]
    : [
        'ABSOLUTE PRESERVATION RULES — DO NOT VIOLATE:',
        'The device shape, model, proportions, materials, colors, finish, screen content, ports, buttons and every physical detail MUST remain 100% IDENTICAL to the source photo.',
        'ALL logos, labels, text, brand markings, scratches and wear MUST be reproduced EXACTLY — same colors, positions, shapes, sizes.',
        'DO NOT add, remove, or restyle any part of the device.',
        'PERMITTED ONLY: remove dust/fingerprints, replace the background environment, adjust lighting, add a soft natural reflection or drop shadow.',
      ];

  return [
    // 1. Contexte global
    'Transform this photo into a professional product listing photograph for online resale (Vinted, eBay, Leboncoin marketplace style).',
    // 2. Préservation
    ...preservation,
    // 3. Produit
    `Product framing: ${product.prompt}`,
    // 4. Scène
    `Background scene: ${bg.prompt}.`,
    `Presentation: ${finalSupport.prompt}`,
    `Lighting: ${lighting.prompt}`,
    // 5. Style final
    'Sharp focus on the product, high resolution, no measuring tape, no rulers, no extra props, clean marketplace listing photography aesthetic.',
  ].join(' ');
}

export function describeSelections(selections = {}) {
  const category = getCategory(selections.category);
  const product  = getProductType(category.id, selections.productType);
  const bg       = getBackground(category.id, selections.background);
  const support  = resolve('support',  selections.support);
  const lighting = resolve('lighting', selections.lighting);
  return `${category.label} · ${product.label} · ${bg.label} · ${support.label} · ${lighting.label}`;
}
