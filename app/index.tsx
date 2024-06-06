import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-500"
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <StatusBar style="auto" />
    </View>
  );
}
