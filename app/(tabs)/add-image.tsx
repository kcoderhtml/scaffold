import { Pressable, Text, View } from "react-native";
import React from "react";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as SecureStore from "expo-secure-store";
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function fileToGenerativePart(path: string, mimeType: string) {
	const response = await fetch(path);
	const blob = await response.blob();
	const arrayBuffer = await blob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return {
		inlineData: {
			data: buffer.toString("base64"),
			mimeType,
		},
	};
}

export default function ImagePickerExample() {
	const [apiKey, setApiKey] = React.useState<string | null>(null); // State for API key

	React.useEffect(() => {
		const getApiKey = async () => {
			const retrievedKey = await SecureStore.getItemAsync("GEMINI_API_KEY");
			setApiKey(retrievedKey);
		};
		getApiKey();
	}, []);

	const pickImageAsync = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			quality: 1,
		});

		console.log("test");

		if (!result.canceled) {
			const allImages = await AsyncStorage.getItem("images");
			if (allImages) {
				const images = JSON.parse(allImages);

				if (!apiKey) {
					console.error("API key not available");
					return;
				}

				const genAI = new GoogleGenerativeAI(apiKey);
				const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

				const aiResult = await model.generateContent([
					"You are to analyze the content of this image and generate a short and conscise json object like the following {'title': 'bowl of penne', 'description': 'a red bowl of penne pasta with pesto'}",
					await fileToGenerativePart(
						result.assets[0].uri,
						result.assets[0].mimeType!
					),
				]);
				const response = await aiResult.response;
				const analysis = response.text();

				console.log(analysis);
				images.push({
					uri: result.assets[0].uri,
					title: "New Image",
					description: "New Image Description",
				});
				await AsyncStorage.setItem("images", JSON.stringify(images));
			} else {
				await AsyncStorage.setItem(
					"images",
					JSON.stringify([
						{
							uri: result.assets[0].uri,
							title: "New Image",
							description: "New Image Description",
						},
					])
				);
			}
			console.log(result);
		} else {
			alert("You did not select any image.");
		}
	};

	const clearImages = async () => {
		await AsyncStorage.removeItem("images");
		alert("All images have been removed.");
	};

	return (
		<View className="flex-1 items-center bg-slate-50 dark:bg-slate-700">
			<Text className="text-xl text-center font-bold m-16 text-slate-900 dark:text-slate-50">
				Select an Image to add to your collection! 📸
			</Text>

			<Pressable
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
				onPress={pickImageAsync}
			>
				<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
					Select an Image
				</Text>
			</Pressable>

			<Pressable
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
				onPress={clearImages}
			>
				<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
					Clear All Images
				</Text>
			</Pressable>
		</View>
	);
}
