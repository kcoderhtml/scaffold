import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Home() {
	return (
		<View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700">
			<Stack.Screen options={{ title: "Home" }} />

			<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
				Welcome to Scaffold 🚀
			</Text>
		</View>
	);
}
