import { GoogleGenerativeAI } from '@google/generative-ai';

// Define Interfaces for Output
export interface IMockDayPlan {
  dayNumber: number;
  activities: string[];
}

export interface IMockBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IMockHotel {
  name: string;
  rating: string;
  tier: 'Budget' | 'Mid Range' | 'Luxury';
}

export interface IMockPackingItem {
  name: string;
  category: 'Clothing' | 'Gear' | 'Documents' | 'Toiletries' | 'Other';
  packed: boolean;
}

export interface ITripGenerationResult {
  days: IMockDayPlan[];
  estimatedBudget: IMockBudget;
  suggestedHotels: IMockHotel[];
  packingList: IMockPackingItem[];
}

// Structured Mock Database for Offline Fallback
interface IDestinationTemplate {
  hotels: IMockHotel[];
  dayActivities: {
    Food: string[];
    Culture: string[];
    Adventure: string[];
    Shopping: string[];
    Relaxation: string[];
  };
  generalActivities: string[];
}

const DESTINATION_TEMPLATES: Record<string, IDestinationTemplate> = {
  tokyo: {
    hotels: [
      { name: 'Hotel Sakura Asakusa', rating: '4.2/5', tier: 'Budget' },
      { name: 'Shinjuku Grand Hyatt', rating: '4.6/5', tier: 'Mid Range' },
      { name: 'The Tokyo Station Hotel', rating: '4.9/5', tier: 'Luxury' }
    ],
    dayActivities: {
      Food: [
        'Savor fresh sushi at Tsukiji Outer Market',
        'Enjoy a ramen tasting tour in Shinjuku Omoide Yokocho',
        'Have a traditional Kaiseki dinner in Ginza',
        'Indulge in street food in Asakusa near Senso-ji',
        'Experience a themed cafe in Akihabara'
      ],
      Culture: [
        'Visit the historic Senso-ji Temple in Asakusa',
        'Stroll through the tranquil Meiji Jingu Shrine',
        'Explore the Tokyo National Museum in Ueno Park',
        'Watch a Kabuki performance at Kabukiza Theatre',
        'Walk through the East Gardens of the Imperial Palace'
      ],
      Adventure: [
        'Go karting through the streets of Akihabara and Shibuya',
        'Climb to the observation deck of Tokyo Skytree',
        'Take a day trip to Mount Takao for hiking',
        'Explore the futuristic teamLab Planets digital art museum',
        'Ride the rollercoasters at Tokyo Dome City'
      ],
      Shopping: [
        'Shop for trendy fashion in Harajuku (Takeshita Street)',
        'Explore luxury boutiques in Ginza',
        'Search for electronics and anime merchandise in Akihabara',
        'Browse design goods and clothes in Shibuya 109',
        'Shop at the mega-mall complex of DiverCity Tokyo Plaza in Odaiba'
      ],
      Relaxation: [
        'Soak in an Onsen (traditional hot spring) at Oedo Onsen Monogatari style baths',
        'Relax under cherry blossoms at Shinjuku Gyoen National Garden',
        'Take a scenic boat cruise along the Sumida River',
        'Enjoy matcha tea at Hama-rikyu Gardens',
        'Stroll through Yoyogi Park on a quiet morning'
      ]
    },
    generalActivities: [
      'Cross the famous Shibuya Crossing',
      'See the skyline from the Tokyo Metropolitan Government Building',
      'Explore the nightlife in Roppongi',
      'Walk across the Rainbow Bridge at Odaiba',
      'Visit the Hachiko Statue in Shibuya'
    ]
  },
  paris: {
    hotels: [
      { name: 'Generator Hostel Paris', rating: '4.1/5', tier: 'Budget' },
      { name: 'Hotel Regina Louvre', rating: '4.5/5', tier: 'Mid Range' },
      { name: 'The Ritz Paris', rating: '4.9/5', tier: 'Luxury' }
    ],
    dayActivities: {
      Food: [
        'Fresh croissants and espresso at a Montmartre café',
        'Gourmet food tour in the historic Marais district',
        'Wine and cheese tasting session in a vaulted cellar',
        'Dine at a classic Parisian bistro like Bouillon Chartier',
        'Indulge in macarons at Ladurée on the Champs-Élysées'
      ],
      Culture: [
        'Explore the masterpieces at the Louvre Museum',
        'Admire Impressionist art at the Musée d\'Orsay',
        'Visit the iconic Notre-Dame Cathedral area',
        'Take a historical tour of the Palace of Versailles',
        'Climb the steps of the Sacré-Cœur Basilica in Montmartre'
      ],
      Adventure: [
        'Climb to the top of the Eiffel Tower',
        'Explore the mysterious Catacombs of Paris',
        'Take a bicycle tour along the Seine River',
        'Spend a day at Disneyland Paris',
        'Climb to the roof of the Arc de Triomphe'
      ],
      Shopping: [
        'Stroll and shop along the Champs-Élysées',
        'Browse the historic department store Galeries Lafayette',
        'Shop vintage finds at Saint-Ouen Flea Market',
        'Discover boutiques in Saint-Germain-des-Prés',
        'Browse the bouquinistes (bookstalls) along the Seine'
      ],
      Relaxation: [
        'Have a sunny picnic in the Luxembourg Gardens',
        'Relax on a Bateaux Parisiens boat cruise along the Seine',
        'Read a book in the Jardin des Tuileries',
        'Stroll along the Canal Saint-Martin',
        'Enjoy a quiet coffee in the Place des Vosges'
      ]
    },
    generalActivities: [
      'Take photos at the Trocadéro overlooking the Eiffel Tower',
      'Stroll through the Latin Quarter',
      'See the Palais Garnier Opera House',
      'Walk under the Pont Alexandre III',
      'Explore the artistic streets of Montmartre'
    ]
  },
  new_york: {
    hotels: [
      { name: 'Pod 39 Hotel', rating: '4.2/5', tier: 'Budget' },
      { name: 'Arlo NoMad', rating: '4.5/5', tier: 'Mid Range' },
      { name: 'The Plaza Hotel', rating: '4.9/5', tier: 'Luxury' }
    ],
    dayActivities: {
      Food: [
        'Grab a classic NYC bagel and coffee in Chelsea',
        'Eat pizza slices in DUMBO, Brooklyn',
        'Go on a culinary tour of Chinatown and Little Italy',
        'Have pastrami on rye at Katz\'s Delicatessen',
        'Dine at a trendy restaurant in the Meatpacking District'
      ],
      Culture: [
        'Visit the Metropolitan Museum of Art (The Met)',
        'Explore modern art at MoMA',
        'Take the ferry to the Statue of Liberty and Ellis Island',
        'Watch a spectacular Broadway show in Times Square',
        'Visit the moving 9/11 Memorial & Museum'
      ],
      Adventure: [
        'Walk across the historic Brooklyn Bridge',
        'Rent a bike and ride around Central Park',
        'See 360-degree views from the Empire State Building',
        'Walk the elevated High Line park in Chelsea',
        'Climb the vessel or visit Edge at Hudson Yards'
      ],
      Shopping: [
        'Browse shops along Fifth Avenue',
        'Shop for trendy clothing in SoHo',
        'Explore the stores inside Oculus and Westfield World Trade Center',
        'Shop at Macy\'s Herald Square, the world\'s largest department store',
        'Browse vintage goods in Williamsburg, Brooklyn'
      ],
      Relaxation: [
        'Lie on the grass at Sheep Meadow in Central Park',
        'Take the free Staten Island Ferry for harbor views',
        'Relax with a coffee in Bryant Park',
        'Explore the quiet paths of Roosevelt Island',
        'Stroll through the Brooklyn Botanic Garden'
      ]
    },
    generalActivities: [
      'See the bright lights of Times Square at night',
      'Explore Grand Central Terminal',
      'Walk through the Flatiron District',
      'Visit the Rockefeller Center',
      'Stroll through Greenwich Village'
    ]
  }
};

// Default template for any other destination
const DEFAULT_TEMPLATE: IDestinationTemplate = {
  hotels: [
    { name: 'Local Cozy Hostel', rating: '4.0/5', tier: 'Budget' },
    { name: 'Downtown Comfort Inn', rating: '4.4/5', tier: 'Mid Range' },
    { name: 'Grand Royal Resort & Spa', rating: '4.8/5', tier: 'Luxury' }
  ],
  dayActivities: {
    Food: [
      'Explore the local central food market',
      'Join a guided street food tasting tour',
      'Dine at a highly-rated local cuisine restaurant',
      'Take a hands-on cooking class with a local chef',
      'Enjoy breakfast at a historic local café'
    ],
    Culture: [
      'Visit the city\'s historic cathedral or temple',
      'Take a guided walking tour of the Old Town',
      'Explore the regional history museum',
      'Visit a prominent local art gallery',
      'Discover ancient ruins or heritage landmarks'
    ],
    Adventure: [
      'Take a scenic hike to a panoramic city viewpoint',
      'Rent a bicycle to explore the city limits',
      'Join a local outdoor adventure (kayaking, zip-lining, etc.)',
      'Take a day trip to a nearby national park',
      'Explore the city skyline from a rooftop observation deck'
    ],
    Shopping: [
      'Browse local handicrafts and souvenirs at the bazaar',
      'Shop at the city\'s main retail shopping street',
      'Explore local designer boutiques',
      'Visit a modern shopping mall complex',
      'Browse an outdoor weekend flea market'
    ],
    Relaxation: [
      'Relax in the city\'s central public park',
      'Take a scenic river cruise or harbor boat ride',
      'Spend the afternoon at a local spa or public bathhouse',
      'Relax at a quiet beach, lakefront, or botanical garden',
      'Enjoy sunset drinks with a panoramic view'
    ]
  },
  generalActivities: [
    'Take a stroll through the central plaza',
    'Photograph local iconic architectural sights',
    'Meet locals and discover hidden alleyways',
    'Enjoy live music or street performances',
    'Take a hop-on hop-off city exploration bus'
  ]
};

// Smart Local Mock Generator
export function generateMockItinerary(
  destination: string,
  duration: number,
  budgetType: 'Low' | 'Medium' | 'High',
  interests: string[]
): ITripGenerationResult {
  const normDest = destination.toLowerCase().trim().replace(/\s+/g, '_');
  const template = DESTINATION_TEMPLATES[normDest] || DEFAULT_TEMPLATE;
  
  // 1. Generate Days
  const days: IMockDayPlan[] = [];
  
  // Compile list of possible activities based on interests
  let activePool: string[] = [];
  interests.forEach(interest => {
    const key = interest as keyof typeof template.dayActivities;
    if (template.dayActivities[key]) {
      activePool = [...activePool, ...template.dayActivities[key]];
    }
  });
  
  // If pool is empty, fill with general activities
  if (activePool.length === 0) {
    activePool = [...template.generalActivities];
  }
  
  // Shuffle pool helper
  const shuffle = (array: string[]) => {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };
  
  let shuffledPool = shuffle(activePool);
  let generalShuffled = shuffle(template.generalActivities);
  let poolIndex = 0;
  let genIndex = 0;

  for (let d = 1; d <= duration; d++) {
    const dayActivities: string[] = [];
    
    // Pick 2 interest-based activities
    for (let i = 0; i < 2; i++) {
      if (poolIndex >= shuffledPool.length) {
        shuffledPool = shuffle(activePool);
        poolIndex = 0;
      }
      dayActivities.push(shuffledPool[poolIndex++]);
    }
    
    // Pick 1 general activity
    if (genIndex >= generalShuffled.length) {
      generalShuffled = shuffle(template.generalActivities);
      genIndex = 0;
    }
    dayActivities.push(generalShuffled[genIndex++]);
    
    days.push({
      dayNumber: d,
      activities: dayActivities
    });
  }

  // 2. Estimate Budget
  // Budgets vary by Low/Medium/High
  let flightCost = 350;
  let lodgingPerDay = 50;
  let foodPerDay = 25;
  let activityCostPerDay = 15;

  if (budgetType === 'Medium') {
    flightCost = 650;
    lodgingPerDay = 120;
    foodPerDay = 60;
    activityCostPerDay = 40;
  } else if (budgetType === 'High') {
    flightCost = 1200;
    lodgingPerDay = 350;
    foodPerDay = 150;
    activityCostPerDay = 100;
  }

  // Multiply by duration
  const flights = flightCost;
  const accommodation = lodgingPerDay * duration;
  const food = foodPerDay * duration;
  const activities = activityCostPerDay * duration;
  const total = flights + accommodation + food + activities;

  const estimatedBudget: IMockBudget = {
    flights,
    accommodation,
    food,
    activities,
    total
  };

  // 3. Select Hotels (Filter by budget tier)
  const suggestedHotels = template.hotels.map(hotel => {
    // If user selected low, they get all or budget prioritized
    return hotel;
  });

  // 4. Generate Packing List
  const packingList: IMockPackingItem[] = [
    { name: 'Passport & Visa documentation', category: 'Documents', packed: false },
    { name: 'Copy of Travel Insurance', category: 'Documents', packed: false },
    { name: 'Toothbrush, paste & toiletries bag', category: 'Toiletries', packed: false },
    { name: 'Universal Travel Adapter', category: 'Gear', packed: false },
    { name: 'Comfortable walking shoes', category: 'Clothing', packed: false }
  ];

  // Duration-based clothing addition
  if (duration > 5) {
    packingList.push({ name: '7x sets of underwear & socks', category: 'Clothing', packed: false });
    packingList.push({ name: 'Laundry bag', category: 'Gear', packed: false });
  } else {
    packingList.push({ name: '3x-4x sets of underwear & socks', category: 'Clothing', packed: false });
  }

  // Interest-based additions
  if (interests.includes('Adventure')) {
    packingList.push({ name: 'Water-resistant backpack', category: 'Gear', packed: false });
    packingList.push({ name: 'Reusable water bottle', category: 'Gear', packed: false });
    packingList.push({ name: 'Outdoor jacket or fleece', category: 'Clothing', packed: false });
  }
  if (interests.includes('Relaxation') || interests.includes('Adventure')) {
    packingList.push({ name: 'Sunscreen SPF 50 & Sunglasses', category: 'Toiletries', packed: false });
  }
  if (interests.includes('Shopping')) {
    packingList.push({ name: 'Foldable tote bag for shopping', category: 'Gear', packed: false });
    packingList.push({ name: 'Credit cards with zero foreign fees', category: 'Documents', packed: false });
  }
  if (interests.includes('Food')) {
    packingList.push({ name: 'Hand sanitizer & wet wipes', category: 'Toiletries', packed: false });
    packingList.push({ name: 'Digestive supplements / antacids', category: 'Toiletries', packed: false });
  }
  if (interests.includes('Culture')) {
    packingList.push({ name: 'Notebook and pen', category: 'Gear', packed: false });
    packingList.push({ name: 'Modest clothes for visiting temples/churches', category: 'Clothing', packed: false });
  }

  return {
    days,
    estimatedBudget,
    suggestedHotels,
    packingList
  };
}

// Live Gemini Generator
export async function generateItineraryWithAI(
  destination: string,
  duration: number,
  budgetType: 'Low' | 'Medium' | 'High',
  interests: string[],
  apiKey: string
): Promise<ITripGenerationResult> {
  const prompt = `
Generate a structured travel itinerary for a trip to "${destination}" for ${duration} days.
The traveler has a "${budgetType}" budget preference.
Their interests are: ${interests.join(', ')}.

Provide your response in EXACT JSON format with the following keys. Do not include any markdown backticks, explanations, or wrappers. The output must be pure JSON:
{
  "days": [
    {
      "dayNumber": 1,
      "activities": [
        "Activity description 1",
        "Activity description 2",
        "Activity description 3"
      ]
    }
  ],
  "estimatedBudget": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "total": 950
  },
  "suggestedHotels": [
    { "name": "Hotel name 1 (Budget)", "rating": "4.2/5", "tier": "Budget" },
    { "name": "Hotel name 2 (Mid Range)", "rating": "4.5/5", "tier": "Mid Range" },
    { "name": "Hotel name 3 (Luxury)", "rating": "4.8/5", "tier": "Luxury" }
  ],
  "packingList": [
    { "name": "Item name", "category": "Clothing", "packed": false }
  ]
}

Categories for packing items must be one of: "Clothing", "Gear", "Documents", "Toiletries", "Other".
Tiers for hotels must be one of: "Budget", "Mid Range", "Luxury".
All budget values must be numbers representing cost in USD.
Provide realistic activity and budget estimations based on the destination "${destination}" and budget tier "${budgetType}".
`;

  try {
    let responseText = '';
    
    // Attempt standard classic SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    
    const response = await result.response;
    responseText = response.text();
    
    // Parse the output
    const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const data = JSON.parse(cleanJson) as ITripGenerationResult;
    return data;
  } catch (error) {
    console.error('Failed to generate with live Gemini API, falling back to mock:', error);
    return generateMockItinerary(destination, duration, budgetType, interests);
  }
}

// Regenerate Day Generator
export async function regenerateDayWithAI(
  destination: string,
  budgetType: 'Low' | 'Medium' | 'High',
  dayNumber: number,
  currentActivities: string[],
  prompt: string,
  apiKey?: string
): Promise<string[]> {
  if (!apiKey) {
    // Local Mock Regeneration
    const lowerPrompt = prompt.toLowerCase();
    
    // Based on keyword, return themed mock activities
    if (lowerPrompt.includes('outdoor') || lowerPrompt.includes('nature') || lowerPrompt.includes('adventure') || lowerPrompt.includes('active')) {
      return [
        `Morning hike at a scenic nature trail near ${destination}`,
        `Picnic lunch in a quiet national park or forest reserve`,
        `Afternoon outdoor adventure activity (kayaking, biking, or zip-lining)`
      ];
    } else if (lowerPrompt.includes('relax') || lowerPrompt.includes('chill') || lowerPrompt.includes('slow')) {
      return [
        `Leisurely morning sleeping in followed by coffee at a quiet local café`,
        `Afternoon spa visit, public bathhouse soak, or beach relaxation`,
        `Scenic sunset stroll along the waterfront and a quiet local dinner`
      ];
    } else if (lowerPrompt.includes('food') || lowerPrompt.includes('eat') || lowerPrompt.includes('culinary') || lowerPrompt.includes('drink')) {
      return [
        `Gourmet breakfast tour sampling local bakery specialties`,
        `Hands-on cooking masterclass learning to make signature local dishes`,
        `Food market crawl checking out street vendors and food stands for dinner`
      ];
    } else if (lowerPrompt.includes('culture') || lowerPrompt.includes('history') || lowerPrompt.includes('museum') || lowerPrompt.includes('art')) {
      return [
        `Visit the local museum of history or prominent historical palace`,
        `Explore the historic old town center with a knowledgeable guide`,
        `Attend a cultural performance, music showcase, or art exhibition`
      ];
    } else {
      // Default fallback modifications
      return currentActivities.map(act => `${act} (Updated with outdoor/relaxing vibes)`);
    }
  }

  // Live API Call
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const fullPrompt = `
For a trip to "${destination}" with "${budgetType}" budget.
The activities currently planned for Day ${dayNumber} are:
${currentActivities.map((act, i) => `- ${act}`).join('\n')}

The user wants to regenerate Day ${dayNumber} with this instruction: "${prompt}"

Provide a revised list of 3-4 specific activities for Day ${dayNumber} in EXACT JSON format. Do not include markdown backticks or explanations:
[
  "Activity description 1",
  "Activity description 2",
  "Activity description 3"
]
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const response = await result.response;
    const responseText = response.text();
    const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    return JSON.parse(cleanJson) as string[];
  } catch (error) {
    console.error('Failed to regenerate day with AI, falling back to mock:', error);
    return currentActivities.map(act => `${act} (Updated with offline mock)`);
  }
}
