import React, { useEffect } from 'react'
import { Text, View, ScrollView, RefreshControl, TextInput } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Card from '../../components/card'

import AsyncStorage from '@react-native-async-storage/async-storage'
import Fuse from 'fuse.js'

export default function Home() {
  const [cardData, setCardData] = React.useState<{ uri?: string; url?: string; title: string; tags: string[] }[]>([]) // State for card data
  const [refreshing, setRefreshing] = React.useState(false) // State for refresh indicator
  const [filter, setFilter] = React.useState<string | null>(null) // State for filter
  const [fuse, setFuse] = React.useState<Fuse<any>>(new Fuse([], { keys: ['title', 'tags'], threshold: 0.3 }))

  useEffect(() => {
    const fetchData = async () => {
      const allImages = await AsyncStorage.getItem('images')
      if (allImages) {
        const images = JSON.parse(allImages)
        setCardData(images) // Update state with fetched data
        setFuse(new Fuse(images, { keys: ['title', 'tags'], threshold: 0.3 }))
      }
    }

    fetchData()
  }, [])

  const fetchData = async () => {
    setRefreshing(true) // Show refresh indicator

    const allImages = await AsyncStorage.getItem('images')
    if (allImages) {
      const images = JSON.parse(allImages)
      setCardData(images)
      setFuse(new Fuse(images, { keys: ['title', 'tags'], threshold: 0.3 }))
      setRefreshing(false) // Hide refresh indicator
    } else {
      setRefreshing(false) // Hide refresh indicator
    }
  }

  const removeItem = async (index: number) => {
    const allImages = await AsyncStorage.getItem('images')
    if (allImages) {
      const parsedImages: [
        {
          title: string
          tags: string[]
          uri: string
          needsSyncing?: boolean
          cloudID: string
        },
      ] = JSON.parse(allImages)

      try {
        parsedImages.splice(index, 1)
        await AsyncStorage.setItem('images', JSON.stringify(parsedImages))
        setFilter(null)
        setCardData(parsedImages)
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === 'Failed to remove image from cloud') {
            alert('Failed to remove image from cloud')
            parsedImages.splice(index, 1)
            await AsyncStorage.setItem('images', JSON.stringify(parsedImages))
            setFilter(null)
            setCardData(parsedImages)
          }
        }
      }
    }
  }

  const filterbyTag = async (tag: string) => {
    const allImages = await AsyncStorage.getItem('images')
    const cardData = JSON.parse(allImages || '[]')

    const filteredData = cardData.filter((data: any) => data.tags.includes(tag))
    setCardData(filteredData)
    setFilter(tag)
  }

  const search = async (query: string) => {
    if (!query) {
      fetchData()
      return
    }

    // search for images with fuzzy search
    const filteredData = fuse.search(query)

    setCardData(
      filteredData.map(
        data =>
          data.item as {
            title: string
            tags: string[]
            uri: string
            url: string
          },
      ),
    )
  }

  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-700" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // Show refresh indicator while fetching
            onRefresh={() => {
              setFilter(null)
              fetchData()
            }} // Function to call on pull down
          />
        }
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">Welcome to Scaffold 🚀</Text>

          <Text className="text-slate-900 dark:text-slate-50 p-4 italic">
            "Your Mind is a Garden, Your Thoughts are the Seeds. You can grow Flowers or weeds..." ― Osho
          </Text>

          <View className="flex flex-row items-center justify-center bg-slate-500 dark:bg-slate-600 p-1.5 pl-3 pr-3 mb-3 rounded-full">
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-50">Search for an image: </Text>
            <TextInput
              className="text-sm font-serif text-slate-900 dark:text-slate-50 italic bg-slate-400 dark:bg-slate-500 pl-2 pr-2 rounded-lg h-full"
              placeholder="red shoes"
              onChangeText={async text => await search(text)}
            />
          </View>

          {filter && (
            <View className="flex flex-row items-center justify-center bg-slate-500 dark:bg-slate-600 p-0.5 pl-3 pr-3 mb-3 rounded-full">
              <Text className="text-base font-bold text-slate-900 dark:text-slate-200">Filtering by tag: </Text>
              <Text className="text-sm font-serif text-slate-900 dark:text-slate-200 italic">{filter}</Text>
            </View>
          )}

          <View className="flex flex-wrap">
            {cardData.map((data, index) => (
              <Card
                key={index}
                image={data.uri}
                link={data.url ? new URL(data.url) : undefined}
                title={data.title}
                tags={data.tags}
                onPress={() => removeItem(index)}
                onTagPress={tag => filterbyTag(tag)}
              />
            ))}
          </View>
          <View className="flex-1 items-center justify-center">
            {cardData.length === 0 && (
              <Text className="text-xl text-slate-500 dark:text-slate-300 p-4">No images were found</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
