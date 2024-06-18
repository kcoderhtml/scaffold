import React from "react";
import { Text, TextInput, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
	const [message, setMessage] = React.useState<{
		message: string;
		ok: boolean;
	} | null>(null); // State for message

	async function save(key: string, value: string) {
		if (!value || value === "") {
			setMessage({
				message: "Value cannot be empty",
				ok: false,
			});
			return;
		}
		await SecureStore.setItemAsync(key, value);
		setMessage({
			message: "Value stored successfully!",
			ok: true,
		});
	}

	async function getAllValues(keys: string[]) {
		const values = await Promise.all(
			keys.map(async (key) => {
				const value = await SecureStore.getItemAsync(key);
				return { key, value };
			})
		);

		const alertText = values
			.map((value) => `${value.key}: ${value.value}`)
			.join("\n");

		alert(alertText);
	}

	async function clearImages() {
		await AsyncStorage.removeItem("images");
		setMessage({
			message: "Cleared all images!",
			ok: true,
		});
	}

	async function uploadImages() {
		const images = await AsyncStorage.getItem("images");
		if (images) {
			const parsedImages: [
				{ title: string; tags: string[]; uri: string; needsSyncing?: boolean }
			] = JSON.parse(images);
			const cloudToken = await SecureStore.getItemAsync("CLOUD_TOKEN");
			const cloudUrl = new URL(
				(await SecureStore.getItemAsync("CLOUD_URL")) as string
			);

			if (!cloudToken || !cloudUrl) {
				setMessage({
					message: "Cloud token or url not found",
					ok: false,
				});
				return;
			}

			setMessage({
				message: "Uploading images to the cloud...",
				ok: true,
			});

			const promises = parsedImages
				.filter((image) => image.needsSyncing === undefined)
				.map(async (image: any) => {
					const response = await fetch(cloudUrl.origin + "/insert", {
						method: "POST",
						headers: {
							Authorization: cloudToken,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							uri: image.uri,
							title: image.title,
							tags: image.tags,
						}),
					});

					if (!response.ok) {
						throw new Error("Failed to upload image");
					}

					console.log(await response.json());
				});

			setTimeout(async () => {
				await Promise.all(promises);

				const newImages = parsedImages.map((image) => {
					if (image.needsSyncing === undefined) {
						return {
							...image,
							needsSyncing: false,
						};
					}
					return image;
				});

				const storedImages = await AsyncStorage.getItem("images");
				if (storedImages) {
					const parsedStoredImages: [
						{
							title: string;
							tags: string[];
							uri: string;
							needsSyncing?: boolean;
						}
					] = JSON.parse(storedImages);
					const newAddedImages = parsedStoredImages.filter((storedImage) => {
						return !parsedImages.some((image) => image.uri === storedImage.uri);
					});
					newImages.push(...newAddedImages);
				}

				await AsyncStorage.setItem("images", JSON.stringify(newImages));

				setMessage({
					message: "Uploaded all images to the cloud!",
					ok: true,
				});
			}, 0);
		} else {
			setMessage({
				message: "No images to upload",
				ok: false,
			});
		}
	}

	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700"
			style={{ paddingTop: insets.top }}
		>
			<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
				Welcome to the Settings Menu!
			</Text>

			<Text className="text-xl font-bold text-slate-900 dark:text-slate-200 mt-8">
				🔐 API keys 🔐
			</Text>
			<TextInput
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg text-slate-900 dark:text-slate-200 w-9/12"
				placeholder="Enter your Gemini API key"
				onSubmitEditing={(event) =>
					save("GEMINI_API_KEY", event.nativeEvent.text)
				}
				secureTextEntry={true}
			/>

			<TextInput
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg text-slate-900 dark:text-slate-200 w-9/12"
				placeholder="Enter your Cloud token"
				onSubmitEditing={(event) => save("CLOUD_TOKEN", event.nativeEvent.text)}
				secureTextEntry={true}
			/>

			<TextInput
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg text-slate-900 dark:text-slate-200 w-9/12"
				placeholder="Enter your Cloud url"
				onSubmitEditing={(event) => save("CLOUD_URL", event.nativeEvent.text)}
				secureTextEntry={false}
			/>

			<Pressable
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
				onPress={() =>
					getAllValues(["GEMINI_API_KEY", "CLOUD_TOKEN", "CLOUD_URL"])
				}
			>
				<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
					Check Secure Storage
				</Text>
			</Pressable>

			<Text className="text-xl font-bold text-slate-900 dark:text-slate-200 mt-16">
				⚠️ Danger Zone ⚠️
			</Text>

			<Pressable
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
				onPress={clearImages}
			>
				<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
					Clear All Images
				</Text>
			</Pressable>

			<Pressable
				className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
				onPress={() => uploadImages()}
			>
				<Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
					Upload all images to the cloud
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
