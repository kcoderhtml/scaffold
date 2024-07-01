import React from "react";
import { Text, TextInput, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const [message, setMessage] = React.useState<{
    message: string;
    ok: boolean;
  } | null>(null); // State for message

  async function save(key: string, value: string) {
    if (!value || value === "") {
      setMessage({
        message: "Value cannot be empty",
        ok: false,
      });
      return;
    }
    await SecureStore.setItemAsync(key, value);
    setMessage({
      message: "Value stored successfully!",
      ok: true,
    });
  }

  async function getAllValues(keys: string[]) {
    const values = await Promise.all(
      keys.map(async (key) => {
        const value = await SecureStore.getItemAsync(key);
        return { key, value };
      }),
    );

    const alertText = values
      .map((value) => `${value.key}: ${value.value}`)
      .join("\n");

    alert(alertText);
  }

  async function clearImages() {
    await AsyncStorage.removeItem("images");

    setMessage({
      message: "Cleared all images!",
      ok: true,
    });
  }

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-700"
      style={{ paddingTop: insets.top }}
    >
      <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
        Welcome to the Settings Menu!
      </Text>

      <Text className="text-xl font-bold text-slate-900 dark:text-slate-200 mt-8">
        🔐 API keys 🔐
      </Text>
      <TextInput
        className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg text-slate-900 dark:text-slate-200 w-9/12"
        placeholder="Enter your Gemini API key"
        onSubmitEditing={(event) =>
          save("GEMINI_API_KEY", event.nativeEvent.text)
        }
        secureTextEntry={true}
      />

      <Pressable
        className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
        onPress={() => getAllValues(["GEMINI_API_KEY"])}
      >
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
          Check Secure Storage
        </Text>
      </Pressable>

      <Text className="text-xl font-bold text-slate-900 dark:text-slate-200 mt-16">
        ⚠️ Danger Zone ⚠️
      </Text>

      <Pressable
        className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
        onPress={clearImages}
      >
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
          Clear All Images
        </Text>
      </Pressable>

      {message && (
        <Text
          className={`text-xl text-center font-bold mt-8 ${
            message.ok ? "text-green-500" : "text-red-500"
          }`}
        >
          {message.message}
        </Text>
      )}
    </View>
  );
}
