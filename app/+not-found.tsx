import { Link, Stack } from "expo-router";

import React from "react";
import { Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "react-native";
import colors from "tailwindcss/colors";

export default function NotFoundScreen() {
	const colorScheme = useColorScheme();

	const backgroundColor =
		colorScheme === "dark" ? colors.gray[800] : colors.gray[100];
	const headerTextColor =
		colorScheme === "dark" ? colors.slate[200] : colors.slate[900];

	return (
		<SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700">
			<Stack.Screen
				options={{
					title: "Oops!",
					headerStyle: {
						backgroundColor: backgroundColor,
					},
					headerTitleStyle: { color: headerTextColor },
					headerBackTitle: "Back",
				}}
			/>

			<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
				This page doesn't exist.
			</Text>

			<Link href="/" asChild>
				<Pressable className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg">
					<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
						Go to back home!
					</Text>
				</Pressable>
			</Link>
		</SafeAreaView>
	);
}
