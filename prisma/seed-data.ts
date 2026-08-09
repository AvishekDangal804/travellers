// Static source data for prisma/seed.ts. Kept separate from the seeding
// logic so the destination content itself is easy to review/extend without
// touching database code.

export interface SeedItineraryDay {
  day: number;
  title: string;
  description: string;
  distanceKm?: number;
  elevationGainM?: number;
}

export interface SeedDestination {
  slug: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "STRENUOUS";
  durationDays: number;
  elevationM: number;
  bestSeason: string;
  budgetMinUsd: number;
  budgetMaxUsd: number;
  latitude: number;
  longitude: number;
  highlights: string[];
  safetyInfo: string;
  meetingPoint: string;
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  itinerary: SeedItineraryDay[];
}

export const destinations: SeedDestination[] = [
  {
    slug: "everest-base-camp",
    name: "Everest Base Camp",
    region: "Khumbu",
    summary: "The classic pilgrimage to the foot of the world's highest mountain through Sherpa villages and glacial valleys.",
    description:
      "The Everest Base Camp trek follows the Dudh Kosi valley up through Namche Bazaar, Tengboche's famous monastery, and Dingboche before crossing moraine to Gorak Shep and the base camp itself. Along the way you'll get some of the best mountain panoramas on Earth, including Everest, Lhotse, Nuptse, and Ama Dablam, plus an close look at Sherpa culture in the Khumbu.",
    difficulty: "STRENUOUS",
    durationDays: 12,
    elevationM: 5364,
    bestSeason: "Mar–May, Sep–Nov",
    budgetMinUsd: 1200,
    budgetMaxUsd: 2200,
    latitude: 28.0026,
    longitude: 86.8528,
    highlights: ["Kala Patthar sunrise viewpoint", "Tengboche Monastery", "Sherpa culture in Namche Bazaar", "Close-up views of Everest, Lhotse & Nuptse"],
    safetyInfo:
      "Altitude sickness is the primary risk above 3,500m. Build in acclimatization days at Namche and Dingboche, ascend slowly, and carry travel insurance that covers helicopter evacuation.",
    meetingPoint: "Tenzing-Hillary Airport, Lukla",
    distanceKm: 130,
    elevationGainM: 3600,
    elevationLossM: 3600,
    itinerary: [
      { day: 1, title: "Fly to Lukla, trek to Phakding", description: "Short scenic flight followed by an easy first walk along the Dudh Kosi river.", distanceKm: 8, elevationGainM: 100 },
      { day: 3, title: "Acclimatization day in Namche Bazaar", description: "Hike up to the Everest View Hotel for first sight of Everest, then rest in the Sherpa capital.", distanceKm: 6, elevationGainM: 400 },
      { day: 5, title: "Tengboche Monastery", description: "Visit the Khumbu's most important monastery with Ama Dablam towering behind it.", distanceKm: 10, elevationGainM: 400 },
      { day: 8, title: "Gorak Shep to Everest Base Camp", description: "Walk across the Khumbu Glacier moraine to reach base camp itself.", distanceKm: 15, elevationGainM: 300 },
      { day: 9, title: "Kala Patthar sunrise", description: "Pre-dawn climb for the definitive close-up panorama of Everest.", distanceKm: 5, elevationGainM: 400 },
      { day: 12, title: "Fly back to Kathmandu", description: "Trek down to Lukla and fly back, trip complete.", distanceKm: 18, elevationGainM: 0 },
    ],
  },
  {
    slug: "annapurna-base-camp",
    name: "Annapurna Base Camp",
    region: "Annapurna",
    summary: "A dramatic amphitheater of 7,000–8,000m peaks reached through rhododendron forest and Gurung villages.",
    description:
      "The Annapurna Base Camp (ABC) trek is one of the most rewarding treks in the world for the effort involved — in just over a week you walk from subtropical foothills into a natural amphitheater surrounded on three sides by the Annapurna massif. The trail passes through Gurung and Magar villages, hot springs at Jhinu Danda, and dense rhododendron forest that blooms bright red and pink in spring.",
    difficulty: "CHALLENGING",
    durationDays: 8,
    elevationM: 4130,
    bestSeason: "Mar–May, Sep–Nov",
    budgetMinUsd: 700,
    budgetMaxUsd: 1300,
    latitude: 28.5308,
    longitude: 83.8794,
    highlights: ["360° amphitheater of Annapurna peaks", "Jhinu Danda natural hot springs", "Rhododendron forests in bloom", "Gurung village culture"],
    safetyInfo: "Afternoon cloud and rain are common — start hiking early each day. The final approach to ABC can be exposed to avalanche risk after heavy snow; always check with your guide or teahouse owners.",
    meetingPoint: "Nayapul trailhead, near Pokhara",
    distanceKm: 70,
    elevationGainM: 3200,
    elevationLossM: 3200,
    itinerary: [
      { day: 1, title: "Nayapul to Tikhedhunga", description: "Trailhead drive from Pokhara followed by a gentle riverside walk.", distanceKm: 10, elevationGainM: 300 },
      { day: 2, title: "Ulleri stone steps to Ghorepani", description: "The famous stone staircase through rhododendron forest.", distanceKm: 10, elevationGainM: 1000 },
      { day: 4, title: "Chhomrong to Himalaya", description: "Deep into the Modi Khola gorge with your first close views of Machhapuchhre.", distanceKm: 14, elevationGainM: 700 },
      { day: 5, title: "Arrive at Annapurna Base Camp", description: "Walk into the amphitheater itself for sunset over the Annapurna massif.", distanceKm: 8, elevationGainM: 600 },
      { day: 8, title: "Jhinu Danda hot springs", description: "Descend and soak tired legs in natural hot springs by the river.", distanceKm: 12, elevationGainM: 0 },
    ],
  },
  {
    slug: "mardi-himal",
    name: "Mardi Himal",
    region: "Annapurna",
    summary: "A quieter, ridge-top alternative to ABC with jaw-dropping close-ups of Machhapuchhre (Fishtail).",
    description:
      "Mardi Himal is the trek locals recommend to travelers who want big Himalayan views without the crowds of the main Annapurna trails. The route climbs a forested ridge directly toward Machhapuchhre, opening into rhododendron and then alpine meadow before reaching high camp and base camp at the foot of Mardi Himal peak.",
    difficulty: "MODERATE",
    durationDays: 5,
    elevationM: 4500,
    bestSeason: "Oct–Dec, Mar–May",
    budgetMinUsd: 400,
    budgetMaxUsd: 750,
    latitude: 28.4833,
    longitude: 83.85,
    highlights: ["Close-up views of Machhapuchhre (Fishtail)", "Quiet, less-crowded trail", "High Camp sunrise", "Rhododendron forest"],
    safetyInfo: "The ridge above High Camp is exposed to wind and can be icy in winter — proper footwear and layers are essential. Weather changes fast; check conditions before pushing to base camp.",
    meetingPoint: "Kande trailhead, near Pokhara",
    distanceKm: 40,
    elevationGainM: 2800,
    elevationLossM: 2800,
    itinerary: [
      { day: 1, title: "Kande to Forest Camp", description: "Start on a ridge trail through dense rhododendron and oak forest.", distanceKm: 9, elevationGainM: 900 },
      { day: 2, title: "Forest Camp to Low Camp", description: "Continue climbing the ridge as the forest begins to thin out.", distanceKm: 6, elevationGainM: 600 },
      { day: 3, title: "Low Camp to High Camp", description: "Break above the treeline with Machhapuchhre now dominating the skyline.", distanceKm: 5, elevationGainM: 700 },
      { day: 4, title: "Sunrise at Mardi Himal viewpoint", description: "Pre-dawn walk up to the viewpoint and (conditions permitting) base camp.", distanceKm: 8, elevationGainM: 600 },
      { day: 5, title: "Descend to Siding village", description: "Long descent back through the forest to the road head.", distanceKm: 12, elevationGainM: 0 },
    ],
  },
  {
    slug: "langtang-valley",
    name: "Langtang Valley",
    region: "Langtang",
    summary: "The closest Himalayan trek to Kathmandu, rebuilt with resilience after the 2015 earthquake.",
    description:
      "Just north of Kathmandu, the Langtang Valley trek combines glaciated peaks, Tamang culture, and Buddhist monasteries in a valley that rebuilt itself after the devastating 2015 earthquake and landslide. The trail follows the Langtang Khola through forest and yak pasture to Kyanjin Gompa, with side trips to a cheese factory and the Tserko Ri viewpoint.",
    difficulty: "MODERATE",
    durationDays: 7,
    elevationM: 3870,
    bestSeason: "Mar–May, Sep–Nov",
    budgetMinUsd: 500,
    budgetMaxUsd: 950,
    latitude: 28.2108,
    longitude: 85.6182,
    highlights: ["Kyanjin Gompa monastery", "Tserko Ri viewpoint", "Tamang heritage villages", "Local yak cheese factory"],
    safetyInfo: "Trail sections near Langtang village cross old landslide terrain — stay on marked paths and heed local guide advice, especially during and after monsoon.",
    meetingPoint: "Syabrubesi bus stand",
    distanceKm: 55,
    elevationGainM: 2400,
    elevationLossM: 2400,
    itinerary: [
      { day: 1, title: "Syabrubesi to Lama Hotel", description: "Enter the valley through dense subtropical forest along the Langtang Khola.", distanceKm: 13, elevationGainM: 800 },
      { day: 3, title: "Arrive in Langtang village", description: "Walk through the rebuilt village with views of Langtang Lirung opening up.", distanceKm: 12, elevationGainM: 500 },
      { day: 4, title: "Kyanjin Gompa", description: "Reach the valley's high point village and visit its monastery and cheese factory.", distanceKm: 8, elevationGainM: 400 },
      { day: 5, title: "Tserko Ri viewpoint", description: "Early climb for a full panorama of the Langtang Himal range.", distanceKm: 8, elevationGainM: 700 },
      { day: 7, title: "Return to Syabrubesi", description: "Retrace the valley trail back to the road.", distanceKm: 20, elevationGainM: 0 },
    ],
  },
  {
    slug: "poon-hill",
    name: "Poon Hill",
    region: "Annapurna",
    summary: "A short, family-friendly classic famous for one of the best sunrise viewpoints in Nepal.",
    description:
      "Poon Hill is the trek most travelers do when time is short but the Himalaya is calling. A few days of walking through terraced farmland, Magar and Gurung villages, and rhododendron forest lead to the 3,210m viewpoint at Poon Hill, where sunrise lights up Dhaulagiri, Annapurna South, and Machhapuchhre in sequence.",
    difficulty: "EASY",
    durationDays: 4,
    elevationM: 3210,
    bestSeason: "Oct–Apr",
    budgetMinUsd: 250,
    budgetMaxUsd: 450,
    latitude: 28.3986,
    longitude: 83.6997,
    highlights: ["Sunrise over Dhaulagiri & Annapurna ranges", "Ghandruk & Ghorepani villages", "Gentle, family-friendly trail", "Rhododendron forest in spring"],
    safetyInfo: "The stone staircases can be slippery when wet — trekking poles and grippy footwear help. Otherwise this is one of the lowest-risk treks in the region.",
    meetingPoint: "Nayapul trailhead, near Pokhara",
    distanceKm: 33,
    elevationGainM: 1900,
    elevationLossM: 1900,
    itinerary: [
      { day: 1, title: "Nayapul to Tikhedhunga", description: "Riverside walk to the base of the Ulleri staircase.", distanceKm: 10, elevationGainM: 300 },
      { day: 2, title: "Tikhedhunga to Ghorepani", description: "The famous stone staircase, then rolling forest trail to Ghorepani.", distanceKm: 10, elevationGainM: 1300 },
      { day: 3, title: "Poon Hill sunrise, descend to Tadapani", description: "Pre-dawn climb to the viewpoint, then a forest walk toward Ghandruk.", distanceKm: 11, elevationGainM: 300 },
      { day: 4, title: "Ghandruk to Nayapul", description: "Visit the Gurung museum in Ghandruk before the final descent.", distanceKm: 12, elevationGainM: 0 },
    ],
  },
  {
    slug: "manaslu-circuit",
    name: "Manaslu Circuit",
    region: "Manaslu",
    summary: "A remote, restricted-area circuit around the world's eighth-highest mountain, crossing the dramatic Larkya La pass.",
    description:
      "The Manaslu Circuit is Nepal's answer to the Annapurna Circuit before it was a road — a remote, culturally rich trail that requires a special restricted-area permit and a licensed guide. It follows the Budhi Gandaki river gorge up through Gurung and then Tibetan-influenced villages before crossing the high, glaciated Larkya La pass at 5,106m.",
    difficulty: "STRENUOUS",
    durationDays: 14,
    elevationM: 5106,
    bestSeason: "Mar–May, Sep–Nov",
    budgetMinUsd: 1400,
    budgetMaxUsd: 2300,
    latitude: 28.55,
    longitude: 84.5597,
    highlights: ["Larkya La pass crossing (5,106m)", "Remote Tibetan-influenced villages", "Views of Manaslu, the world's 8th highest peak", "Restricted-area trail with few other trekkers"],
    safetyInfo: "Requires a Restricted Area Permit and must be done with a licensed guide by law. The Larkya La crossing is a long, high-altitude day — only attempt with full acclimatization and be prepared to wait out weather.",
    meetingPoint: "Machha Khola trailhead",
    distanceKm: 170,
    elevationGainM: 4300,
    elevationLossM: 4300,
    itinerary: [
      { day: 1, title: "Soti Khola to Machha Khola", description: "Enter the Budhi Gandaki gorge on a dramatic river trail.", distanceKm: 15, elevationGainM: 200 },
      { day: 5, title: "Namrung to Samagaon", description: "Villages become increasingly Tibetan in character as Manaslu comes into view.", distanceKm: 18, elevationGainM: 900 },
      { day: 8, title: "Acclimatization day, Samagaon", description: "Side hike toward Manaslu Base Camp for views and altitude adaptation.", distanceKm: 10, elevationGainM: 600 },
      { day: 10, title: "Cross the Larkya La (5,106m)", description: "A long, cold, unforgettable day crossing Manaslu's highest pass.", distanceKm: 20, elevationGainM: 950 },
      { day: 14, title: "Dharapani to road head", description: "Descend into the Marsyangdi valley and drive out.", distanceKm: 15, elevationGainM: 0 },
    ],
  },
  {
    slug: "kanchenjunga-base-camp",
    name: "Kanchenjunga Base Camp",
    region: "Kanchenjunga",
    summary: "A long, wild expedition-style trek to the base of the world's third-highest mountain in Nepal's far east.",
    description:
      "Kanchenjunga sits in Nepal's remote far east on the border with India and Tibet, and reaching its base camps means committing to one of the longest, wildest treks in the country. Two base camps — Pang Pema in the north and Oktang in the south — bookend a trail through some of the least-visited villages and forests in the Himalaya.",
    difficulty: "STRENUOUS",
    durationDays: 18,
    elevationM: 5143,
    bestSeason: "Apr–May, Oct–Nov",
    budgetMinUsd: 1700,
    budgetMaxUsd: 2700,
    latitude: 27.7025,
    longitude: 88.1475,
    highlights: ["Pang Pema & Oktang base camps", "Remote far-eastern Nepal culture", "Rhododendron and bamboo forest", "Views of the Kanchenjunga massif from both sides"],
    safetyInfo: "This is a restricted, expedition-grade trek requiring a special permit, a licensed guide, and a minimum group size. Facilities are basic — carry a comprehensive medical kit and satellite communication where possible.",
    meetingPoint: "Taplejung airstrip",
    distanceKm: 220,
    elevationGainM: 5200,
    elevationLossM: 5200,
    itinerary: [
      { day: 1, title: "Fly to Taplejung, trek to Mitlung", description: "Begin in the far eastern hills, well off the main trekking circuits.", distanceKm: 12, elevationGainM: 200 },
      { day: 7, title: "Ghunsa to Lhonak", description: "Enter high alpine terrain approaching the northern base camp.", distanceKm: 15, elevationGainM: 800 },
      { day: 8, title: "Pang Pema (North Base Camp)", description: "Face-to-face with Kanchenjunga's dramatic north face.", distanceKm: 8, elevationGainM: 400 },
      { day: 14, title: "Cross Mirgin La to Tortong", description: "A high, remote pass connecting the northern and southern approaches.", distanceKm: 16, elevationGainM: 700 },
      { day: 16, title: "Oktang (South Base Camp)", description: "The trek's second base camp, with views of Jannu and Kanchenjunga South.", distanceKm: 14, elevationGainM: 600 },
    ],
  },
  {
    slug: "shivapuri",
    name: "Shivapuri",
    region: "Kathmandu Valley",
    summary: "A day-hike escape from Kathmandu into national-park forest with sweeping valley and Himalayan views.",
    description:
      "Shivapuri National Park is Kathmandu's backyard wilderness — a forested ridge just north of the city that makes for a perfect day or weekend hike. The trail climbs through pine and oak forest past the Shivapuri peak and the source of the Bagmati river, with views back over the Kathmandu Valley and, on clear days, out to the Langtang and Ganesh Himal ranges.",
    difficulty: "EASY",
    durationDays: 1,
    elevationM: 2732,
    bestSeason: "Year-round (best Oct–Apr)",
    budgetMinUsd: 20,
    budgetMaxUsd: 60,
    latitude: 27.8167,
    longitude: 85.4333,
    highlights: ["Kathmandu Valley viewpoint", "Bagmati river source", "National park forest & wildlife", "Easy access from the city"],
    safetyInfo: "A national park entry permit is required at the gate. The park closes before dark — plan your hike to finish well within opening hours.",
    meetingPoint: "Panimuhan / Sundarijal gate, Shivapuri Nagarjun National Park",
    distanceKm: 14,
    elevationGainM: 950,
    elevationLossM: 950,
    itinerary: [
      { day: 1, title: "Sundarijal to Shivapuri Peak and back", description: "A full-day loop through forest to the summit viewpoint and back down to the gate.", distanceKm: 14, elevationGainM: 950 },
    ],
  },
  {
    slug: "panch-pokhari",
    name: "Panch Pokhari",
    region: "Sindhupalchok",
    summary: "A sacred cluster of five high-altitude lakes reached via a steep, quiet trail northeast of Kathmandu.",
    description:
      "Panch Pokhari ('five lakes') is a Hindu and Buddhist pilgrimage site at over 4,100m in Sindhupalchok district, still well off the main trekking trails. The route climbs steeply through terraced hillsides and forest to alpine pasture, culminating at the sacred lakes with panoramic views of the Jugal Himal and, on clear days, Everest in the distance.",
    difficulty: "CHALLENGING",
    durationDays: 6,
    elevationM: 4100,
    bestSeason: "Mar–May, Sep–Nov",
    budgetMinUsd: 450,
    budgetMaxUsd: 850,
    latitude: 27.9333,
    longitude: 85.7333,
    highlights: ["Five sacred alpine lakes", "Jugal Himal views", "Quiet, little-visited trail", "Hindu & Buddhist pilgrimage site"],
    safetyInfo: "The trail is steep and can be exposed to landslides during monsoon — avoid Jun–Aug. Nights above 4,000m are cold year-round; pack accordingly.",
    meetingPoint: "Chautara bus park",
    distanceKm: 48,
    elevationGainM: 2900,
    elevationLossM: 2900,
    itinerary: [
      { day: 1, title: "Chautara to Bhotang", description: "Climb through terraced farmland into rhododendron forest.", distanceKm: 10, elevationGainM: 900 },
      { day: 3, title: "Nasimpati to Panch Pokhari", description: "Alpine pasture gives way to the sacred lakes basin.", distanceKm: 9, elevationGainM: 800 },
      { day: 4, title: "Panch Pokhari exploration", description: "Full day at the lakes with side trips to nearby ridgelines for Jugal Himal views.", distanceKm: 6, elevationGainM: 300 },
      { day: 6, title: "Descend to Chautara", description: "Retrace the route back down to the road head.", distanceKm: 23, elevationGainM: 0 },
    ],
  },
  {
    slug: "ilam",
    name: "Ilam",
    region: "Eastern Hills",
    summary: "Rolling emerald tea gardens and cloud forest in Nepal's most scenic tea-growing hill district.",
    description:
      "Ilam is less a trek and more a slow wander through some of Nepal's most photogenic countryside — terraced tea gardens climbing green hills, cardamom farms, and cloud forest, with the occasional view north to the Kanchenjunga range. It's an easy, low-altitude escape best paired with visits to working tea estates and the Antu Danda viewpoint.",
    difficulty: "EASY",
    durationDays: 2,
    elevationM: 1677,
    bestSeason: "Sep–Apr",
    budgetMinUsd: 60,
    budgetMaxUsd: 150,
    latitude: 26.9088,
    longitude: 87.925,
    highlights: ["Rolling tea garden landscapes", "Antu Danda sunrise viewpoint", "Working tea estate visits", "Distant Kanchenjunga views"],
    safetyInfo: "Low altitude and gentle terrain make this one of the safest trips on the platform. Roads can be slippery during monsoon rains.",
    meetingPoint: "Ilam Bazaar",
    distanceKm: 18,
    elevationGainM: 500,
    elevationLossM: 500,
    itinerary: [
      { day: 1, title: "Ilam Bazaar to Antu Danda", description: "Walk through tea gardens to a ridge famous for sunrise views.", distanceKm: 9, elevationGainM: 400 },
      { day: 2, title: "Tea estate visit and Mai Pokhari", description: "Visit a working tea factory and the sacred Mai Pokhari lake.", distanceKm: 9, elevationGainM: 100 },
    ],
  },
  {
    slug: "tinjure",
    name: "Tinjure Danda",
    region: "Eastern Hills",
    summary: "Nepal's largest rhododendron forest, blazing red and pink across the ridgeline every spring.",
    description:
      "The Tinjure–Milke–Jaljale ridge in eastern Nepal is home to the country's most extensive rhododendron forest, with over 20 species blooming across the hillsides from March to April. Outside bloom season it's still a rewarding, quiet ridge walk with wide Himalayan views from Kanchenjunga to Everest on a clear day.",
    difficulty: "MODERATE",
    durationDays: 5,
    elevationM: 3600,
    bestSeason: "Mar–Apr (bloom), Oct–Nov",
    budgetMinUsd: 300,
    budgetMaxUsd: 550,
    latitude: 27.2333,
    longitude: 87.5833,
    highlights: ["Largest rhododendron forest in Nepal", "Ridge-top Himalayan panorama", "Limbu & Rai village culture", "Quiet eastern-Nepal trail"],
    safetyInfo: "Trails can be muddy and leech-prone just after monsoon — insect repellent and gaiters help. Otherwise a low-risk, moderate ridge walk.",
    meetingPoint: "Basantapur bus park",
    distanceKm: 45,
    elevationGainM: 2100,
    elevationLossM: 2100,
    itinerary: [
      { day: 1, title: "Basantapur to Chauki", description: "Enter the ridge trail through mixed forest.", distanceKm: 10, elevationGainM: 500 },
      { day: 2, title: "Chauki to Tinjure Danda", description: "Walk deep into the rhododendron forest belt.", distanceKm: 9, elevationGainM: 600 },
      { day: 3, title: "Tinjure to Gupha Pokhari", description: "Ridge walking between viewpoints with a sacred lake stop.", distanceKm: 8, elevationGainM: 400 },
      { day: 5, title: "Descend to Basantapur", description: "Return route back down to the road.", distanceKm: 18, elevationGainM: 0 },
    ],
  },
  {
    slug: "khopra-danda",
    name: "Khopra Danda",
    region: "Annapurna",
    summary: "A high, grassy ridge with a rarely-crowded, front-row view of the Annapurna Sanctuary peaks.",
    description:
      "Khopra Danda (also called Khopra Ridge) is a high alpine meadow on the western edge of the Annapurna Conservation Area, reached via a quieter branch off the classic Poon Hill trail. From the ridge, and the side trip to the sacred Khayer Lake, you get an uninterrupted panorama of Dhaulagiri, Annapurna South, and Nilgiri without the crowds of ABC.",
    difficulty: "MODERATE",
    durationDays: 6,
    elevationM: 3660,
    bestSeason: "Mar–May, Sep–Nov",
    budgetMinUsd: 400,
    budgetMaxUsd: 750,
    latitude: 28.4333,
    longitude: 83.6167,
    highlights: ["Panoramic ridge camp with almost no crowds", "Side trip to sacred Khayer Lake", "Views of Dhaulagiri & Annapurna South", "Community-run lodges"],
    safetyInfo: "The ridge is exposed to wind and can see early-season snow — check conditions before the Khayer Lake side trip. Community-run lodges have limited capacity, so guides typically book ahead.",
    meetingPoint: "Tadapani village",
    distanceKm: 50,
    elevationGainM: 2600,
    elevationLossM: 2600,
    itinerary: [
      { day: 1, title: "Tadapani to Isharu", description: "Branch off the main Poon Hill trail onto the quieter Khopra route.", distanceKm: 9, elevationGainM: 400 },
      { day: 3, title: "Swanta to Khopra Danda", description: "Climb above the treeline onto the open ridge camp.", distanceKm: 10, elevationGainM: 900 },
      { day: 4, title: "Khayer Lake side trip", description: "Early climb to the sacred high-altitude lake and back.", distanceKm: 12, elevationGainM: 500 },
      { day: 6, title: "Descend to Ghandruk", description: "Long descent back through Gurung villages.", distanceKm: 15, elevationGainM: 0 },
    ],
  },
];

export const HIKER_INTERESTS = [
  "Photography",
  "Wildlife",
  "Camping",
  "Cultural villages",
  "Sunrise viewpoints",
  "Yoga & meditation",
  "Trail running",
  "Bird watching",
  "Local cuisine",
  "High passes",
];

export const GUIDE_LANGUAGES = ["Nepali", "English", "Hindi", "Japanese", "German", "French", "Spanish"];
export const GUIDE_SPECIALTIES = [
  "High-altitude trekking",
  "Restricted area permits",
  "Photography treks",
  "Cultural tours",
  "Family-friendly hikes",
  "Peak climbing support",
  "Solo traveler support",
];

export const HIKER_NAMES = [
  "Avi Gurung", "Sabina Rai", "Kiran Thapa", "Prakriti Shrestha", "Bikash Magar",
  "Nisha Tamang", "Rohan Basnet", "Anjali Karki", "Suman Lama", "Priya Adhikari",
  "Dipesh Bhattarai", "Sunita Ghale", "Aayush Poudel", "Kritika Sherpa", "Nabin Chhetri",
  "Sarita Bista", "Manish Rana", "Pooja Khadka", "Sagar Neupane", "Elena Novak",
];

export const GUIDE_NAMES = [
  "Pemba Sherpa", "Dawa Lama", "Karma Sherpa", "Lakpa Tamang", "Mingma Sherpa",
  "Ram Bahadur Gurung", "Chandra Rai", "Ang Dorjee Sherpa", "Kumar Magar", "Sita Gurung",
];