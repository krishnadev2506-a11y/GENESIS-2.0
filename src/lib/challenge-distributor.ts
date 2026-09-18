export type ChallengePhase = 'feature' | 'situation';

export interface DistributedChallenge {
  id: string;
  title: string;
  problem: string;
  mission?: string;
  specialRequirement?: string;
  oneLineSolution: string;
  judgeCheck: string;
  difficulty: number;
}

type FeatureSeed = Omit<DistributedChallenge, 'id'>;
type SeedTuple = [string, string, string, string, string, number];
const features: FeatureSeed[] = ([
  ['PROJECT ASSISTANT', 'Add an AI-powered assistant that understands the purpose of the project and uses real application information.', 'It must use actual project data or context, not give generic chatbot answers.', 'Connect the assistant to relevant project data/context so it can answer project-specific questions or assist with a real workflow.', 'Ask a question whose answer requires information from the team’s application.', 6],
  ['SMART RECOMMENDATION', 'Recommend useful resources, opportunities, items, services, or actions for users.', 'Recommendations must depend on actual user or project information.', 'Generate recommendations from existing project or user data instead of a fixed list.', 'Change relevant information and demonstrate that the recommendation changes.', 6],
  ['ADVANCED SEARCH', 'Improve searching for projects containing many records.', 'Search must use multiple meaningful fields in actual project data.', 'Search across several relevant fields and return matching records.', 'Perform multiple searches and demonstrate correct results.', 5],
  ['FILTER SYSTEM', 'Make large lists of records easier to narrow down.', 'At least two filters must work together.', 'Allow users to combine filters to narrow real project data.', 'Apply different combinations and demonstrate correct results.', 5],
  ['PROJECT DASHBOARD', 'Create a useful project dashboard rather than decorative cards.', 'Show at least three statistics calculated from actual data.', 'Calculate meaningful metrics from project data and present them clearly.', 'Verify numbers correspond to actual project data.', 5],
  ['SIMPLE CHARTS', 'Represent useful project information visually.', 'Use at least two meaningful visualizations based on actual data.', 'Connect charts to real data so they change with the data.', 'Change project data and demonstrate a chart update.', 5],
  ['NOTIFICATION CENTER', 'Create a central place for important application notifications.', 'Notifications must come from actual project events.', 'Create and store notifications when selected application events occur.', 'Trigger an event and demonstrate its notification.', 5],
  ['REMINDER SYSTEM', 'Let users remember important project tasks, dates, or actions.', 'A reminder must attach to a real record or event.', 'Attach reminders to real project records/events and notify users when appropriate.', 'Create a reminder and demonstrate the complete flow.', 5],
  ['QR CODE ACTION', 'Add a QR-code shortcut for an important application action.', 'Scanning must trigger a real application action.', 'Encode a project action or identifier in the QR code and process it when scanned.', 'Scan the code and demonstrate the resulting action.', 5],
  ['EMAIL ALERT', 'Send email for an important project event.', 'The email must be triggered by an actual application event.', 'Connect an important event to an email notification workflow.', 'Trigger the event and demonstrate the email.', 6],
  ['PDF / REPORT EXPORT', 'Generate a useful report from current project information.', 'Use actual current project data.', 'Convert selected project data into a structured downloadable report.', 'Generate the report and verify its contents.', 5],
  ['CSV DATA IMPORT', 'Import multiple records using a CSV file.', 'Validate uploaded records before importing them.', 'Read and validate CSV rows, identify invalid records, and import acceptable data.', 'Upload a CSV with valid and invalid records.', 6],
  ['SMART CATEGORIZATION', 'Automatically categorize project records.', 'Users must be able to correct and save an incorrect category.', 'Assign categories automatically and let users correct them.', 'Create an item, correct its category, and verify it saves.', 5],
  ['DUPLICATE WARNING', 'Warn users before likely duplicate records are created.', 'Compare meaningful existing record fields before accepting data.', 'Compare important fields and warn about likely duplicates.', 'Attempt to create a similar record and demonstrate the warning.', 5],
  ['ADMIN REVIEW', 'Add an approval workflow for submissions or actions.', 'Use Pending, Approved, and Rejected states.', 'Allow an authorized user to approve or reject a submission.', 'Submit an item and demonstrate the review process.', 5],
  ['ACTIVITY HISTORY', 'Show important project or account actions chronologically.', 'History must contain actual actions.', 'Record important application actions and display them in order.', 'Perform actions and demonstrate them in the history.', 5],
  ['PROGRESS TRACKER', 'Show progress through an important project process.', 'Progress must be connected to real project states.', 'Connect a progress indicator to actual record or workflow status.', 'Change status and demonstrate progress updating.', 5],
  ['STATUS WORKFLOW', 'Add meaningful states to an existing project process.', 'Use at least three meaningful states.', 'Store status and allow controlled movement through the workflow.', 'Demonstrate an item moving through the workflow.', 5],
  ['SHAREABLE ITEM', 'Let a user share a specific project item.', 'The shared reference must point to the correct real record.', 'Generate a unique shareable link or identifier for an individual record.', 'Create and open a shareable reference.', 5],
  ['BULK ACTION', 'Perform an operation on multiple records together.', 'The operation must work on multiple real records.', 'Select records and apply one valid action to all of them.', 'Select at least three records and perform the action.', 5],
  ['LOCATION FEATURE', 'Add a useful location-based behavior such as nearby results or distance.', 'Location must affect application behavior; simply showing a map is not enough.', 'Use location to change application results or behavior.', 'Change location and demonstrate a different result.', 6],
  ['MULTI-LANGUAGE', 'Support another language in important parts of the application.', 'Multiple meaningful interface elements must change.', 'Store interface text separately and show the selected language dynamically.', 'Switch languages and demonstrate meaningful changes.', 5],
  ['SMART FORM', 'Improve a real form with context-aware assistance.', 'The improvement must be useful in the project workflow.', 'Add validation or assistance that reacts to entered values.', 'Enter different values and demonstrate the response.', 5],
  ['CALENDAR VIEW', 'Display date-related project information in a calendar.', 'Calendar entries must come from actual project data.', 'Connect project events, tasks, or dates to an interactive calendar.', 'Modify an event and demonstrate the calendar updating.', 5],
  ['REAL-TIME UPDATE', 'Update important project information without manual refresh.', 'The update must involve actual project data.', 'Synchronize important changes so active users/pages update automatically.', 'Demonstrate the change from two browser windows or sessions.', 7],
  ['SMART SUMMARY', 'Summarize important project information users would otherwise read individually.', 'The summary must be based on actual project data.', 'Collect relevant data and generate a concise project-specific summary.', 'Change data and demonstrate that the summary changes.', 5],
  ['AI DATA QUESTION', 'Let users ask normal-language questions about project data.', 'Answers must come from actual application data.', 'Convert the question into a data lookup/query and return a verified result.', 'Ask two project-specific questions and verify the answers.', 7],
  ['SMART ALERT', 'Recognize an important condition and alert the user.', 'The condition must be based on actual project data.', 'Check project data for a useful condition and trigger an alert.', 'Change data so the condition occurs and demonstrate the alert.', 6],
  ['SMART MATCHING', 'Match users, items, or records using meaningful criteria.', 'Matching must use actual project attributes.', 'Compare relevant attributes and produce suitable matches.', 'Change an input and demonstrate the result changes.', 6],
  ['PERSONALIZED HOME PAGE', 'Show users useful information based on their own context.', 'At least two users must see meaningful differences.', 'Use role, preferences, history, or data to customize the home page.', 'Use two users and demonstrate differences.', 5],
] as SeedTuple[]).map(([title, problem, specialRequirement, oneLineSolution, judgeCheck, difficulty]) => ({ title, problem, specialRequirement, oneLineSolution, judgeCheck, difficulty }));

const situations: FeatureSeed[] = ([
  ['CHANGE THE DATABASE', 'The project can no longer use its current database. Important data must continue to work with another database.', 'Adapt the application data layer and move or convert required data to the new database.', 'Adapt the existing project to work with the new database.', 'Demonstrate important functionality working with the replacement database.', 6],
  ['API NOT WORKING', 'An external API suddenly stops working, so a dependent feature may fail.', 'Add error handling and a suitable fallback when the API is unavailable.', 'Make the affected feature continue working where possible or fail gracefully.', 'Simulate API failure and demonstrate the application behavior.', 5],
  ['MAKE IT MOBILE FRIENDLY', 'Users now access the project mainly from mobile phones and an important workflow is difficult on small screens.', 'Make the workflow responsive and use mobile-friendly controls.', 'Adapt the important workflow for mobile users.', 'Demonstrate the workflow on a mobile-sized screen.', 4],
  ['ADD A NEW USER ROLE', 'A new type of user has been introduced, but the project does not know what they can see or do.', 'Create the new role and connect it to appropriate access rules.', 'Add the new role with suitable access.', 'Demonstrate the new role and its permissions.', 5],
  ['NEW REQUIREMENT', 'The project owner asks for an additional requirement without breaking existing functionality.', 'Integrate the requirement into the workflow and check existing features.', 'Add the new requirement to the existing project.', 'Demonstrate the requirement and an existing feature.', 5],
  ['CHANGE PERMISSIONS', 'A user who previously had access should no longer be allowed to use a feature.', 'Update authorization so access depends on role or permission.', 'Change the application permissions.', 'Demonstrate both allowed and denied access.', 5],
  ['TOO MUCH DATA', 'Thousands of records now make the existing interface hard to use.', 'Use pagination, filtering, sorting, grouping, or improved search.', 'Make the data easier to manage.', 'Demonstrate the application with a larger dataset.', 5],
  ['INVALID USER INPUT', 'Users are entering incorrect, incomplete, or unexpected information.', 'Validate before processing and provide clear correction guidance.', 'Improve the relevant form or workflow.', 'Enter invalid information and demonstrate the response.', 4],
  ['NOTIFICATION PROBLEM', 'Users are missing important application notifications.', 'Connect important events to a reliable notification mechanism.', 'Improve the notification experience.', 'Trigger an important event and demonstrate notification.', 5],
  ['SEARCH PROBLEM', 'Users cannot easily locate records as the project contains more information.', 'Expand search to relevant fields and return useful matches.', 'Improve the search experience.', 'Demonstrate multiple searches with actual project data.', 5],
  ['ACCIDENTAL DELETION', 'An important record is accidentally deleted with no recovery mechanism.', 'Use recoverable deletion such as soft-delete or restore.', 'Allow recovery of accidentally deleted information.', 'Delete a record and demonstrate recovery.', 5],
  ['APPLICATION IS SLOW', 'An important page or workflow has become noticeably slow.', 'Reduce unnecessary processing or data loading in the slow workflow.', 'Improve one meaningful part of the application.', 'Demonstrate the slow area and explain the improvement.', 6],
] as SeedTuple[]).map(([title, problem, oneLineSolution, mission, judgeCheck, difficulty]) => ({ title, problem, oneLineSolution, mission, judgeCheck, difficulty }));

const featureWeights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 0, 0, 0, 2, 1, 26];
const situationWeights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap((index, i) => Array.from({ length: [3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 2, 3][i] }, () => index));

function createPool(seeds: FeatureSeed[], weights: number[], phase: ChallengePhase): DistributedChallenge[] {
  return weights.map((seedIndex, index) => ({ id: `${phase}-${index + 1}`, ...seeds[seedIndex] }));
}

export const featureChallenges = createPool(features, featureWeights, 'feature');
export const situationChallenges = createPool(situations, situationWeights, 'situation');

export function drawChallenge(phase: ChallengePhase): DistributedChallenge {
  const pool = phase === 'feature' ? featureChallenges : situationChallenges;
  return pool[Math.floor(Math.random() * pool.length)];
}
