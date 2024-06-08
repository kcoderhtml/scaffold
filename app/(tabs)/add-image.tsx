import { Pressable, Text, View } from "react-native";
import React from "react";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as tf from "@tensorflow/tfjs";
import { fetch, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as mobilenet from "@tensorflow-models/mobilenet";

async function describeImage(asset: any) {
	const image = await fetch(asset.uri, {}, { isBinary: true });

	await tf.ready();
	const model = await mobilenet.load();

	const imageDataArrayBuffer = await image.arrayBuffer();
	const imageData = new Uint8Array(imageDataArrayBuffer);
	const imageTensor = decodeJpeg(imageData);
	const prediction = await model.classify(imageTensor);

	const analysis = JSON.stringify(prediction[0]);

	console.log(analysis);

	const analysisObject = JSON.parse(analysis);

	return analysisObject;
}

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

				try {
					const analysisObject = await describeImage(result.assets[0]);

					images.push({
						uri: result.assets[0].uri,
						title: analysisObject.title,
						description: analysisObject.description,
					});
				} catch (e) {
					console.error(e);
					images.push({
						uri: result.assets[0].uri,
						title: "",
						description: "",
					});
				}

				await AsyncStorage.setItem("images", JSON.stringify(images));
			} else {
				try {
					const analysisObject = await describeImage(result.assets[0]);

					await AsyncStorage.setItem(
						"images",
						JSON.stringify([
							{
								uri: result.assets[0].uri,
								title: analysisObject.title,
								description: analysisObject.description,
							},
						])
					);
				} catch (e) {
					console.error(e);
					await AsyncStorage.setItem(
						"images",
						JSON.stringify([
							{
								uri: result.assets[0].uri,
								title: "",
								description: "",
							},
						])
					);
				}
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
