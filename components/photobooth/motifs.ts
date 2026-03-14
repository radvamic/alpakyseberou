export type MotifCategory = 'style' | 'scene' | 'background';

export interface Motif {
  id: string;
  category: MotifCategory;
  nameCs: string;
  nameEn: string;
  descCs: string;
  descEn: string;
  emoji: string;
  promptSolo: string;
  promptWithCouple: string;
}

export const categories: {
  id: MotifCategory;
  nameCs: string;
  nameEn: string;
  descCs: string;
  descEn: string;
  emoji: string;
}[] = [
  {
    id: 'style',
    nameCs: 'Stylizace',
    nameEn: 'Style Transfer',
    descCs: 'Přeměň svou fotku do jiného uměleckého stylu',
    descEn: 'Transform your photo into a different artistic style',
    emoji: '🎨',
  },
  {
    id: 'scene',
    nameCs: 'Scéna',
    nameEn: 'Scene',
    descCs: 'Vstup do úplně nového světa s alpáky',
    descEn: 'Step into a whole new world with alpacas',
    emoji: '🎬',
  },
  {
    id: 'background',
    nameCs: 'Pozadí',
    nameEn: 'Background',
    descCs: 'Vyměň své pozadí za něco fantastického',
    descEn: 'Swap your background for something fantastic',
    emoji: '🌄',
  },
];

export const motifs: Motif[] = [
  // --- STYLE TRANSFER ---
  {
    id: 'renaissance',
    category: 'style',
    nameCs: 'Renesanční portrét',
    nameEn: 'Renaissance Portrait',
    descCs: 'Královský olejomalba ve stylu Rafaela',
    descEn: 'Royal oil painting in the style of Raphael',
    emoji: '👑',
    promptSolo:
      'Transform the person in this photo into a majestic Renaissance oil painting portrait in the style of Raphael. They should be wearing elaborate royal attire with a golden ornate frame around the painting. Include a cute fluffy alpaca standing regally beside them. Rich warm colors, dramatic lighting, museum-quality masterpiece.',
    promptWithCouple:
      'Transform ALL the people from the provided photos into a majestic Renaissance oil painting group portrait in the style of Raphael. Everyone should be wearing elaborate royal attire with a golden ornate frame around the painting. Include a cute fluffy alpaca standing regally among them. Rich warm colors, dramatic lighting, museum-quality masterpiece.',
  },
  {
    id: 'ghibli',
    category: 'style',
    nameCs: 'Anime / Ghibli',
    nameEn: 'Anime / Ghibli',
    descCs: 'Kouzelný svět Studio Ghibli',
    descEn: 'Magical Studio Ghibli world',
    emoji: '✨',
    promptSolo:
      'Transform the person in this photo into a beautiful Studio Ghibli anime style illustration. Soft watercolor-like colors, whimsical atmosphere, surrounded by magical nature with floating lights. A cute anime-style alpaca companion is by their side. Hayao Miyazaki style, dreamy and enchanting.',
    promptWithCouple:
      'Transform ALL the people from the provided photos into a beautiful Studio Ghibli anime style illustration. Soft watercolor-like colors, whimsical atmosphere, surrounded by magical nature with floating lights. A cute anime-style alpaca companion is with them. Hayao Miyazaki style, dreamy and enchanting.',
  },
  {
    id: 'comic',
    category: 'style',
    nameCs: 'Komiksový hrdina',
    nameEn: 'Comic Hero',
    descCs: 'Staň se superhrdinou v komiksu',
    descEn: 'Become a comic book superhero',
    emoji: '💥',
    promptSolo:
      'Transform the person in this photo into a dynamic comic book superhero illustration. Bold colors, halftone dots, action lines, dramatic pose. They should be wearing a cool superhero costume. An alpaca sidekick in a tiny cape stands heroically beside them. Marvel/DC comic book art style with "POW!" and "BOOM!" text effects.',
    promptWithCouple:
      'Transform ALL the people from the provided photos into a dynamic comic book superhero team illustration. Bold colors, halftone dots, action lines, dramatic poses. Everyone in cool superhero costumes. An alpaca sidekick in a tiny cape stands heroically with them. Marvel/DC comic book art style with "POW!" and "BOOM!" text effects.',
  },
  {
    id: 'pixelart',
    category: 'style',
    nameCs: 'Pixel Art',
    nameEn: 'Pixel Art',
    descCs: 'Retro 16-bit herní styl',
    descEn: 'Retro 16-bit game style',
    emoji: '👾',
    promptSolo:
      'Transform the person in this photo into a charming 16-bit pixel art character, like a classic SNES RPG game. Standing in a colorful pixel art wedding venue scene with a pixel alpaca companion. Retro gaming aesthetic, vibrant colors, nostalgic feel. Include a small HP bar and "Level 99 Wedding Guest" text.',
    promptWithCouple:
      'Transform ALL the people from the provided photos into charming 16-bit pixel art characters, like a classic SNES RPG game. Standing together in a colorful pixel art wedding venue scene with a pixel alpaca companion. Retro gaming aesthetic, vibrant colors, nostalgic feel. Include HP bars and "Wedding Party" text.',
  },
  {
    id: 'popart',
    category: 'style',
    nameCs: 'Pop Art',
    nameEn: 'Pop Art',
    descCs: 'Andy Warhol styl, 4 barevné panely',
    descEn: 'Andy Warhol style, 4 color panels',
    emoji: '🎭',
    promptSolo:
      'Transform the person in this photo into an Andy Warhol-style pop art piece. Create a 2x2 grid of the same portrait in different bold color combinations (pink/yellow, blue/green, orange/purple, red/cyan). Flat graphic style, high contrast, screen print look. Iconic Warhol aesthetic.',
    promptWithCouple:
      'Transform ALL the people from the provided photos into an Andy Warhol-style pop art piece. Create a 2x2 grid of the same group portrait in different bold color combinations (pink/yellow, blue/green, orange/purple, red/cyan). Flat graphic style, high contrast, screen print look. Iconic Warhol aesthetic.',
  },
  {
    id: 'impressionism',
    category: 'style',
    nameCs: 'Impresionismus',
    nameEn: 'Impressionism',
    descCs: 'Obraz ve stylu Moneta a Renoira',
    descEn: 'Painting in the style of Monet and Renoir',
    emoji: '🖌️',
    promptSolo:
      'Transform the person in this photo into a beautiful Impressionist painting in the style of Monet and Renoir. Soft brushstrokes, dappled sunlight, a garden scene with wildflowers. A fluffy alpaca grazes peacefully nearby. Warm golden light, en plein air atmosphere, museum-worthy oil painting.',
    promptWithCouple:
      'Transform ALL the people from the provided photos into a beautiful Impressionist painting in the style of Monet and Renoir. Soft brushstrokes, dappled sunlight, a garden scene with wildflowers. A fluffy alpaca grazes peacefully nearby. Warm golden light, en plein air atmosphere, museum-worthy oil painting.',
  },

  // --- SCENES ---
  {
    id: 'alpaca-friends',
    category: 'scene',
    nameCs: 'Alpačí přátelé',
    nameEn: 'Alpaca Friends',
    descCs: 'Na květinové louce s alpáky',
    descEn: 'On a flower meadow with alpacas',
    emoji: '🦙',
    promptSolo:
      'Place the person from this photo in a magical sunny flower meadow surrounded by a group of adorable fluffy alpacas. The person is laughing and hugging one of the alpacas. Golden hour lighting, rolling green hills in the background, wildflowers everywhere. Photorealistic, joyful atmosphere.',
    promptWithCouple:
      'Place ALL the people from the provided photos together in a magical sunny flower meadow surrounded by a group of adorable fluffy alpacas. They are laughing and hugging the alpacas. Golden hour lighting, rolling green hills in the background, wildflowers everywhere. Photorealistic, joyful atmosphere.',
  },
  {
    id: 'royal-wedding',
    category: 'scene',
    nameCs: 'Královská svatba',
    nameEn: 'Royal Wedding',
    descCs: 'Na trůnu ve zlatém sálu',
    descEn: 'On a throne in a golden hall',
    emoji: '🏰',
    promptSolo:
      'Place the person from this photo on a magnificent golden throne in a grand royal palace ballroom. They are wearing an elegant royal wedding outfit with a crown. Alpacas in tiny butler uniforms serve champagne. Crystal chandeliers, red velvet carpets, gold ornaments everywhere. Majestic and slightly humorous.',
    promptWithCouple:
      'Place ALL the people from the provided photos together on magnificent golden thrones in a grand royal palace ballroom. They are wearing elegant royal wedding outfits with crowns. Alpacas in tiny butler uniforms serve champagne. Crystal chandeliers, red velvet carpets, gold ornaments everywhere. Majestic and slightly humorous.',
  },
  {
    id: 'movie-poster',
    category: 'scene',
    nameCs: 'Filmový plakát',
    nameEn: 'Movie Poster',
    descCs: 'Romantický film "Alpačí lásky"',
    descEn: 'Romantic movie "Alpaca Love"',
    emoji: '🎬',
    promptSolo:
      'Create a Hollywood romantic comedy movie poster featuring the person from this photo as the star. Title: "ALPACA LOVE" in elegant gold lettering at the top. The person is in a dramatic romantic pose with a photogenic alpaca. Cinematic lighting, lens flare, sunset background. Include fake credits at the bottom and a tagline: "Love is fluffy". Professional movie poster design.',
    promptWithCouple:
      'Create a Hollywood romantic comedy movie poster featuring ALL the people from the provided photos as the stars. Title: "ALPACA LOVE" in elegant gold lettering at the top. They are in dramatic romantic poses with photogenic alpacas. Cinematic lighting, lens flare, sunset background. Include fake credits at the bottom and a tagline: "Love is fluffy". Professional movie poster design.',
  },
  {
    id: 'mars-wedding',
    category: 'scene',
    nameCs: 'Svatba na Marsu',
    nameEn: 'Wedding on Mars',
    descCs: 'Sci-fi svatba s alpáky ve skafandrech',
    descEn: 'Sci-fi wedding with alpacas in spacesuits',
    emoji: '🚀',
    promptSolo:
      'Place the person from this photo on the surface of Mars in a sleek futuristic spacesuit with a transparent helmet. They are at a wedding ceremony on Mars with red rocky landscape. Alpacas in cute miniature spacesuits are the wedding guests. Earth visible in the Martian sky. Sci-fi cinematic style, dramatic lighting.',
    promptWithCouple:
      'Place ALL the people from the provided photos on the surface of Mars in sleek futuristic spacesuits with transparent helmets. They are at a wedding ceremony on Mars with red rocky landscape. Alpacas in cute miniature spacesuits are the wedding guests. Earth visible in the Martian sky. Sci-fi cinematic style, dramatic lighting.',
  },
  {
    id: 'fairytale',
    category: 'scene',
    nameCs: 'Pohádková svatba',
    nameEn: 'Fairytale Wedding',
    descCs: 'Fantasy hrad s drakem-alpákou',
    descEn: 'Fantasy castle with a dragon-alpaca',
    emoji: '🐉',
    promptSolo:
      'Place the person from this photo in a magical fairytale wedding scene. An enchanted castle with glowing towers in the background. The person wears a magnificent fantasy wedding outfit. A friendly dragon that looks like a fluffy alpaca with tiny wings breathes heart-shaped fire. Fireflies, magic sparkles, enchanted forest. Fantasy illustration style.',
    promptWithCouple:
      'Place ALL the people from the provided photos in a magical fairytale wedding scene. An enchanted castle with glowing towers in the background. Everyone wears magnificent fantasy wedding outfits. A friendly dragon that looks like a fluffy alpaca with tiny wings breathes heart-shaped fire. Fireflies, magic sparkles, enchanted forest. Fantasy illustration style.',
  },
  {
    id: 'rockstars',
    category: 'scene',
    nameCs: 'Rock Stars',
    nameEn: 'Rock Stars',
    descCs: 'Koncertní plakát',
    descEn: 'Concert poster',
    emoji: '🎸',
    promptSolo:
      'Create a rock concert poster featuring the person from this photo as the lead singer of a band called "THE ALPACAS". They are on stage with a guitar, dramatic stage lighting, pyrotechnics. Alpacas play drums and bass guitar in the background. Bold typography, grunge texture, neon lights. "WORLD WEDDING TOUR 2026" at the bottom.',
    promptWithCouple:
      'Create a rock concert poster featuring ALL the people from the provided photos as members of a band called "THE ALPACAS". They are on stage with instruments, dramatic stage lighting, pyrotechnics. Alpacas play drums in the background. Bold typography, grunge texture, neon lights. "WORLD WEDDING TOUR 2026" at the bottom.',
  },

  // --- BACKGROUNDS ---
  {
    id: 'alpaca-farm',
    category: 'background',
    nameCs: 'Alpačí farma',
    nameEn: 'Alpaca Farm',
    descCs: 'Při západu slunce, alpáky kolem',
    descEn: 'At sunset, surrounded by alpacas',
    emoji: '🌅',
    promptSolo:
      'Keep the person from this photo but replace the background with a beautiful alpaca farm at golden hour sunset. Rolling green pastures, rustic wooden fences, a charming barn in the distance. Several fluffy alpacas grazing peacefully around them. Warm golden light, lens flare, photorealistic.',
    promptWithCouple:
      'Keep ALL the people from the provided photos but replace the background with a beautiful alpaca farm at golden hour sunset. Rolling green pastures, rustic wooden fences, a charming barn in the distance. Several fluffy alpacas grazing peacefully around them. Warm golden light, lens flare, photorealistic.',
  },
  {
    id: 'enchanted-forest',
    category: 'background',
    nameCs: 'Kouzelný les',
    nameEn: 'Enchanted Forest',
    descCs: 'Bioluminiscenční stromy a světlušky',
    descEn: 'Bioluminescent trees and fireflies',
    emoji: '🌳',
    promptSolo:
      'Keep the person from this photo but replace the background with a magical enchanted forest at night. Bioluminescent trees glowing in blues and purples, thousands of fireflies, a sparkling stream, mushrooms glowing softly. An ethereal alpaca made of starlight walks beside them. Mystical, dreamlike atmosphere.',
    promptWithCouple:
      'Keep ALL the people from the provided photos but replace the background with a magical enchanted forest at night. Bioluminescent trees glowing in blues and purples, thousands of fireflies, a sparkling stream, mushrooms glowing softly. An ethereal alpaca made of starlight walks among them. Mystical, dreamlike atmosphere.',
  },
  {
    id: 'underwater',
    category: 'background',
    nameCs: 'Podmořský svět',
    nameEn: 'Underwater World',
    descCs: 'Korálový útes, alpačí mořská panna',
    descEn: 'Coral reef, alpaca mermaid',
    emoji: '🐠',
    promptSolo:
      'Keep the person from this photo but place them in a stunning underwater coral reef scene. Vibrant tropical fish, sea turtles, colorful coral. The person looks natural and happy underwater (like a magical underwater photo). An adorable alpaca-mermaid (alpaca with a fish tail) swims beside them. Crystal clear turquoise water, sunbeams filtering through.',
    promptWithCouple:
      'Keep ALL the people from the provided photos but place them in a stunning underwater coral reef scene. Vibrant tropical fish, sea turtles, colorful coral. Everyone looks natural and happy underwater (like a magical underwater photo). An adorable alpaca-mermaid (alpaca with a fish tail) swims with them. Crystal clear turquoise water, sunbeams filtering through.',
  },
  {
    id: 'space-station',
    category: 'background',
    nameCs: 'Vesmírná stanice',
    nameEn: 'Space Station',
    descCs: 'Pohled na Zemi, alpačí astronaut',
    descEn: 'View of Earth, alpaca astronaut',
    emoji: '🛸',
    promptSolo:
      'Keep the person from this photo but place them floating in a futuristic space station with a giant window showing Earth below. Zero gravity with small objects floating around. An alpaca in a cute tiny spacesuit floats beside them. Sleek sci-fi interior, holographic displays, stars visible. Cinematic lighting.',
    promptWithCouple:
      'Keep ALL the people from the provided photos but place them floating in a futuristic space station with a giant window showing Earth below. Zero gravity with small objects floating around. An alpaca in a cute tiny spacesuit floats among them. Sleek sci-fi interior, holographic displays, stars visible. Cinematic lighting.',
  },
  {
    id: 'hotel-vsetice',
    category: 'background',
    nameCs: 'Hotel Všetice',
    nameEn: 'Hotel Všetice',
    descCs: 'Místo svatby, stylizovaný',
    descEn: 'Wedding venue, stylized',
    emoji: '🏛️',
    promptSolo:
      'Keep the person from this photo but place them in front of a beautiful stylized Czech countryside estate hotel (Hotel Všetice). A charming farm estate with horse pastures, a romantic park with fairy lights, rolling countryside hills. Sunset golden hour. Alpacas and horses with flower crowns roam the grounds. Dreamy, romantic, photorealistic.',
    promptWithCouple:
      'Keep ALL the people from the provided photos but place them in front of a beautiful stylized Czech countryside estate hotel (Hotel Všetice). A charming farm estate with horse pastures, a romantic park with fairy lights, rolling countryside hills. Sunset golden hour. Alpacas and horses with flower crowns roam the grounds. Dreamy, romantic, photorealistic.',
  },
];

export function getMotifsByCategory(category: MotifCategory): Motif[] {
  return motifs.filter((m) => m.category === category);
}

export function getMotifById(id: string): Motif | undefined {
  return motifs.find((m) => m.id === id);
}
