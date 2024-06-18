import React, { useRef, useState } from "react";
import { Text, View, Image, Pressable, Animated } from "react-native";

import { AntDesign } from "@expo/vector-icons";

import * as Haptics from "expo-haptics";

interface CardProps {
	image?: string;
	title: string;
	description?: string;
	tags?: string[];
	needsSyncing?: boolean;
	onPress?: () => void;
	onTagPress?: (tag: string) => void;
}

const Card: React.FC<CardProps> = ({
	image,
	title,
	description,
	tags,
	needsSyncing,
	onPress,
	onTagPress,
}) => {
	const scale = useRef(new Animated.Value(1)).current;
	const [critPressed, setCritPressed] = useState(false);
	const pressStart = useRef(0);
	const holdDuration = 0.18;

	return (
		<Pressable
			className="bg-slate-300 dark:bg-slate-600 rounded-lg shadow-md m-1"
			onPressIn={() => {
				pressStart.current = Date.now();

				// animate to smaller size
				Animated.timing(scale, {
					toValue: 0.975,
					duration: holdDuration * 1000,
					useNativeDriver: true,
				}).start(({ finished }) => {
					// if the press was held for the duration and animation completed, set critPressed to true
					if (finished) {
						setCritPressed(true);
						Haptics.selectionAsync();
					}
				});
			}}
			onPressOut={() => {
				// check if the press was a long press
				if (Date.now() - pressStart.current < holdDuration * 1000) {
					// if not, animate back to normal
					Animated.timing(scale, {
						toValue: 1,
						duration: holdDuration * 300,
						useNativeDriver: true,
					}).start();
				} else {
					// if it was, run the onPress function after animating to smaller size
					Animated.timing(scale, {
						toValue: 0.98,
						duration: holdDuration * 300,
						useNativeDriver: true,
					}).start(async ({ finished }) => {
						// run onPress function after animation
						if (finished && onPress) {
							await onPress();
							Haptics.notificationAsync(
								Haptics.NotificationFeedbackType.Success
							);
							scale.setValue(1);
							setCritPressed(false);
						}
					});
				}
			}}
		>
			<Animated.View
				className="bg-slate-300 dark:bg-slate-600 rounded-lg shadow-md m-1"
				style={{
					transform: [{ scale }],
					borderWidth: critPressed ? 2 : 0,
					borderColor: critPressed ? "red" : "transparent",
				}}
			>
				{image && (
					<Image
						source={{ uri: image }}
						className="w-56 h-56 object-cover rounded-t"
					/>
				)}
				<View className="w-56">
					{title !== "" && (
						<Text className="text-xl font-bold text-slate-900 dark:text-slate-50 p-2 text-center">
							{title}
						</Text>
					)}
					{description && description !== "" && (
						<Text className="text-slate-900 dark:text-slate-50 pl-2 pr-2 pb-2 text-center">
							{description}
						</Text>
					)}
					{tags && tags.length > 0 && (
						<View className="flex flex-row flex-wrap justify-center">
							{tags.map((tag, index) => (
								<Pressable
									onPress={() => {
										if (onTagPress) {
											onTagPress(tag);
										}
									}}
									key={index}
								>
									<View
										key={index}
										className="bg-slate-400 dark:bg-slate-500 rounded-full p-1 pr-2 pl-2 m-1"
									>
										<Text className="text-sm text-slate-900 dark:text-slate-50">
											{tag}
										</Text>
									</View>
								</Pressable>
							))}
							{needsSyncing === undefined && (
								<View className="bg-slate-400 dark:bg-slate-500 rounded-full p-1 pr-2 pl-2 m-1">
									<AntDesign name="cloudo" size={24} color="white" />
								</View>
							)}
							{needsSyncing === true && (
								<View className="bg-slate-400 dark:bg-slate-500 rounded-full p-1 pr-2 pl-2 m-1">
									<AntDesign name="cloudupload" size={24} color="white" />
								</View>
							)}
							{needsSyncing === false && (
								<View className="bg-slate-400 dark:bg-slate-500 rounded-full p-1 pr-2 pl-2 m-1">
									<AntDesign name="cloud" size={20} color="white" />
								</View>
							)}
						</View>
					)}
				</View>
			</Animated.View>
		</Pressable>
	);
};

export default Card;
