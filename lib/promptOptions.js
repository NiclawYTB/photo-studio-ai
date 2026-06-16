// =============================================================================
// PROMPT OPTIONS — Photo Studio (multi-catégories)
//
// - Le client envoie uniquement des IDs ; le serveur valide et construit le
//   prompt via buildPrompt(). Tout ID inconnu → fallback sur le défaut.
//
// Principes des prompts :
//  1. PRÉSERVATION stricte du produit (matière, couleurs, logos, formes).
//  2. Les "productType" décrivent CE QU'IL FAUT MONTRER (sans imposer l'angle).
//  3. L'ANGLE/présentation vient de "support" ou du forceSupport d'un fond
//     (ex. Tapis = à plat, Mannequin = porté debout, Végétal = trois-quarts),
//     pour éviter toute contradiction dans le prompt final.
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
  // NIVEAU 2 — TYPE DE PRODUIT (orientation-neutre)
  // ---------------------------------------------------------------------------
  productType: {
    label: 'Type de produit',
    defaultByCategory: { vetement: 'tshirt', electronique: 'console' },
    choicesByCategory: {

      // ===== VÊTEMENT =====
      vetement: [
        { id: 'tshirt',   label: 'T-shirt', icon: '👕',
          prompt: 'a t-shirt, with the full front, both sleeves and the collar visible, and the entire print or design shown clearly and undistorted.' },
        { id: 'pull',     label: 'Pull / Sweat', icon: '🧶',
          prompt: 'a knitted sweater or sweatshirt, with the full front, both sleeves and the collar visible, and the knit texture and pattern clearly readable.' },
        { id: 'hoodie',   label: 'Hoodie', icon: '🧥',
          prompt: 'a hoodie, with the hood, the full front, the kangaroo pocket, both sleeves and the drawstrings clearly visible.' },
        { id: 'chemise',  label: 'Chemise', icon: '👔',
          prompt: 'a shirt, buttoned, with the collar, both sleeves, the button placket and the fabric weave clearly visible.' },
        { id: 'veste',    label: 'Veste / Manteau', icon: '🧥',
          prompt: 'a jacket or coat, with the collar, the full front (closed as in the source), both sleeves and any zippers or hardware visible.' },
        { id: 'pantalon', label: 'Pantalon / Jean', icon: '👖',
          prompt: 'a pair of trousers or jeans, shown full length, with the waistband, pockets and seams clearly visible.' },
        { id: 'jogging',  label: 'Jogging', icon: '🩳',
          prompt: 'jogging bottoms, shown full length, with the elastic waistband, drawstrings and fabric clearly visible.' },
        { id: 'short',    label: 'Short', icon: '🩳',
          prompt: 'a pair of shorts, with the full front, the waistband and any details clearly visible.' },
        { id: 'robe',     label: 'Robe', icon: '👗',
          prompt: 'a dress, with the full silhouette from neckline to hem visible and the fabric and any pattern clearly shown.' },
        { id: 'jupe',     label: 'Jupe', icon: '👗',
          prompt: 'a skirt, with the full shape, the waistband and the fabric or pattern clearly visible.' },
        { id: 'chaussures', label: 'Chaussures', icon: '👟',
          prompt: 'a pair of shoes shown together side by side, with the laces, logos and material details clearly visible.' },
        { id: 'sac',      label: 'Sac / Accessoire', icon: '👜',
          prompt: 'a bag or accessory, shown in full with every strap, buckle and piece of hardware clearly visible.' },
      ],

      // ===== ÉLECTRONIQUE =====
      electronique: [
        { id: 'smartphone', label: 'Smartphone', icon: '📱',
          prompt: 'a smartphone, shown in full with a clean screen and all edges, cameras and buttons clearly visible.' },
        { id: 'tablette',   label: 'Tablette', icon: '📲',
          prompt: 'a tablet, shown in full with a clean screen and all edges and buttons clearly visible.' },
        { id: 'console',    label: 'Console', icon: '🎮',
          prompt: 'a game console, shown in full with its ports, buttons, logos and surface details clearly visible.' },
        { id: 'manette',    label: 'Manette', icon: '🕹️',
          prompt: 'a game controller, shown in full with all buttons, sticks, triggers and details clearly visible.' },
        { id: 'jeu',        label: 'Jeu vidéo', icon: '💿',
          prompt: 'a video game box, with the front cover artwork and title fully visible, sharp and readable.' },
        { id: 'casque',     label: 'Casque / Écouteurs', icon: '🎧',
          prompt: 'headphones or earphones, shown in full with the finish, cushions and details clearly visible.' },
        { id: 'pc',         label: 'PC portable', icon: '💻',
          prompt: 'a laptop shown open, with the screen and keyboard visible and the whole device in frame.' },
        { id: 'montre',     label: 'Montre connectée', icon: '⌚',
          prompt: 'a smartwatch, shown in full with the screen, case and strap clearly visible.' },
        { id: 'photo',      label: 'Appareil photo', icon: '📷',
          prompt: 'a camera, shown in full with the lens, body and controls clearly visible.' },
        { id: 'accessoire', label: 'Accessoire tech', icon: '🔌',
          prompt: 'the tech accessory, shown in full with all cables, connectors and details clearly visible.' },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // NIVEAU 3 — FOND (dépend de la catégorie + onglet)
  // ---------------------------------------------------------------------------
  background: {
    label: 'Fond',
    byCategory: {
      vetement: {
        defaultId: 'rug_white_snow',
        tabs: [ { id: 'rug', label: 'Tapis' }, { id: 'mannequin', label: 'Mannequin' } ],
      },
      electronique: {
        defaultId: 'desk_plant',
        tabs: [ { id: 'bureau', label: 'Bureau' }, { id: 'unique', label: 'Fond unique' } ],
      },
    },
    choices: [

      // ===== VÊTEMENT · TAPIS (fourrure infinie) =====
      { id: 'rug_white_snow', label: 'Blanc Neige', category: 'vetement', tab: 'rug', swatch: '#F5F0E6',
        prompt: 'lay the garment on an endless, fluffy ivory-cream faux-fur surface with long soft plush fibres; this fur fills 100% of the frame in every direction, with no floor, wall, edge or rug border visible anywhere' },
      { id: 'rug_beige_cream', label: 'Beige Crème', category: 'vetement', tab: 'rug', swatch: '#E5D5BC',
        prompt: 'lay the garment on an endless, fluffy warm cream-beige faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_anthracite', label: 'Anthracite', category: 'vetement', tab: 'rug', swatch: '#3A3A3A',
        prompt: 'lay the garment on an endless, fluffy dark anthracite-grey faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_teal', label: 'Bleu Canard', category: 'vetement', tab: 'rug', swatch: '#1F5F6B',
        prompt: 'lay the garment on an endless, fluffy rich teal-blue faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_dusty_rose', label: 'Vieux Rose', category: 'vetement', tab: 'rug', swatch: '#C9959A',
        prompt: 'lay the garment on an endless, fluffy dusty rose-pink faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_royal_blue', label: 'Bleu Roi', category: 'vetement', tab: 'rug', swatch: '#1F3C8C',
        prompt: 'lay the garment on an endless, fluffy vibrant royal-blue faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_mustard', label: 'Jaune Moutarde', category: 'vetement', tab: 'rug', swatch: '#C99A2E',
        prompt: 'lay the garment on an endless, fluffy warm mustard-yellow faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_emerald', label: 'Vert Émeraude', category: 'vetement', tab: 'rug', swatch: '#2A6A4E',
        prompt: 'lay the garment on an endless, fluffy deep emerald-green faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_sienna', label: 'Terre de Sienne', category: 'vetement', tab: 'rug', swatch: '#9C5536',
        prompt: 'lay the garment on an endless, fluffy warm terracotta-sienna faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_lavender', label: 'Lavande', category: 'vetement', tab: 'rug', swatch: '#A89CC8',
        prompt: 'lay the garment on an endless, fluffy soft lavender-purple faux-fur surface with long soft plush fibres filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },
      { id: 'rug_jute', label: 'Jute Tissé', category: 'vetement', tab: 'rug', swatch: '#B8A179',
        prompt: 'lay the garment on an endless natural woven jute surface in warm beige-tan, a tight flat weave filling 100% of the frame in every direction, with no floor, wall, edge or border visible' },

      // ===== VÊTEMENT · MANNEQUIN =====
      { id: 'mannequin_invisible', label: 'Mannequin invisible', category: 'vetement', tab: 'mannequin', swatch: '#FFFFFF',
        forceSupport: 'The garment is presented WORN on an invisible (ghost) mannequin: filled out in a natural 3D body shape, standing upright and vertical, photographed straight from the FRONT at eye level. NOT laid flat, NOT a top-down view, no visible mannequin or support.',
        prompt: 'set against a clean, seamless pure-white studio background; the garment keeps a natural worn 3D body shape with no visible mannequin or person' },
      { id: 'mannequin_buste', label: 'Buste neutre', category: 'vetement', tab: 'mannequin', swatch: '#D8CFC4',
        forceSupport: 'The garment is presented WORN on a neutral dressmaker bust mannequin, standing upright and vertical, photographed straight from the FRONT at eye level. NOT laid flat, NOT a top-down view.',
        prompt: 'displayed on a neutral matte light-grey dressmaker bust mannequin against a clean, seamless studio background' },
      { id: 'mannequin_complet', label: 'Mannequin complet', category: 'vetement', tab: 'mannequin', swatch: '#BFB5A8',
        forceSupport: 'The garment is presented WORN on a full neutral mannequin, standing upright and vertical, photographed straight from the FRONT. NOT laid flat, NOT a top-down view.',
        prompt: 'displayed on a full neutral matte mannequin against a clean, seamless light studio background' },

      // ===== ÉLECTRONIQUE · BUREAU =====
      { id: 'desk_plant', label: 'Végétal', category: 'electronique', tab: 'bureau', swatch: '#1F3D2A',
        forceSupport: 'The product is placed on a small smooth surface or low pedestal in front of the foliage, shown from a flattering eye-level three-quarter angle (NOT a flat top-down view, NOT lying down), upright and stable, with a subtle soft reflection on the surface just below it.',
        prompt: 'set in front of a lush, dense wall of tropical green foliage (ferns, large monstera leaves and small succulents) that fills the entire background and is softly out of focus with creamy bokeh; dark, moody, deep-green ambiance with rich saturated greens' },
      { id: 'desk_decor', label: 'Petit décor', category: 'electronique', tab: 'bureau', swatch: '#C9A57A',
        forceSupport: 'The product is placed on a tidy desk surface, shown from a flattering eye-level three-quarter angle (NOT a flat top-down view), upright and stable, with a subtle soft reflection or shadow below it.',
        prompt: 'set on a tidy modern desk with a few minimal, tasteful decorative objects softly blurred in the background; warm, cosy, lifestyle ambiance' },
      { id: 'desk_shelf', label: 'Étagère', category: 'electronique', tab: 'bureau', swatch: '#8A6B4F', locked: true,
        prompt: 'set on a wooden shelf with a softly blurred shelving background, modern interior lifestyle ambiance' },

      // ===== ÉLECTRONIQUE · FOND UNIQUE =====
      { id: 'studio_white',  label: 'Blanc pur',    category: 'electronique', tab: 'unique', swatch: '#FFFFFF',
        prompt: 'set on a pure-white seamless studio backdrop, perfectly even and flat, with a soft natural drop shadow under the product' },
      { id: 'studio_black',  label: 'Noir profond', category: 'electronique', tab: 'unique', swatch: '#0A0A0A',
        prompt: 'set on a deep matte-black seamless studio backdrop, perfectly even, with a subtle reflection under the product for a premium look' },
      { id: 'studio_beige',  label: 'Beige sable',  category: 'electronique', tab: 'unique', swatch: '#E8D9C0',
        prompt: 'set on a warm sand-beige seamless studio backdrop, perfectly even and flat, with a soft natural drop shadow under the product' },
      { id: 'studio_orange', label: 'Orange',       category: 'electronique', tab: 'unique', swatch: '#E08A3C',
        prompt: 'set on a vibrant warm-orange seamless studio backdrop, perfectly even and flat, with a soft natural drop shadow under the product' },
      { id: 'studio_gradient', label: 'Dégradé doux', category: 'electronique', tab: 'unique', swatch: 'linear-gradient(135deg, #ffd5b0, #ff9d7d)',
        prompt: 'set on a soft warm peach-to-orange gradient studio backdrop with a gentle glow, and a soft natural shadow under the product' },
    ],
  },

  // ---------------------------------------------------------------------------
  // PRÉSENTATION (angle) — dépend de la catégorie
  // ---------------------------------------------------------------------------
  support: {
    label: 'Présentation',
    defaultByCategory: { vetement: 'flat_lay', electronique: 'front' },
    choicesByCategory: {
      vetement: [
        { id: 'flat_lay',   label: 'À plat (vue du dessus)',
          prompt: 'lay the item completely flat and shoot it straight from directly above (top-down flat-lay), arranged neatly and symmetrically.' },
        { id: 'flat_angle', label: 'À plat (léger angle)',
          prompt: 'lay the item flat and shoot it from above at a slight 15° angle for subtle perspective.' },
        { id: 'hanging',    label: 'Suspendu',
          prompt: 'show the item hanging vertically and facing the camera, as if on an invisible hanger, with no visible support.' },
        { id: 'floating',   label: 'Flottant',
          prompt: 'show the item floating gently in mid-air, facing the camera, with a soft natural drop shadow and no visible support.' },
      ],
      electronique: [
        { id: 'front', label: 'De face',
          prompt: 'shoot the product straight from the front, face-on at eye level, centered and upright.' },
        { id: 'top',   label: 'De dessus',
          prompt: 'shoot the product from directly above (top-down bird\'s-eye view), centered and flat.' },
        { id: 'three_quarter', label: 'Trois-quarts',
          prompt: 'shoot the product at a flattering three-quarter angle, slightly above eye level, showing the front and one side for natural depth.' },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // ÉCLAIRAGE
  // ---------------------------------------------------------------------------
  lighting: {
    label: 'Éclairage',
    defaultId: 'soft_daylight',
    choices: [
      { id: 'soft_daylight', label: 'Lumière douce',
        prompt: 'soft, even natural daylight, gently diffused with minimal shadows, for a bright and clean look.' },
      { id: 'studio_clean',  label: 'Studio pro',
        prompt: 'professional even studio lighting, no harsh shadows, crisp commercial-photography quality.' },
      { id: 'dramatic',      label: 'Contrasté',
        prompt: 'directional side lighting with defined natural shadows and moderate contrast for depth.' },
      { id: 'golden',        label: 'Chaud',
        prompt: 'warm golden-hour lighting with soft warm tones and gentle long shadows.' },
    ],
  },
};

// =============================================================================
// Helpers (fallback systématique sur le défaut, on ignore les fonds verrouillés)
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

function getSupport(categoryId, id) {
  const list = OPTIONS.support.choicesByCategory[categoryId] || [];
  return (
    list.find((c) => c.id === id) ||
    list.find((c) => c.id === OPTIONS.support.defaultByCategory[categoryId]) ||
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
// buildPrompt — assemble le prompt final côté serveur
// =============================================================================
export function buildPrompt(selections = {}) {
  const category = getCategory(selections.category);
  const product  = getProductType(category.id, selections.productType);
  const bg       = getBackground(category.id, selections.background);
  const support  = getSupport(category.id, selections.support);
  const lighting = resolve('lighting', selections.lighting);

  // Présentation finale :
  //  - Tapis (vêtement) → flat-lay forcé
  //  - Fond avec mise en scène imposée (mannequin debout, Végétal trois-quarts…)
  //  - Sinon → choix de l'utilisateur (ou défaut)
  const isRug = bg.tab === 'rug';
  const finalSupport = isRug
    ? OPTIONS.support.choicesByCategory.vetement.find((s) => s.id === 'flat_lay')
    : bg.forceSupport
      ? { prompt: bg.forceSupport }
      : support;

  const preservation = category.id === 'vetement'
    ? 'CRITICAL — keep the garment itself 100% identical to the source photo: exact same colours, fabric, knit and texture, prints, embroidery, patterns, logos, labels and stitching, with the same proportions and shape. Do NOT recolour, restyle or redesign any part of it. You may ONLY replace the background and setting, adjust the lighting, remove dust, lint, hair and minor creases, and add a soft natural shadow.'
    : 'CRITICAL — keep the device itself 100% identical to the source photo: exact same model, shape, proportions, colours, materials, finish, buttons, ports, screen content, logos, text and any wear or scratches. Do NOT restyle or alter the product. You may ONLY replace the background and setting, adjust the lighting, remove dust, fingerprints and glare, and add a soft natural reflection or shadow.';

  return [
    'Turn this photo into a professional, photorealistic product listing image for online resale (Vinted, Leboncoin, eBay style).',
    preservation,
    `Subject: ${product.prompt}`,
    `Scene: ${bg.prompt}.`,
    `Composition: ${finalSupport.prompt}`,
    `Lighting: ${lighting.prompt}`,
    'Final image: ultra-sharp focus on the product, high resolution, realistic, no added text, no watermark, no measuring tape, no hands, clean marketplace aesthetic.',
  ].join(' ');
}

export function describeSelections(selections = {}) {
  const category = getCategory(selections.category);
  const product  = getProductType(category.id, selections.productType);
  const bg       = getBackground(category.id, selections.background);
  const support  = getSupport(category.id, selections.support);
  const lighting = resolve('lighting', selections.lighting);
  return `${category.label} · ${product.label} · ${bg.label} · ${support.label} · ${lighting.label}`;
}
