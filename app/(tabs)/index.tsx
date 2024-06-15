import React, { useEffect } from "react";
import { Text, View, ScrollView, RefreshControl } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import Card from "../../components/card";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
	const [cardData, setCardData] = React.useState<
		{ uri: string; title: string; tags: string[] }[]
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
			const images = JSON.parse(allImages);
			images.splice(index, 1);
			await AsyncStorage.setItem("images", JSON.stringify(images));
			setCardData(images);
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
				<View className="flex-1 items-center">
					<Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
						Welcome to Scaffold 🚀
					</Text>

					<Text className="text-slate-900 dark:text-slate-50 p-4 italic">
						"Your Mind is a Garden, Your Thoughts are the Seeds. You can grow
						Flowers or weeds..." ― Osho
					</Text>

					{filter && (
						<View className="flex flex-row items-center justify-center bg-slate-500 dark:bg-slate-600 p-1.5 pl-3 pr-3 mb-3 rounded-full">
							<Text className="text-xl font-bold text-slate-900 dark:text-slate-50">
								Filtering by tag:{" "}
							</Text>
							<Text className="text-lg font-serif text-slate-900 dark:text-slate-50 italic">
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
