# Scaffold

This is the repo for Sk4ph (pronounced "scaffold"), a mobile app for managing your photos and screenshots (urls and notes are soon to come). It's built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev).

## Repo Structure

This repo is a monorepo with the following structure:
- `apps/server`: The backend server for the app, built with [Elysia](https://elysiajs.com/), [Orama](https://github.com/askorama/orama), and [Bun](https://bun.sh/).
- `apps/mobile`: The mobile app, built with Expo and React Native.
- `docs`: Documentation for the project. (coming soon)

## Getting Started

To get started, clone the repo and run the following commands:

```bash
cd apps/mobile
bun install
bunx expo start --clear
```

This will start the Expo development server and you can use the Expo Go app to view the app on your phone.

for the server, run the following commands:

```bash
cd apps/server
bun install
bun dev
```

This will start the server and you can edit in real-time with hot reloading.