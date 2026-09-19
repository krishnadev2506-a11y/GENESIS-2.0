/**
 * Phase 1 challenge assignments.
 *
 * Each team is mapped to a specific challenge. The lookup helper
 * normalises the team name so minor whitespace / case differences
 * are handled gracefully.
 */

export interface Phase1Assignment {
  title: string;
  project: string;
  problem: string;
  difficulty: number;
}

const assignments: Record<string, Phase1Assignment> = {
  'sync6': {
    title: 'DUPLICATE REPORT DETECTION',
    project: 'Disaster Resource Coordination',
    problem: 'Warn users before a likely duplicate report gets created.',
    difficulty: 5,
  },
  'nissaramm': {
    title: 'QUEUE INSIGHTS CHART',
    project: 'Queue Management System',
    problem: 'Represent useful queue information visually.',
    difficulty: 5,
  },
  'pentabyte': {
    title: 'STATUS WORKFLOW',
    project: 'Digital Hostel Gatepass',
    problem: 'Add meaningful states to the existing approval process.',
    difficulty: 5,
  },
  'xeva': {
    title: 'DUPLICATE REQUEST DETECTION',
    project: 'ReliefLink (AI Disaster Management)',
    problem: 'Warn users before a likely duplicate request gets created.',
    difficulty: 5,
  },
  'decoders': {
    title: 'SYNC CONFLICT HANDLING',
    project: 'Nattil Alert',
    problem: 'Handle a case where the same record was changed in two places before syncing.',
    difficulty: 6,
  },
  'iron titans': {
    title: 'STATUS WORKFLOW',
    project: 'Duty Leave Approval System',
    problem: 'Add meaningful states to the existing approval process.',
    difficulty: 5,
  },
  'breaking bytes': {
    title: 'NOTIFICATION CENTER',
    project: 'FitHub',
    problem: 'Create a central place for important application notifications.',
    difficulty: 5,
  },
  'storm breakers': {
    title: 'REMINDER SYSTEM',
    project: 'Nova Tracker',
    problem: 'Let users remember important tasks, dates, or actions.',
    difficulty: 5,
  },
  'command line crew': {
    title: 'REAL-TIME UPDATE',
    project: 'ResQ AI',
    problem: 'Update important project information without manual refresh.',
    difficulty: 7,
  },
  'hexahack': {
    title: 'DUPLICATE WARNING',
    project: 'CampusOne',
    problem: 'Warn users before a likely duplicate record gets created.',
    difficulty: 5,
  },
  'tech divas': {
    title: 'SMART MATCHING',
    project: 'Campus Lost & Found',
    problem: 'Match records using meaningful criteria.',
    difficulty: 6,
  },
  'french toast': {
    title: 'REMINDER SYSTEM',
    project: 'AI Academic Assistant',
    problem: 'Let users remember important tasks, dates, or actions.',
    difficulty: 5,
  },
  'vibe coders': {
    title: 'DUPLICATE WARNING',
    project: 'Warranty Checker',
    problem: 'Warn users before a likely duplicate record gets created.',
    difficulty: 5,
  },
  'nexus': {
    title: 'ACTIVITY HISTORY',
    project: 'DeepGuard AI',
    problem: 'Show important project or account actions chronologically.',
    difficulty: 5,
  },
  'coffeepowder': {
    title: 'ADVANCED SEARCH',
    project: 'CoffeePowder',
    problem: 'Improve searching for projects containing many records.',
    difficulty: 5,
  },
  'kernel': {
    title: 'SMART MATCHING',
    project: 'NexHaul',
    problem: 'Match users, items, or records using meaningful criteria.',
    difficulty: 6,
  },
  'runtime terrors': {
    title: 'PROGRESS TRACKER',
    project: 'NutriLens',
    problem: 'Show progress through an important project process.',
    difficulty: 5,
  },
  'code blooded': {
    title: 'BULK ACTION',
    project: 'Qsync',
    problem: 'Perform an operation on multiple records together.',
    difficulty: 5,
  },
  'nexora': {
    title: 'SMART MATCHING',
    project: 'ResQHub',
    problem: 'Match users, items, or records using meaningful criteria.',
    difficulty: 6,
  },
  'incubug': {
    title: 'PDF / REPORT EXPORT',
    project: 'Smart Crop Management',
    problem: 'Generate a useful report from current project information.',
    difficulty: 5,
  },
  'bay route': {
    title: 'SMART MATCHING',
    project: 'Online Blood Bank',
    problem: 'Match users, items, or records using meaningful criteria.',
    difficulty: 6,
  },
  'syntax_six': {
    title: 'SMART MATCHING',
    project: 'Unitrade Lost & Found',
    problem: 'Match records using meaningful criteria.',
    difficulty: 6,
  },
  'r00t': {
    title: 'ACTIVITY HISTORY',
    project: 'Vision-Mate',
    problem: 'Show important project or account actions chronologically.',
    difficulty: 5,
  },
  'codzilla': {
    title: 'STATUS WORKFLOW',
    project: 'InternLens',
    problem: 'Add meaningful states to an existing project process.',
    difficulty: 5,
  },
  'altf4': {
    title: 'NOTIFICATION CENTER',
    project: 'Campus Nexus',
    problem: 'Create a central place for important application notifications.',
    difficulty: 5,
  },
  'squareone': {
    title: 'DUPLICATE WARNING',
    project: 'Community Issue Reporter',
    problem: 'Warn users before a likely duplicate record gets created.',
    difficulty: 5,
  },
  '4 real': {
    title: 'ACTIVITY HISTORY',
    project: 'AI Code Sanitizer',
    problem: 'Show important project or account actions chronologically.',
    difficulty: 5,
  },
  'hackmates': {
    title: 'SMART MATCHING',
    project: 'UniBridge',
    problem: 'Match records using meaningful criteria.',
    difficulty: 6,
  },
  'monochrome': {
    title: 'BULK ACTION',
    project: 'VendorOS',
    problem: 'Perform an operation on multiple records together.',
    difficulty: 5,
  },
  'cyber nexus': {
    title: 'DUPLICATE WARNING',
    project: 'SafeRoute',
    problem: 'Warn users before a likely duplicate record gets created.',
    difficulty: 5,
  },
  'adhil and co': {
    title: 'REMINDER SYSTEM',
    project: 'Catalyst',
    problem: 'Let users remember important tasks, dates, or actions.',
    difficulty: 5,
  },
  'carbon': {
    title: 'PROGRESS TRACKER',
    project: 'Terminal Learning Platform',
    problem: 'Show progress through an important project process.',
    difficulty: 5,
  },
};

/**
 * Look up the Phase 1 challenge for a team.
 * Normalises whitespace and case for a robust match.
 */
export function getPhase1Assignment(teamName: string): Phase1Assignment | undefined {
  const key = teamName.trim().toLowerCase().replace(/\s+/g, ' ');
  return assignments[key];
}

/** Return all unique challenge titles used in the Phase 1 map. */
export function getPhase1WheelEntries(): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];
  for (const entry of Object.values(assignments)) {
    if (!seen.has(entry.title)) {
      seen.add(entry.title);
      titles.push(entry.title);
    }
  }
  return titles;
}
