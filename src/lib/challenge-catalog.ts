import ChallengeDefinition, { type ChallengePhase } from '@/models/ChallengeDefinition';
import Team from '@/models/Team';
import { featureChallenges, situationChallenges, type DistributedChallenge } from '@/lib/challenge-distributor';

type TeamForAllocation = { _id: { toString(): string }; teamName: string; projectIdea?: string };

function uniqueSeeds(items: DistributedChallenge[], phase: ChallengePhase) {
  const byTitle = new Map<string, DistributedChallenge>();
  items.forEach((item) => byTitle.set(item.title.toLowerCase(), item));
  return Array.from(byTitle.values()).map((item) => ({
    phase,
    title: item.title,
    problem: item.problem,
    mission: item.mission,
    specialRequirement: item.specialRequirement,
    oneLineSolution: item.oneLineSolution,
    judgeCheck: item.judgeCheck,
    difficulty: item.difficulty,
    keywords: keywordList(`${item.title} ${item.problem}`),
    enabled: true,
  }));
}

export function keywordList(value: string) {
  return Array.from(new Set((value.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((word) => !new Set([
    'with', 'that', 'this', 'from', 'your', 'into', 'real', 'data', 'project', 'application', 'important', 'feature', 'features',
  ]).has(word)))).slice(0, 24);
}

export async function ensureChallengeCatalog() {
  const count = await ChallengeDefinition.countDocuments();
  if (count > 0) return;
  await ChallengeDefinition.insertMany([
    ...uniqueSeeds(featureChallenges, 'feature'),
    ...uniqueSeeds(situationChallenges, 'situation'),
  ], { ordered: false });
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export async function drawFairChallenge(phase: ChallengePhase, team: TeamForAllocation) {
  await ensureChallengeCatalog();
  const definitions = await ChallengeDefinition.find({ phase, enabled: true }).lean();
  if (definitions.length === 0) throw new Error(`No active ${phase} challenges are available`);

  const field = phase === 'feature' ? 'featureChallenge' : 'situationChallenge';
  const teams = await Team.find({}, `${field}.title`).lean();
  const usage = new Map<string, number>();
  teams.forEach((item: any) => {
    const title = item[field]?.title?.toLowerCase();
    if (title) usage.set(title, (usage.get(title) || 0) + 1);
  });

  const minimumUse = Math.min(...definitions.map((item) => usage.get(item.title.toLowerCase()) || 0));
  const leastUsed = definitions.filter((item) => (usage.get(item.title.toLowerCase()) || 0) === minimumUse);
  const teamWords = new Set(keywordList(`${team.teamName} ${team.projectIdea || ''}`));

  return leastUsed.sort((a, b) => {
    const aFit = a.keywords.filter((word) => teamWords.has(word)).length;
    const bFit = b.keywords.filter((word) => teamWords.has(word)).length;
    if (aFit !== bFit) return bFit - aFit;
    return stableHash(`${team._id}:${a._id}`) - stableHash(`${team._id}:${b._id}`);
  })[0];
}
