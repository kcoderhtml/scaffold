import React, { useRef, useState, useEffect } from "react";
import { Text, View, Image, Pressable, Animated } from "react-native";

import * as Haptics from "expo-haptics";

interface CardProps {
	image?: string;
	title: string;
	description: string;
	onPress?: () => void;
}

const Card: React.FC<CardProps> = ({ image, title, description, onPress }) => {
	const scale = useRef(new Animated.Value(1)).current;
	const [critPressed, setCritPressed] = useState(false);
	const pressStart = useRef(0);
	const holdDuration = 0.45;

	return (
		<Pressable
			className="bg-slate-300 dark:bg-slate-600 rounded-lg shadow-md m-1"
			onPressIn={() => {
				pressStart.current = Date.now();

				// animate to smaller size
				Animated.timing(scale, {
					toValue: 0.95,
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
						duration: 100,
						useNativeDriver: true,
					}).start();
				} else {
					// if it was, run the onPress function after animating to smaller size
					Animated.timing(scale, {
						toValue: 0.9,
						duration: 100,
						useNativeDriver: true,
					}).start(({ finished }) => {
						// run onPress function after animation
						if (finished && onPress) {
							onPress();
							Haptics.notificationAsync(
								Haptics.NotificationFeedbackType.Success
							);
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
					borderColor: "red",
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
					{description !== "" && (
						<Text className="text-slate-900 dark:text-slate-50 pl-2 pr-2 pb-2 text-center">
							{description}
						</Text>
					)}
				</View>
			</Animated.View>
		</Pressable>
	);
};

export default Card;
