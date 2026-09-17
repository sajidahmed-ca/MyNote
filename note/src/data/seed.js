const now = Date.now()
const DAY = 86_400_000
const HOUR = 3_600_000

export const FOLDERS = [
  { id: 'uncategorized', label: 'Uncategorized' },
  { id: 'study', label: 'Study' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'ideas', label: 'Ideas' },
]

export const SEED_NOTES = [
  {
    id: 'seed-standard-01',
    title: 'Indigo Design System — Token Map',
    type: 'standard',
    folder: 'study',
    tags: ['design', 'dev'],
    pinned: true,
    archived: false,
    createdAt: now - 21 * DAY,
    updatedAt: now - 2 * HOUR,
    meta: {},
    flashcards: [],
    body:
      '<p>The <strong>Light&#8209;First Elegance</strong> system is built on six slate surfaces and a single indigo accent.</p>' +
      '<ul><li>Canvas <code>#F8FAFC</code> — outside the cards, quiet and airy</li>' +
      '<li>Surface <code>#FFFFFF</code> — the only pure stop we use</li>' +
      '<li>Ink <code>#0F172A</code> — primary text, nothing softer</li>' +
      '<li>Accent <code>#6366F1</code> — reserved for actions, never decoration</li></ul>' +
      '<p>Rule of thumb: if it is not interactive, it should probably be slate.</p>',
  },
  {
    id: 'seed-standard-02',
    title: 'Git Workflow Cheatsheet',
    type: 'standard',
    folder: 'work',
    tags: ['dev', 'git'],
    pinned: false,
    archived: false,
    createdAt: now - 18 * DAY,
    updatedAt: now - 1 * DAY,
    meta: {},
    flashcards: [],
    body:
      '<p>Interactive rebase, kept boring:</p>' +
      '<pre><code>git checkout -b feat/xyz\n' +
      'git add -p          # stage in hunks\n' +
      'git commit -m "feat: xyz"\n' +
      'git rebase -i main  # squash before push\n' +
      'git push -u origin feat/xyz</code></pre>' +
      '<blockquote>Force-push only to branches you own, and only before review.</blockquote>',
  },
  {
    id: 'seed-book-01',
    title: 'Atomic Habits',
    type: 'book',
    folder: 'study',
    tags: ['reading', 'habits'],
    pinned: true,
    archived: false,
    createdAt: now - 12 * DAY,
    updatedAt: now - 5 * HOUR,
    meta: { author: 'James Clear', page: 74, isbn: '' },
    flashcards: [
      {
        id: 'fc-book-01-a',
        front: 'The 1% better rule',
        back: 'Improve by 1% daily and you are ~37x better after a year.',
        createdAt: now - 6 * DAY,
      },
      {
        id: 'fc-book-01-b',
        front: "The four laws of behavior change",
        back: 'Make it obvious, attractive, easy, and satisfying.',
        createdAt: now - 4 * DAY,
      },
    ],
    body:
      '<p><strong>Chapter 4 — The Man Who Didn&#8217;t Look Right.</strong> Systems beat goals over the long run because identity is the real engine.</p>' +
      '<p>Key framing from this page: every action you take is a vote for the type of person you wish to become. Habits are the entrance fee.</p>' +
      '<p>Highlight-worthy passage (page 74): <em>&#8220;You do not rise to the level of your goals. You fall to the level of your systems.&#8221;</em></p>',
  },
  {
    id: 'seed-book-02',
    title: 'The Pragmatic Programmer',
    type: 'book',
    folder: 'study',
    tags: ['reading', 'dev'],
    pinned: false,
    archived: false,
    createdAt: now - 9 * DAY,
    updatedAt: now - 26 * HOUR,
    meta: { author: 'Hunt & Thomas', page: 122, isbn: '' },
    flashcards: [
      {
        id: 'fc-book-02-a',
        front: 'DRY principle',
        back: 'Every piece of knowledge must have a single, unambiguous, authoritative representation in a system.',
        createdAt: now - 5 * DAY,
      },
    ],
    body:
      '<p><strong>Chapter 5 — Bend, or Break.</strong> On decoupling and the law of Demeter.</p>' +
      '<ul><li>Talk only to your immediate friends.</li><li>Design for change: make it easy to replace.</li></ul>' +
      '<p>The traceability idea — orthogonality as a virtue of the codebase, not just the code.</p>',
  },
  {
    id: 'seed-journal-01',
    title: 'Morning Reflection — Collected calm',
    type: 'journal',
    folder: 'personal',
    tags: ['journal', 'health'],
    pinned: false,
    archived: false,
    createdAt: now - 3 * DAY,
    updatedAt: now - 3 * DAY,
    meta: {},
    flashcards: [],
    body:
      '<p>Woke up at 6:40 without an alarm. Coffee, then 20 minutes of reading before any screen.</p>' +
      '<p>The difference vs. last week: I am writing one sentence of gratitude before opening email. Small, but the momentum is real.</p>',
  },
  {
    id: 'seed-journal-02',
    title: 'Weekend recap — long walk, short sessions',
    type: 'journal',
    folder: 'personal',
    tags: ['journal'],
    pinned: false,
    archived: false,
    createdAt: now - 2 * DAY,
    updatedAt: now - DAY,
    meta: {},
    flashcards: [],
    body:
      '<p>Walked the riverside loop on Saturday — 9km, golden hour.</p><p>Two focused 45-minute study blocks on Sunday. Finished the materials section of the course.</p><p>Next weekend: protect Saturday morning for writing.</p>',
  },
  {
    id: 'seed-task-01',
    title: 'Q3 Launch Checklist',
    type: 'task',
    folder: 'work',
    tags: ['work', 'product'],
    pinned: true,
    archived: false,
    createdAt: now - 6 * DAY,
    updatedAt: now - 3 * HOUR,
    meta: {},
    flashcards: [],
    tasks: [
      { id: 't-01', text: 'Finalize copy for landing page', done: true },
      { id: 't-02', text: 'QA the onboarding flow', done: true },
      { id: 't-03', text: 'Draft changelog post', done: false },
      { id: 't-04', text: 'Schedule beta invites batch #2', done: false },
      { id: 't-05', text: 'Lock pricing page', done: false },
    ],
    body: '<p>Countdown: ship before the 30th.</p>',
  },
  {
    id: 'seed-task-02',
    title: 'Groceries & errands',
    type: 'task',
    folder: 'personal',
    tags: ['personal'],
    pinned: false,
    archived: false,
    createdAt: now - DAY,
    updatedAt: now - 22 * HOUR,
    meta: {},
    flashcards: [],
    tasks: [
      { id: 't-06', text: 'Oat milk, eggs, spinach, sourdough', done: false },
      { id: 't-07', text: 'Pick up prescription', done: true },
      { id: 't-08', text: 'Drop off library books', done: false },
    ],
    body: '',
  },
  {
    id: 'seed-standard-03',
    title: 'Product Sync — Sept 15 memos',
    type: 'standard',
    folder: 'work',
    tags: ['work', 'meeting', 'product'],
    pinned: false,
    archived: false,
    createdAt: now - 20 * HOUR,
    updatedAt: now - 8 * HOUR,
    meta: {},
    flashcards: [],
    body:
      '<p>Agreed: the global search should rank <strong>pinned notes first</strong>, then by recent edit.</p>' +
      '<p>Open question — flashcard back designs. Proposal: keep the front as the highlight quote, generate back from context.</p>',
  },
  {
    id: 'seed-standard-04',
    title: 'Reading List 2026',
    type: 'standard',
    folder: 'ideas',
    tags: ['reading'],
    pinned: false,
    archived: false,
    createdAt: now - 15 * DAY,
    updatedAt: now - 4 * DAY,
    meta: {},
    flashcards: [],
    body:
      '<ul><li>Building a Second Brain — Tiago Forte</li><li>Designing Data-Intensive Applications</li><li>Thinking in Systems — Donella Meadows</li><li>Show Your Work — Austin Kleon</li></ul>',
  },
]