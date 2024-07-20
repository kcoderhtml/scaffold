import { View, Linking } from 'react-native'
import Card from '../components/card'
import React from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

import { useLocalSearchParams } from 'expo-router'

export default function CardPopupPage() {
  const [cardData, setCardData] = React.useState<{
    id: string
    uri?: string
    url?: string
    title: string
    tags: string[]
  }>() // State for card data

  // get the id param from the URL
  const { id } = useLocalSearchParams()

  React.useEffect(() => {
    const fetchData = async () => {
      const allImages = await AsyncStorage.getItem('images')
      if (allImages) {
        const images: {
          id: string
          title: string
          tags: string[]
          uri: string
          needsSyncing?: boolean
          cloudID: string
        }[] = JSON.parse(allImages)
        // get the card data for the current id
        const matchingImage = images.find(image => image.id === id)
        if (matchingImage) {
          setCardData(matchingImage) // Update state with fetched data
        }
      }
    }

    fetchData()
  }, [])

  const removeItem = async (id: string) => {
    const allImages = await AsyncStorage.getItem('images')
    if (allImages) {
      const parsedImages: [
        {
          id: string
          title: string
          tags: string[]
          uri: string
          needsSyncing?: boolean
          cloudID: string
        },
      ] = JSON.parse(allImages)

      parsedImages.splice(
        parsedImages.findIndex(image => image.id === id),
        1,
      )
      await AsyncStorage.setItem('images', JSON.stringify(parsedImages))
      router.navigate('/')
    }
  }

  return (
    <View className="flex-1 items-center bg-slate-50 dark:bg-slate-700 justify-center">
      {cardData && (
        <Card
          title={cardData?.title!}
          tags={cardData?.tags}
          image={cardData?.uri!}
          link={cardData?.url ? new URL(cardData.url) : undefined}
          popUpPermanentlyVisible={true}
          popUpMenuItems={[
            { title: 'Remove', onPress: () => removeItem(cardData?.id!), icon: 'trash' },
            cardData?.url
              ? { title: 'Open in Browser', onPress: () => Linking.openURL(cardData?.url!), icon: 'link' }
              : undefined!,
          ]}
        />
      )}
    </View>
  )
}
