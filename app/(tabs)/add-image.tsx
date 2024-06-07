import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ImagePickerExample() {
	const pickImageAsync = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			quality: 1,
		});

		if (!result.canceled) {
			const allImages = await AsyncStorage.getItem("images");
			if (allImages) {
				const images = JSON.parse(allImages);
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
			<Stack.Screen options={{ title: "Settings" }} />

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
