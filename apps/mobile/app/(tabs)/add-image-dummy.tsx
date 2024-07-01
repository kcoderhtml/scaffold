import { Text, View } from "react-native";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function ImagePickerDummyPage() {
	const insets = useSafeAreaInsets();

	useEffect(() => {
		router.push("/");
	}, []);

	return (
		<View
			className="flex-1 items-center bg-slate-50 dark:bg-slate-700 justify-center"
			style={{ paddingTop: insets.top }}
		>
			<Text className="text-xl text-center font-bold text-slate-900 dark:text-slate-50">
				Redirecting you back to the home page immediately!
			</Text>
		</View>
	);
}
