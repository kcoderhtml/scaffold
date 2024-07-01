import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function ImagePickerDummyPage() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center bg-slate-50 dark:bg-slate-700 justify-center"
      style={{ paddingTop: insets.top }}
    >
      <Text className="text-xl text-center font-bold text-slate-900 dark:text-slate-50">
        Something went wrong.
      </Text>
      <Pressable className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg">
        <Link
          className="text-xl font-bold text-slate-900 dark:text-slate-200"
          href="/"
        >
          Please click here to go back.
        </Link>
      </Pressable>
    </View>
  );
}
