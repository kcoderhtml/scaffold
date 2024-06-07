import React from "react";
import { Text, View, TextInput, Pressable } from "react-native";

import * as SecureStore from "expo-secure-store";

async function save(key: string, value: string) {
	await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key: string) {
	let result = await SecureStore.getItemAsync(key);
	if (result) {
		alert("🔐 Here's your value 🔐 \n" + result);
	} else {
		alert("No values stored under that key.");
	}
}

export default function Settings() {
	return (
		<View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700">
			<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
				Welcome to the Settings Menu!
			</Text>

			<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
				🔐 Enter your Gemini API key 🔐
			</Text>
			<TextInput
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg text-slate-900 dark:text-slate-200 w-9/12"
				placeholder="Enter your Gemini API key"
				onSubmitEditing={(event) =>
					save("GEMINI_API_KEY", event.nativeEvent.text)
				}
				secureTextEntry={true}
			/>

			<Pressable
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
				onPress={() => getValueFor("GEMINI_API_KEY")}
			>
				<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
					Check Gemini API Key
				</Text>
			</Pressable>
		</View>
	);
}
