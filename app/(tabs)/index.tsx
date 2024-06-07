import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Text, View, ScrollView, RefreshControl } from "react-native";

import Card from "../../components/card";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
	const [cardData, setCardData] = React.useState([]); // State for card data

	useEffect(() => {
		const fetchData = async () => {
			const allImages = await AsyncStorage.getItem("images");
			if (allImages) {
				const images = JSON.parse(allImages);
				setCardData(images); // Update state with fetched data
			} else {
				alert("You have no images saved.");
			}
		};

		fetchData();
	}, []);

	const fetchData = async () => {
		setCardData([]); // Set empty array to show refresh indicator

		const allImages = await AsyncStorage.getItem("images");
		if (allImages) {
			const images = JSON.parse(allImages);
			setCardData(images);
		} else {
			alert("You have no images saved.");
		}
	};

	return (
		<View className="flex-1 bg-slate-50 dark:bg-slate-700">
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				overScrollMode="never"
				refreshControl={
					<RefreshControl
						refreshing={cardData.length === 0} // Show refresh indicator while fetching
						onRefresh={fetchData} // Function to call on pull down
					/>
				}
			>
				<View className="flex-1 items-center">
					<Stack.Screen options={{ title: "Home" }} />

					<Text className="text-2xl font-bold mt-12 text-slate-900 dark:text-slate-50">
						Welcome to Scaffold 🚀
					</Text>

					<Text className="text-slate-900 dark:text-slate-50 p-4">
						Your mind is a garden, your thoughts are the seeds; you can grow
						flowers, or you can grow weeds.
					</Text>

					<View className="flex flex-wrap">
						{cardData.map((image, index) => (
							<Card
								key={index}
								image={image}
								title="Image"
								description="A beautiful image."
							/>
						))}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
