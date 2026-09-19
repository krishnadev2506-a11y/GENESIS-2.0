import ChallengeDefinition, { type ChallengePhase } from '@/models/ChallengeDefinition';
import Team from '@/models/Team';
import { featureChallenges, type DistributedChallenge } from '@/lib/challenge-distributor';
import { phase2Situations } from '@/data/phase2-situations';

type TeamForAllocation = { _id: { toString(): string }; teamName: string; projectIdea?: string };
const SITUATION_CATALOG_VERSION = 'phase2-before-after-v3';

function uniqueFeatureSeeds(items: DistributedChallenge[]) {
  const byTitle = new Map<string, DistributedChallenge>();
  items.forEach((item) => byTitle.set(item.title.toLowerCase(), item));
  return Array.from(byTitle.values()).map((item) => ({
    phase: 'feature' as const, title: item.title, problem: item.problem, mission: item.mission,
    specialRequirement: item.specialRequirement, oneLineSolution: item.oneLineSolution,
    judgeCheck: item.judgeCheck, difficulty: item.difficulty,
    keywords: keywordList(`${item.title} ${item.problem}`), enabled: true,
  }));
}

function situationSeeds() {
  return phase2Situations.map((item) => ({
    phase: 'situation' as const, logicalId: item.id, title: item.title, problem: item.situation,
    mission: item.challenge, specialRequirement: item.solutionDirection, oneLineSolution: item.metric,
    judgeCheck: item.judgeCheck, difficulty: item.hardness, weight: item.weight, before: item.before,
    solutionDirection: item.solutionDirection, after: item.after, metric: item.metric,
    metricExplanation: item.metricExplanation, category: item.category,
    catalogVersion: SITUATION_CATALOG_VERSION, keywords: keywordList(`${item.title} ${item.situation}`), enabled: true,
  }));
}

export function keywordList(value: string) {
  return Array.from(new Set((value.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((word) => !new Set([
    'with', 'that', 'this', 'from', 'your', 'into', 'real', 'data', 'project', 'application', 'important', 'feature', 'features',
  ]).has(word)))).slice(0, 24);
}

export async function ensureChallengeCatalog() {
  if (await ChallengeDefinition.countDocuments({ phase: 'feature' }) === 0) {
    await ChallengeDefinition.insertMany(uniqueFeatureSeeds(featureChallenges), { ordered: false });
  }
  const versioned = await ChallengeDefinition.countDocuments({ phase: 'situation', catalogVersion: SITUATION_CATALOG_VERSION });
  if (versioned !== phase2Situations.length) {
    await ChallengeDefinition.deleteMany({ phase: 'situation' });
    await ChallengeDefinition.insertMany(situationSeeds(), { ordered: false });
  }
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

export async function drawFairChallenge(phase: ChallengePhase, team: TeamForAllocation, unassignedOnly = false) {
  await ensureChallengeCatalog();
  const definitions = await ChallengeDefinition.find({ phase, enabled: true }).lean();
  if (definitions.length === 0) throw new Error(`No active ${phase} challenges are available`);

  if (phase === 'situation') {
    const assignedTeam = await Team.findById(team._id, 'situationChallenge').lean();
    const priorLogicalId = (assignedTeam as any)?.situationChallenge?.logicalId || (assignedTeam as any)?.situationChallenge?.id;
    let candidates = definitions.filter((item: any) => item.logicalId !== priorLogicalId);
    if (unassignedOnly) {
      const teams = await Team.find({}, 'situationChallenge.title').lean();
      const usedTitles = new Set(teams.map((item: any) => item.situationChallenge?.title?.toLowerCase()).filter(Boolean));
      candidates = candidates.filter((item) => !usedTitles.has(item.title.toLowerCase()));
    }
    if (candidates.length === 0) throw new Error(`No unallocated ${phase} challenges are available`);
    const weighted = candidates.flatMap((item: any) => Array.from({ length: item.weight || 1 }, () => item));
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  const teams = await Team.find({}, 'featureChallenge.title').lean();
  const usage = new Map<string, number>();
  teams.forEach((item: any) => { const title = item.featureChallenge?.title?.toLowerCase(); if (title) usage.set(title, (usage.get(title) || 0) + 1); });
  const candidates = unassignedOnly ? definitions.filter((item) => (usage.get(item.title.toLowerCase()) || 0) === 0) : definitions;
  if (candidates.length === 0) throw new Error(`No unallocated ${phase} challenges are available`);
  const minimumUse = Math.min(...candidates.map((item) => usage.get(item.title.toLowerCase()) || 0));
  const leastUsed = candidates.filter((item) => (usage.get(item.title.toLowerCase()) || 0) === minimumUse);
  const teamWords = new Set(keywordList(`${team.teamName} ${team.projectIdea || ''}`));
  return leastUsed.sort((a, b) => {
    const aFit = a.keywords.filter((word) => teamWords.has(word)).length;
    const bFit = b.keywords.filter((word) => teamWords.has(word)).length;
    return aFit !== bFit ? bFit - aFit : stableHash(`${team._id}:${a._id}`) - stableHash(`${team._id}:${b._id}`);
  })[0];
}
