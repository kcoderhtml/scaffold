import React from "react";
import { Text, View, Image } from "react-native";

interface CardProps {
	image?: string;
	title: string;
	description: string;
}

const Card: React.FC<CardProps> = ({ image, title, description }) => {
	return (
		<View className="bg-slate-300 dark:bg-slate-600 rounded-lg shadow-md m-1">
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
		</View>
	);
};

export default Card;
