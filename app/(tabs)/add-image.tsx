import { Pressable, Text, View } from "react-native";
import React from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

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
		'You are to analyze the content of this image and generate a short and conscise json object like the following with no more than 5 tags {"title": "bowl of penne", "tags": ["red", "bowl", "penne", "pasta", "food"]}.',
		await fileToGenerativePart(asset.uri, asset.mimeType!),
	]);
	const response = await aiResult.response;
	const analysis = response.text();

	const analysisObject = JSON.parse(analysis);

	return analysisObject;
}

export default function ImagePickerPage() {
	const [apiKey, setApiKey] = React.useState<string | null>(null); // State for API key
	const [message, setMessage] = React.useState<{
		message: string;
		ok: boolean;
	} | null>(null); // State for message

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
				tags: [],
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
						tags: string[];
					}[] = JSON.parse(allImages!);

					const newImages = images.map((image) => {
						if (image.id === id) {
							return {
								...image,
								title: analysisObject.title,
								tags: analysisObject.tags,
							};
						} else {
							return image;
						}
					});

					await AsyncStorage.setItem("images", JSON.stringify(newImages));
					console.log("Image analysis complete: ", analysisObject.title);
				}, 0);

				setMessage({ message: "Image added successfully!", ok: true });
			} catch (e) {
				if (e instanceof Error) {
					console.error(e);
					setMessage({ message: e.message, ok: false });
				}
			}
		} else {
			setMessage({ message: "Image selection cancelled.", ok: false });
		}
	};

	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 items-center bg-slate-50 dark:bg-slate-700 justify-center">
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

			{message && (
				<Text
					className={`text-xl text-center font-bold mt-8 ${
						message.ok ? "text-green-500" : "text-red-500"
					}`}
				>
					{message.message}
				</Text>
			)}
		</View>
	);
}
