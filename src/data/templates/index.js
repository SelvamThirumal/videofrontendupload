/**
 * AVINZ Studio: 1000 Free Video Templates Engine
 * 10 Categories × 100 Fully Formed, Editable Templates = 1,000 Total Presets
 */

export const TEMPLATE_CATEGORIES = [
  { id: 'reels', name: 'Instagram Reels', count: 100, defaultAspect: '9:16' },
  { id: 'shorts', name: 'YouTube Shorts', count: 100, defaultAspect: '9:16' },
  { id: 'cinematic', name: 'Cinematic & Film', count: 100, defaultAspect: '16:9' },
  { id: 'birthday', name: 'Birthday & Party', count: 100, defaultAspect: '9:16' },
  { id: 'wedding', name: 'Wedding & Romance', count: 100, defaultAspect: '16:9' },
  { id: 'travel', name: 'Travel & Adventure', count: 100, defaultAspect: '9:16' },
  { id: 'love_status', name: 'Love & Status', count: 100, defaultAspect: '9:16' },
  { id: 'business_ads', name: 'Business & Ads', count: 100, defaultAspect: '16:9' },
  { id: 'devotional', name: 'Devotional & Spiritual', count: 100, defaultAspect: '16:9' },
  { id: 'gaming_trending', name: 'Gaming & Trending', count: 100, defaultAspect: '16:9' }
];

const CATEGORY_NAMES = {
  reels: 'Instagram Reels',
  shorts: 'YouTube Shorts',
  cinematic: 'Cinematic & Film',
  birthday: 'Birthday & Party',
  wedding: 'Wedding & Romance',
  travel: 'Travel & Adventure',
  love_status: 'Love & Status',
  business_ads: 'Business & Ads',
  devotional: 'Devotional & Spiritual',
  gaming_trending: 'Gaming & Trending'
};

const THEMES = {
  reels: ['Beat Sync Glow', 'Neon Cyber Cut', 'Minimalist Vlog', 'Flash Velocity', 'Aesthetic Street', 'Smooth Blur Zoom', 'Vogue Magazine', 'Glitch Impact', 'Warm Golden Hour', 'Retro Film Roll'],
  shorts: ['Fact Countdown', 'Hook Explainer', 'Before vs After', 'Quick Tutorial', 'Top 5 Listicle', 'Daily Life Hack', 'Motivation Punch', 'Visual Story', 'Trending News', 'Myth Buster'],
  cinematic: ['Anamorphic 4K', 'Teal & Orange Epic', 'Nordic Moody Film', 'Sunset Letterbox', 'Vintage 35mm', 'Monochrome Noir', 'Atmospheric Drone', 'Slow Shutter Drift', 'Neo-Tokyo Midnight', 'Documentary Arc'],
  birthday: ['Confetti Splash', 'Sparkle Magic Year', 'Candle Light Joy', 'Photo Scrapbook', 'Golden Balloon Blast', 'Retro Polaroid Party', 'Kids Cartoon Fun', 'Elegant Milestone', 'Sweet Memories', 'Fireworks Cheer'],
  wedding: ['Royal Heritage', 'Soft Rose Bokeh', 'Fairytale Vows', 'White Silk Serenade', 'Golden Rings Spark', 'Vintage Warmth', 'Floral Grace', 'Eternal Love Story', 'Reception Party Glow', 'Sunset Romance'],
  travel: ['Wanderlust Horizon', 'Mountain Peak Drive', 'Tropical Island Drift', 'Urban Explorer', 'Campfire Acoustic', 'High-Speed Hyperlapse', 'Passport Stamp Flow', 'Roadtrip Memories', 'Desert Safari Glow', 'Ocean Wave Beat'],
  love_status: ['Rainy Window Love', 'Lyrical Heartbeat', 'Late Night Aesthetic', 'Acoustic Melody Glow', 'Soulmate Connection', 'Poetic Sunset', 'Retro Cassette Vibes', 'Sweet Moments', 'Neon Love Echo', 'Pure Emotion'],
  business_ads: ['SaaS Product Showcase', 'Modern Real Estate Tour', 'Gym & Fitness Promo', 'Flash Sale Discount', 'Corporate Explainer', 'E-commerce Unbox', 'App Launch Demo', 'Restaurant Menu Showcase', 'Consulting Brand Hook', 'Podcast Teaser'],
  devotional: ['Golden Temple Grace', 'Sunrise Peace Meditation', 'Chant & Serenity', 'Sacred Flame Light', 'Blessings Divine', 'Bhakti Melody Wave', 'Spiritual Awakening', 'Mandir Bell Echo', 'Holy Lotus Flower', 'Morning Prayer Serene'],
  gaming_trending: ['RGB Esports Montage', 'Sniper Kill Cam Shake', 'Cyberpunk Glitch HUD', 'Pixel Retro Arcade', 'Level Up Impact', 'Speedrun Fast Forward', 'Victory Royale Glow', 'Gamer Stream Intro', 'Hardcore Bass Drop', 'Neon Matrix Runner']
};

const MUSIC_PRESETS = [
  'Upbeat Electronic Stems (128 BPM)',
  'Lofi Chillhop Beats (85 BPM)',
  'Epic Orchestral Strings (110 BPM)',
  'Warm Acoustic Guitar Strums (95 BPM)',
  'Modern Trap 808 Impact (140 BPM)',
  'Ambient Peace Meditation Drone',
  'Energetic Pop Beat (120 BPM)',
  'Retro Synthwave 80s (115 BPM)'
];

const TRANSITIONS_POOL = ['Cross Dissolve', 'Fade to Black', 'Slide Right', 'Zoom Out', 'Glitch Push', 'Wipe Down'];
const EFFECTS_POOL = ['vignette', 'glow', 'film_grain', 'cinematic', 'black_and_white', 'sepia', 'blur'];

/**
 * Builds 1,000 real, functional, structured editable template objects.
 */
function generateTemplates() {
  const result = [];
  let globalIndex = 1;

  TEMPLATE_CATEGORIES.forEach((cat) => {
    const themeList = THEMES[cat.id] || ['Modern Cut'];
    const aspect = cat.defaultAspect;

    for (let i = 1; i <= 100; i++) {
      const theme = themeList[(i - 1) % themeList.length];
      const templateNumber = i.toString().padStart(3, '0');
      const id = `tpl_${cat.id}_${templateNumber}`;
      const title = `${theme} #${i}`;
      const duration = 10 + ((i * 3) % 25); // 10s to 35s
      const clipsCount = 2 + (i % 5); // 2 to 6 placeholder video clips
      const music = MUSIC_PRESETS[(i + globalIndex) % MUSIC_PRESETS.length];
      const effect = EFFECTS_POOL[(i + globalIndex) % EFFECTS_POOL.length];
      const transition = TRANSITIONS_POOL[(i + globalIndex) % TRANSITIONS_POOL.length];

      // Formulate timeline layers
      const videoClips = [];
      const clipDuration = Math.round((duration / clipsCount) * 10) / 10;
      for (let c = 0; c < clipsCount; c++) {
        videoClips.push({
          id: `clip_${c + 1}`,
          title: `Scene ${c + 1} Placeholder`,
          startTime: Math.round(c * clipDuration * 10) / 10,
          duration: clipDuration,
          speed: 1.0,
          scale: 1.0,
          opacity: 1.0,
          placeholderText: `Drop Video/Image for Scene ${c + 1}`
        });
      }

      const textOverlays = [
        {
          id: 'text_headline',
          text: `${theme.toUpperCase()}`,
          startTime: 0.5,
          duration: Math.min(6, duration),
          fontSize: aspect === '9:16' ? 42 : 36,
          fontColor: '#FFFFFF',
          animation: 'pop'
        },
        {
          id: 'text_sub',
          text: `Template #${templateNumber} • Edit In AVINZ`,
          startTime: 1.0,
          duration: Math.min(5, duration - 1),
          fontSize: 22,
          fontColor: '#F472B6',
          animation: 'fade'
        }
      ];

      result.push({
        id,
        index: globalIndex++,
        title,
        category: cat.id,
        categoryName: CATEGORY_NAMES[cat.id],
        aspectRatio: aspect,
        duration,
        musicTrack: music,
        primaryEffect: effect,
        transitionStyle: transition,
        clipsCount,
        layers: {
          videoClips,
          textOverlays,
          audioTrack: {
            name: music,
            volume: 0.85,
            fadeIn: 0.5,
            fadeOut: 1.0
          },
          effects: [effect]
        }
      });
    }
  });

  return result;
}

export const ALL_TEMPLATES = generateTemplates();

/**
 * Fast search and filter helper for templates
 */
export function queryTemplates({ category = 'all', search = '', page = 1, pageSize = 24 }) {
  let filtered = ALL_TEMPLATES;

  if (category && category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }

  if (search && search.trim().length > 0) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      t => t.title.toLowerCase().includes(q) ||
           t.categoryName.toLowerCase().includes(q) ||
           t.musicTrack.toLowerCase().includes(q) ||
           t.id.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const items = filtered.slice(offset, offset + pageSize);

  return {
    items,
    total,
    page,
    totalPages
  };
}
