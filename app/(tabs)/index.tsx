import { Stack } from "expo-router";
import React from "react";
import { Text, View, ScrollView } from "react-native";

import Card from "../../components/card";

export default function Home() {
	return (
		<View className="bg-slate-50 dark:bg-slate-700">
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				overScrollMode="never"
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
						<Card
							title="test card"
							description="a description that is rather small"
						></Card>
						<Card
							title="test card with image"
							description="a description that is rather small"
							image="https://source.unsplash.com/random/800x600"
						></Card>
						<Card
							title="test card with no image"
							description="a bountifully long description that excedes the length of the previous cards"
						></Card>
						<Card
							title="test card with image and description"
							description="a description that is rather small"
							image="https://source.unsplash.com/random/800x600"
						></Card>

						<Card
							title="another test card"
							description="a description; kinda long"
						></Card>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
