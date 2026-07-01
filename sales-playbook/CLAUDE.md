@AGENTS.md

## Product Context

Read `PRODUCT.md` before making any changes. It documents:
- What this tool is and the core problem it solves
- The three modes (Guided Call, Log a Call, Resources & Prep)
- The 20-minute first call framework and six use cases
- How admin content management and Firestore work
- The full tech stack and key file locations

## Key Rules

- **Firestore guard**: always wrap Firestore calls with the `firestoreConfigured` check (`!!(NEXT_PUBLIC_FIREBASE_PROJECT_ID && NEXT_PUBLIC_FIREBASE_API_KEY)`) from `src/lib/firestore.ts` before subscribing or reading.
- **Dual-write**: admin saves go to both `data/playbook.json` (via `/api/playbook` PUT) and Firestore simultaneously. Never write to one without the other.
- **Live sync**: playbook content in the UI subscribes to `playbook/current` in Firestore via `subscribeToPlaybook()`. Static page props come from `playbook.json` as the baseline.
- **Use cases**: the six use cases are defined as `USE_CASES` in `src/types/index.ts`. Don't hardcode use case strings elsewhere.
- **Resources page**: content comes from `useCaseQuestions`, `pitchCards`, and `resourceLinks` arrays on the `Playbook` type. Default content lives in `data/playbook.json`. Admin edits to `resourceLinks` go through `ResourceLibraryEditor` in the admin panel.
