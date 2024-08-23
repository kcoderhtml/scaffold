# Scaffold

This is the repo for Sk4ph (pronounced "scaffold"), a mobile app for managing your photos and screenshots (urls and notes are soon to come). It's built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev).

It's basicaly a second brain app based off [mymind](https://mymind.com/) but a fair bit worse 😭; at least its all open source and works offline! You can add links and images to the app and it will tag them and make them searchable with super fast offline search. You can see a demo of it on youtube [here](https://www.youtube.com/shorts/m5ASqlrYX_Q).

## Repo Structure

This repo is a monorepo with the following structure:
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
