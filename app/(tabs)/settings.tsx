import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Settings() {
	return (
		<View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700">
			<Stack.Screen options={{ title: "Settings" }} />

			<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
				Welcome to the Settings Menu!
			</Text>
		</View>
	);
}
