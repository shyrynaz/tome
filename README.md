# Tome — AI-Native Daily Planner

Tome is a premium, privacy-first daily planner that helps you turn messy thoughts, tasks, and ideas into structured, achievable daily plans using a hybrid AI strategy.

Built with **React Native (Expo)**, **Convex**, and **Clerk**, Tome features a world-class UI inspired by Linear and Raycast, designed for speed and clarity.

## 🚀 Key Features

- **Brain Dump**: A high-speed capture interface with real-time on-device NLP (Natural Language Processing) that categorizes your thoughts into Tasks, Events, or Notes as you type.
- **AI Strategist**: A cloud-powered (GPT-4o) planning assistant that analyzes your captured ideas and suggests a structured focus for your day.
- **The Tome**: A searchable, AI-summarized archive of your collective intelligence.
- **Hybrid AI Architecture**: Uses **LiteRT** (on-device) for instant, private parsing and **Convex Actions** (cloud) for high-level reasoning.
- **World-Class UI**: Hyper-refined dark mode, **Outfit** typography, and physics-based animations via **React Native Reanimated**.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Backend/DB**: [Convex](https://convex.dev/) (Real-time, Serverless)
- **Authentication**: [Clerk](https://clerk.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) via [Uniwind](https://uniwind.dev/)
- **On-Device NLP**: [Compromise](https://compromise.cool/) & [LiteRT](https://www.tensorflow.org/lite/rt)
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

To see the full "AI-Native" experience (including secure auth and native AI), you should create a Development Build:
```bash
npx expo run:ios # or android
```

## 🧠 AI Strategy

Tome uses a tiered approach to intelligence:
1. **Tier 1 (Instant)**: Rule-based NLP via `compromise` for real-time UI updates.
2. **Tier 2 (Private)**: On-device neural networks via `LiteRT` for intent classification.
3. **Tier 3 (Cloud)**: Large Language Models for strategic planning and summarization.

---
Designed with ❤️ for personal productivity.
