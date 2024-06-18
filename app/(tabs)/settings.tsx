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
		const allImages = await AsyncStorage.getItem("images");
		if (allImages) {
			const parsedImages: [
				{
					title: string;
					tags: string[];
					uri: string;
					needsSyncing?: boolean;
					cloudID: string;
				}
			] = JSON.parse(allImages);

			try {
				const toRemoveFromCloud = parsedImages.filter((image) => image.cloudID);

				if (toRemoveFromCloud.length > 0) {
					const cloudToken = await SecureStore.getItemAsync("CLOUD_TOKEN");
					const cloudUrl = new URL(
						(await SecureStore.getItemAsync("CLOUD_URL")) as string
					);

					if (!cloudToken || !cloudUrl) {
						alert("Cloud token or url not found");
						return;
					}

					const promises = toRemoveFromCloud.map(async (image) => {
						try {
							const response = await fetch(cloudUrl.origin + "/remove", {
								method: "POST",
								headers: {
									Authorization: cloudToken,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									id: image.cloudID,
								}),
							});

							const responseJson = await response.json();

							if (!response.ok || responseJson.error !== undefined) {
								throw new Error(
									"Failed to remove image from cloud: ",
									responseJson.error
								);
							}
						} catch (e) {
							if (e instanceof Error) {
								if (e.message === "Failed to remove image from cloud") {
									alert("Failed to remove image from cloud");
								}
							}
						}
					});

					setTimeout(async () => {
						await Promise.all(promises);
						await AsyncStorage.removeItem("images");

						setMessage({
							message: "Cleared all images!",
							ok: true,
						});
					}, 0);
				}
			} catch (e) {
				if (e instanceof Error) {
					if (e.message === "Failed to remove image from cloud") {
						alert("Failed to remove image from cloud");
						return;
					}
				}
			}

			await setMessage({
				message: "Clearing Images...",
				ok: true,
			});
		}
	}

	async function uploadImages() {
		const images = await AsyncStorage.getItem("images");
		if (images) {
			const parsedImages:
				| [
						{
							title: string;
							tags: string[];
							uri: string;
							needsSyncing?: boolean;
							cloudID?: string;
							id: string;
						}
				  ]
				| [] = JSON.parse(images);
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

			const imagesToUpload = parsedImages.filter(
				(image) =>
					JSON.stringify(image.tags) !== JSON.stringify(["needs tagging"]) &&
					image.needsSyncing === undefined &&
					image.cloudID === undefined
			);

			if (!parsedImages || imagesToUpload.length === 0) {
				console.log("No images to upload");
				setMessage({
					message: "No images to upload",
					ok: false,
				});
				return;
			}

			const promises = imagesToUpload.map(async (image: any) => {
				try {
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

					const responseJson = await response.json();

					if (!response.ok || responseJson.error !== undefined) {
						throw new Error("Failed to upload image");
					}

					return {
						...image,
						needsSyncing: false,
						cloudID: responseJson.cloudID,
					};
				} catch (e) {
					if (e instanceof Error) {
						console.error(e);
						setMessage({
							message: e.message,
							ok: false,
						});
					}
				}
			});

			setTimeout(async () => {
				const newImages = await Promise.all(promises);

				console.log("Images uploaded: ", newImages);

				const storedImages = await AsyncStorage.getItem("images");
				if (storedImages) {
					let parsedStoredImages: [
						{
							title: string;
							tags: string[];
							uri: string;
							needsSyncing?: boolean;
							cloudID?: string;
							id: string;
						}
					] = JSON.parse(storedImages);

					// filter out the images with the same id
					const oldImages = parsedStoredImages.filter((storedImage) => {
						return !newImages.some(
							(newImage) => newImage.id === storedImage.id
						);
					});

					newImages.push(...oldImages);
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

	async function checkCloudRemoteVersion(remote: string) {
		const currentVersion = "0.2.0";
		try {
			const remoteURL = new URL(remote);

			const response = await fetch(remoteURL.origin + "/version");
			const responseJson = await response.json();

			if (
				!response.ok ||
				responseJson.error !== undefined ||
				!responseJson.version
			) {
				throw new Error("Failed to get remote version");
			}

			if (responseJson.version === currentVersion) {
				return { valid: true };
			} else {
				throw new Error(
					"Invalid remote version " +
						responseJson.version +
						" expected " +
						currentVersion
				);
			}
		} catch (e) {
			if (e instanceof Error) {
				return { valid: false, message: e.message };
			}
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
				onSubmitEditing={async (event) => {
					const text = event.nativeEvent.text;
					const valid = await checkCloudRemoteVersion(text);
					if (valid?.valid) {
						save("CLOUD_URL", text);
					} else {
						alert(valid?.message || "Invalid remote version");
					}
				}}
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
