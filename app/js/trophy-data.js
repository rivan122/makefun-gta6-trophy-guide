// Loads the trophy list and holds the tracker's reference tables: what each
// grade is worth, how the kinds are labelled, and the roadmap's ten stages.

export const GRADE_POINTS = { bronze: 15, silver: 30, gold: 90, platinum: 300 };

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  general: 'Free roam',
};

export const KIND_FILTERS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'general'];

// The roadmap: the order this guide recommends, built from the official
// descriptions — chapters and missions first (with the flagged moments
// watched for on the way), then strands, sets, activities and cleanup.
export const ROADMAP_STAGES = [
  { stage: 1, title: 'The opening & Chapter 1', note: 'Gone Fishing starts the story and Chapter 1 closes its first act. Bank In The Beginning… here: its name and its Ocean Beach description both point at the opening hours, so take the cocktail moment before the story pulls you away.' },
  { stage: 2, title: 'Chapter 2', note: 'Straight story progress. Nothing in Chapter 2\'s trophy description adds a side condition — completion is the whole job.' },
  { stage: 3, title: 'Chapter 3', note: 'Straight story progress again: finish the chapter\'s closing mission and move on.' },
  { stage: 4, title: 'Chapter 4 & the final mission', note: 'The last numbered chapter and the gold for the final mission. Before the endgame, glance at the Missables view — the remaining flagged moments belong to the story, not to free roam.' },
  { stage: 5, title: 'Named missions & story set-pieces', note: 'Breakfast Run, The Cartel Heist, Child\'s Play, Headliners, VCIA Takedown and Operation Savage Glory pop as their missions appear across the chapters. Two flagged trophies live here: Catch Me If You Can must be taken during VCIA Takedown, and Capital Offense is a showroom set-piece to watch for as the story moves.' },
  { stage: 6, title: 'Strangers, freaks & contacts', note: 'Finish the strands: the finales for Andy, Kenton, Billy, Randy and Tyrone, Bret\'s unique-animal hunt, and eight strands in all for Strangers & Freaks. The descriptions set no deadlines, so this stage sits comfortably after the story.' },
  { stage: 7, title: 'Collectibles & exploration', note: 'The Leonida-wide sets: 18 meditation spots, 3 Collectible Card sets, 100 WAiNK locations, 100 discovered vehicles and all 52 areas of the state. Sweep region by region and the sets finish together.' },
  { stage: 8, title: 'Activities & challenges', note: 'Master the activity family: sample all 9 activity types, gold all 42 Shooting Range challenges, win Top Fun at all 14 locations, win 20 different races, beat Cal at fishing, finish an arcade game and the bowling, complete 250 stunts and 50 Challenges.' },
  { stage: 9, title: 'Free-roam feats, crime & money', note: 'Everything the open world lets you repeat until it lands: the partner feats, the robberies, Combat Focus, the gag-description trophies, $250,000 of laundered Marked Bills, $100,000 spent, all 8 garages and 10 Scooter Bros registrations. None of these can be missed — they are here because they take the longest.' },
  { stage: 10, title: '100% completion & the platinum', note: 'When the strands, sets and activities are done, the completion counter reaches 100% for A Long Road, and the platinum — Vice Got a Price! — follows automatically once all 54 other trophies are earned.' },
];

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophy data failed to load');
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  return trophies.slice().sort((a, b) => a.id - b.id);
}

export function pointsFor(trophy) {
  return GRADE_POINTS[trophy.grade] ?? 0;
}

export function earnedPoints(trophies, earnedIds) {
  return trophies.reduce((sum, t) => sum + (earnedIds.has(t.id) ? pointsFor(t) : 0), 0);
}

export function stageOf(trophy) {
  return ROADMAP_STAGES.find((s) => s.stage === trophy.stage) ?? ROADMAP_STAGES[0];
}

// A story trophy is a spoiler while the setting is on and it is unearned:
// its name, description and guide stay sealed until the player earns it.
export function isSealedSpoiler(trophy, earnedIds, hideSpoilers) {
  return hideSpoilers && trophy.kind === 'story' && !earnedIds.has(trophy.id);
}
