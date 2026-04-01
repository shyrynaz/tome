# Tome — Personal Knowledge Engine

Tome is a fast, privacy-first mobile app for capturing thoughts, saving bookmarks, and building a searchable archive of everything you know. Capture instantly, organize effortlessly, and surface insights when you need them.

Built with **React Native (Expo)**, **Convex**, and **Clerk**, Tome features a Linear-inspired dark UI with green accents, designed for speed and clarity.

## 🚀 Key Features

- **Quick Capture**: Text or links in seconds. No categories, no friction. Just type and save.
- **Smart Archive**: Every entry is auto-tagged by on-device AI. Search semantically across everything you've captured.
- **Bookmarks**: Share links from any app. Tome fetches previews and generates AI summaries automatically.
- **Folders**: Organize entries your way. Light auto-tagging by AI, manual structure when you want it.
- **Reminders**: AI detects time-sensitive entries and suggests reminders. You can also set them manually.
- **On-Device AI**: Tagging, search, and reminder detection run locally via Apple Intelligence / Llama. Private, instant, offline-ready.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Backend/DB**: [Convex](https://convex.dev/) (Real-time, Serverless)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) via [Uniwind](https://uniwind.dev/)
- **On-Device AI**: [react-native-ai](https://www.react-native-ai.dev/) (Apple Intelligence + Llama Engine)
- **Cloud AI**: OpenAI (via Convex Actions for URL summarization)
- **Icons**: [Lucide React Native](https://lucide.dev/)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 📦 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js
- [Expo Go](https://expo.dev/go) (for limited preview) or [EAS CLI](https://docs.expo.dev/build/introduction/) (for full native features)

### 1. Setup Environment

Create a `.env.local` file:

```env
EXPO_PUBLIC_CONVEX_URL=your_convex_url
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Initialize Convex

```bash
npx convex dev
```

### 4. Run the App

```bash
bun dev
```

To see the full experience (including secure auth and native AI), create a Development Build:

```bash
npx expo run:ios # or android
```

## 🧠 AI Strategy

Tome uses a hybrid approach:

1. **On-device first**: Apple Intelligence (iOS) or Llama Engine (Android) handles auto-tagging, semantic search, and reminder detection. Private, instant, offline.
2. **Cloud fallback**: OpenAI via Convex Actions for URL summarization and heavy reasoning when needed.

---

Designed with ❤️ for personal productivity.
