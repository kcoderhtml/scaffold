import { Link, Stack } from "expo-router";

import React from "react";
import { Text, View, Pressable } from "react-native";

export default function NotFoundScreen() {
	return (
		<View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700">
			<Stack.Screen options={{ title: "Oops!" }} />

			<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
				This screen doesn't exist.
			</Text>

			<Link href="/" asChild>
				<Pressable className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg">
					<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
						Go to back home!
					</Text>
				</Pressable>
			</Link>
		</View>
	);
}
