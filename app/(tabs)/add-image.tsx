import { Pressable, Text } from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as SecureStore from "expo-secure-store";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JSHash, CONSTANTS } from "react-native-hash";

import * as ExpoFileSystem from "expo-file-system";

async function fileToGenerativePart(path: string, mimeType: string) {
	try {
		const base64image = await ExpoFileSystem.readAsStringAsync(path, {
			encoding: ExpoFileSystem.EncodingType.Base64,
		});
		return {
			inlineData: {
				data: base64image,
				mimeType,
			},
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function describeImage(model: any, asset: any) {
	const aiResult = await model.generateContent([
		'You are to analyze the content of this image and generate a short and conscise json object like the following {"title": "bowl of penne", "description": "a red bowl of penne pasta with pesto"}',
		await fileToGenerativePart(asset.uri, asset.mimeType!),
	]);
	const response = await aiResult.response;
	const analysis = response.text();

	const analysisObject = JSON.parse(analysis);

	return analysisObject;
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

		if (!result.canceled) {
			const allImages = await AsyncStorage.getItem("images");

			const genAI = new GoogleGenerativeAI(apiKey!);
			const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

			const images = JSON.parse(allImages || "[]");
			const id = await JSHash(
				result.assets[0].uri,
				CONSTANTS.HashAlgorithms.sha256
			);

			images.push({
				id,
				uri: result.assets[0].uri,
				title: "",
				description: "",
			});

			await AsyncStorage.setItem("images", JSON.stringify(images));

			try {
				if (!apiKey) {
					throw new Error("No API key found.");
				}

				console.log("Image analysis started: ", id);

				setTimeout(async () => {
					const analysisObject = await describeImage(model, result.assets[0]);

					const allImages = await AsyncStorage.getItem("images");
					const images: {
						id: string;
						uri: string;
						title: string;
						description: string;
					}[] = JSON.parse(allImages!);

					const newImages = images.map((image) => {
						if (image.id === id) {
							return {
								...image,
								title: analysisObject.title,
								description: analysisObject.description,
							};
						} else {
							return image;
						}
					});

					await AsyncStorage.setItem("images", JSON.stringify(newImages));
					console.log("Image analysis complete: ", analysisObject.title);
				}, 0);
			} catch (e) {
				console.error(e);
			}
		} else {
			alert("You did not select any image.");
		}
	};

	const clearImages = async () => {
		await AsyncStorage.removeItem("images");
		alert("All images have been removed.");
	};

	return (
		<SafeAreaView className="flex-1 items-center bg-slate-50 dark:bg-slate-700">
			<Text className="text-xl text-center font-bold text-slate-900 dark:text-slate-50">
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
		</SafeAreaView>
	);
}
