const troops = [
  { name: "Barbarian", level: 12, maxLevel: 12, village: "home" },
  { name: "Archer", level: 11, maxLevel: 12, village: "home" },
  { name: "Goblin", level: 9, maxLevel: 9, village: "home" },
  { name: "Giant", level: 11, maxLevel: 12, village: "home" },
  { name: "Wall Breaker", level: 12, maxLevel: 12, village: "home" },
  { name: "Balloon", level: 11, maxLevel: 11, village: "home" },
  { name: "Wizard", level: 11, maxLevel: 12, village: "home" },
  { name: "Healer", level: 9, maxLevel: 9, village: "home" },
  { name: "Dragon", level: 11, maxLevel: 11, village: "home" },
  { name: "P.E.K.K.A", level: 10, maxLevel: 11, village: "home" },
  { name: "Minion", level: 11, maxLevel: 12, village: "home" },
  { name: "Hog Rider", level: 13, maxLevel: 13, village: "home" },
  { name: "Valkyrie", level: 11, maxLevel: 11, village: "home" },
  { name: "Golem", level: 12, maxLevel: 13, village: "home" },
  { name: "Witch", level: 7, maxLevel: 7, village: "home" },
  { name: "Lava Hound", level: 6, maxLevel: 6, village: "home" },
  { name: "Bowler", level: 8, maxLevel: 8, village: "home" },
  { name: "Baby Dragon", level: 10, maxLevel: 10, village: "home" },
  { name: "Miner", level: 10, maxLevel: 10, village: "home" },
  {
    name: "Super Barbarian",
    level: 1,
    maxLevel: 8,
    superTroopIsActive: true,
    village: "home",
  },
  { name: "Super Archer", level: 1, maxLevel: 8, village: "home" },
  {
    name: "Super Wall Breaker",
    level: 1,
    maxLevel: 8,
    village: "home",
  },
  { name: "Super Giant", level: 1, maxLevel: 8, village: "home" },
  {
    name: "Raged Barbarian",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Sneaky Archer",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Beta Minion",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Boxer Giant",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  { name: "Bomber", level: 18, maxLevel: 20, village: "builderBase" },
  {
    name: "Power P.E.K.K.A",
    level: 20,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Cannon Cart",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Drop Ship",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Baby Dragon",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  {
    name: "Night Witch",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  { name: "Wall Wrecker", level: 4, maxLevel: 5, village: "home" },
  { name: "Battle Blimp", level: 4, maxLevel: 4, village: "home" },
  { name: "Yeti", level: 5, maxLevel: 6, village: "home" },
  {
    name: "Sneaky Goblin",
    level: 1,
    maxLevel: 5,
    superTroopIsActive: true,
    village: "home",
  },
  { name: "Super Miner", level: 1, maxLevel: 10, village: "home" },
  { name: "Rocket Balloon", level: 1, maxLevel: 7, village: "home" },
  { name: "Ice Golem", level: 7, maxLevel: 8, village: "home" },
  { name: "Electro Dragon", level: 7, maxLevel: 7, village: "home" },
  { name: "Stone Slammer", level: 4, maxLevel: 5, village: "home" },
  { name: "Inferno Dragon", level: 1, maxLevel: 10, village: "home" },
  { name: "Super Valkyrie", level: 1, maxLevel: 11, village: "home" },
  { name: "Dragon Rider", level: 4, maxLevel: 4, village: "home" },
  { name: "Super Witch", level: 1, maxLevel: 7, village: "home" },
  {
    name: "Hog Glider",
    level: 18,
    maxLevel: 20,
    village: "builderBase",
  },
  { name: "Siege Barracks", level: 5, maxLevel: 5, village: "home" },
  { name: "Ice Hound", level: 1, maxLevel: 6, village: "home" },
  { name: "Super Bowler", level: 1, maxLevel: 8, village: "home" },
  { name: "Super Dragon", level: 1, maxLevel: 9, village: "home" },
  { name: "Headhunter", level: 3, maxLevel: 3, village: "home" },
  { name: "Super Wizard", level: 1, maxLevel: 8, village: "home" },
  { name: "Super Minion", level: 1, maxLevel: 9, village: "home" },
  { name: "Log Launcher", level: 5, maxLevel: 5, village: "home" },
  { name: "Flame Flinger", level: 4, maxLevel: 5, village: "home" },
  { name: "Battle Drill", level: 3, maxLevel: 4, village: "home" },
  { name: "Electro Titan", level: 3, maxLevel: 4, village: "home" },
  { name: "Apprentice Warden", level: 4, maxLevel: 4, village: "home" },
  { name: "Super Hog Rider", level: 1, maxLevel: 10, village: "home" },
  {
    name: "Electrofire Wizard",
    level: 1,
    maxLevel: 20,
    village: "builderBase",
  },
  { name: "Root Rider", level: 3, maxLevel: 3, village: "home" },
  { name: "L.A.S.S.I", level: 15, maxLevel: 15, village: "home" },
  { name: "Mighty Yak", level: 15, maxLevel: 15, village: "home" },
  { name: "Electro Owl", level: 15, maxLevel: 15, village: "home" },
  { name: "Unicorn", level: 10, maxLevel: 10, village: "home" },
  { name: "Phoenix", level: 10, maxLevel: 10, village: "home" },
  { name: "Poison Lizard", level: 10, maxLevel: 10, village: "home" },
  { name: "Diggy", level: 10, maxLevel: 10, village: "home" },
  { name: "Frosty", level: 10, maxLevel: 10, village: "home" },
  { name: "Spirit Fox", level: 10, maxLevel: 10, village: "home" },
  { name: "Angry Jelly", level: 4, maxLevel: 10, village: "home" },
];
