import React, { useEffect } from "react";
import {
	Text,
	View,
	ScrollView,
	RefreshControl,
	TextInput,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Card from "../../components/card";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export default function Home() {
	const [cardData, setCardData] = React.useState<
		{ uri: string; title: string; tags: string[]; needsSyncing?: boolean }[]
	>([]); // State for card data
	const [refreshing, setRefreshing] = React.useState(false); // State for refresh indicator
	const [filter, setFilter] = React.useState<string | null>(null); // State for filter

	useEffect(() => {
		const fetchData = async () => {
			const allImages = await AsyncStorage.getItem("images");
			if (allImages) {
				const images = JSON.parse(allImages);
				setCardData(images); // Update state with fetched data
			}
		};

		fetchData();
	}, []);

	const fetchData = async () => {
		setRefreshing(true); // Show refresh indicator

		const allImages = await AsyncStorage.getItem("images");
		if (allImages) {
			const images = JSON.parse(allImages);
			setCardData(images);
			setRefreshing(false); // Hide refresh indicator
		} else {
			setRefreshing(false); // Hide refresh indicator
		}
	};

	const removeItem = async (index: number) => {
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
				if (parsedImages[index].cloudID) {
					const cloudToken = await SecureStore.getItemAsync("CLOUD_TOKEN");
					const cloudUrl = new URL(
						(await SecureStore.getItemAsync("CLOUD_URL")) as string
					);

					if (!cloudToken || !cloudUrl) {
						alert("Cloud token or url not found");
						return;
					}

					const response = await fetch(cloudUrl.origin + "/remove", {
						method: "POST",
						headers: {
							Authorization: cloudToken,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							id: parsedImages[index].cloudID,
						}),
					});

					const responseJson = await response.json();

					if (!response.ok || responseJson.error !== undefined) {
						throw new Error("Failed to remove image from cloud");
					}
				}
				parsedImages.splice(index, 1);
				await AsyncStorage.setItem("images", JSON.stringify(parsedImages));
				setFilter(null);
				setCardData(parsedImages);
			} catch (e) {
				if (e instanceof Error) {
					if (e.message === "Failed to remove image from cloud") {
						alert("Failed to remove image from cloud");
						parsedImages.splice(index, 1);
						await AsyncStorage.setItem("images", JSON.stringify(parsedImages));
						setFilter(null);
						setCardData(parsedImages);
					}
				}
			}
		}
	};

	const filterbyTag = async (tag: string) => {
		const allImages = await AsyncStorage.getItem("images");
		const cardData = JSON.parse(allImages || "[]");

		const filteredData = cardData.filter((data: any) =>
			data.tags.includes(tag)
		);
		setCardData(filteredData);
		setFilter(tag);
	};

	const search = async (query: string) => {
		const cloudToken = await SecureStore.getItemAsync("CLOUD_TOKEN");
		const cloudUrl = await SecureStore.getItemAsync("CLOUD_URL");

		if (!cloudToken || !cloudUrl) {
			alert("Cloud token or url not found");
			return;
		}

		if (!query) {
			fetchData();
			return;
		}

		setTimeout(async () => {
			const response = await fetch(new URL(cloudUrl).origin + "/query", {
				method: "POST",
				headers: {
					Authorization: cloudToken,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const data = await response.json();
			console.log(data);

			if (data.error || data.length === 0) {
				alert("No images found with the tag: " + query);
				// refresh data
				fetchData();
				return;
			}

			setCardData(data);
		}, 0);
	};

	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 bg-slate-50 dark:bg-slate-700"
			style={{ paddingTop: insets.top }}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				overScrollMode="never"
				refreshControl={
					<RefreshControl
						refreshing={refreshing} // Show refresh indicator while fetching
						onRefresh={() => {
							setFilter(null);
							fetchData();
						}} // Function to call on pull down
					/>
				}
			>
				<View className="flex-1 items-center justify-center">
					<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
						Welcome to Scaffold 🚀
					</Text>

					<Text className="text-slate-900 dark:text-slate-50 p-4 italic">
						"Your Mind is a Garden, Your Thoughts are the Seeds. You can grow
						Flowers or weeds..." ― Osho
					</Text>

					<View className="flex flex-row items-center justify-center bg-slate-500 dark:bg-slate-600 p-1.5 pl-3 pr-3 mb-3 rounded-full">
						<Text className="text-xl font-bold text-slate-900 dark:text-slate-50">
							Search for an image:{" "}
						</Text>
						<TextInput
							className="text-sm font-serif text-slate-900 dark:text-slate-50 italic bg-slate-400 dark:bg-slate-500 pl-2 pr-2 rounded-lg h-full"
							placeholder="red shoes"
							onSubmitEditing={async (event) =>
								await search(event.nativeEvent.text)
							}
						/>
					</View>

					{filter && (
						<View className="flex flex-row items-center justify-center bg-slate-500 dark:bg-slate-600 p-0.5 pl-3 pr-3 mb-3 rounded-full">
							<Text className="text-base font-bold text-slate-900 dark:text-slate-200">
								Filtering by tag:{" "}
							</Text>
							<Text className="text-sm font-serif text-slate-900 dark:text-slate-200 italic">
								{filter}
							</Text>
						</View>
					)}

					<View className="flex flex-wrap">
						{cardData.map((data, index) => (
							<Card
								key={index}
								image={data.uri}
								title={data.title}
								tags={data.tags}
								needsSyncing={data.needsSyncing}
								onPress={() => removeItem(index)}
								onTagPress={(tag) => filterbyTag(tag)}
							/>
						))}
					</View>
					<View className="flex-1 items-center justify-center">
						{cardData.length === 0 && (
							<Text className="text-xl text-slate-500 dark:text-slate-300 p-4">
								No images were found
							</Text>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
