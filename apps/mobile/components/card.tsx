import React, { useRef, useState } from 'react'
import { Text, View, Image, Pressable, Animated } from 'react-native'

import * as Haptics from 'expo-haptics'
import { getLinkPreview } from 'link-preview-js'

interface CardProps {
  image?: string
  link?: URL
  title: string
  description?: string
  tags?: string[]
  onPress?: () => void
  onTagPress?: (tag: string) => void
}

async function getLinkMeta(link: URL) {
  const preview = (await getLinkPreview(link.toString())) as {
    url: string
    title: string
    siteName: string | undefined
    description: string | undefined
    mediaType: string
    contentType: string | undefined
    images: string[]
    videos: {
      url: string | undefined
      secureUrl: string | null | undefined
      type: string | null | undefined
      width: string | undefined
      height: string | undefined
    }[]
    favicons: string[]
  }

  return {
    title: preview.title,
    description: preview.description!,
    imageURL: preview.images[0] || preview.favicons[0],
    url: link.toString(),
  }
}

const Card: React.FC<CardProps> = ({ image, link, title, description, tags, onPress, onTagPress }) => {
  const scale = useRef(new Animated.Value(1)).current
  const [critPressed, setCritPressed] = useState(false)
  const pressStart = useRef(0)
  const holdDuration = 0.18

  const [linkMeta, setLinkMeta] = useState<{
    title: string
    url: string
    imageURL: string
    description: string
  } | null>(null)

  React.useEffect(() => {
    if (link !== undefined) {
      getLinkMeta(link).then(meta => {
        setLinkMeta(meta)
      })
    }
  }, [link])

  return (
    <Pressable
      className="bg-slate-300 dark:bg-slate-600 rounded-lg shadow-md m-1"
      onPressIn={() => {
        // check if the onPress function is defined
        if (onPress) {
          pressStart.current = Date.now()
          // animate to smaller size
          Animated.timing(scale, {
            toValue: 0.975,
            duration: holdDuration * 1000,
            useNativeDriver: true,
          }).start(({ finished }) => {
            // if the press was held for the duration and animation completed, set critPressed to true
            if (finished) {
              setCritPressed(true)
              Haptics.selectionAsync()
            }
          })
        }
      }}
      onPressOut={() => {
        if (onPress) {
          // check if the press was a long press
          if (Date.now() - pressStart.current < holdDuration * 1000) {
            // if not, animate back to normal
            Animated.timing(scale, {
              toValue: 1,
              duration: holdDuration * 300,
              useNativeDriver: true,
            }).start()
          } else {
            // if it was, run the onPress function after animating to smaller size
            Animated.timing(scale, {
              toValue: 0.98,
              duration: holdDuration * 300,
              useNativeDriver: true,
            }).start(async ({ finished }) => {
              // run onPress function after animation
              if (finished && onPress) {
                await onPress()
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                scale.setValue(1)
                setCritPressed(false)
              }
            })
          }
        }
      }}
    >
      <Animated.View
        className="bg-slate-300 dark:bg-slate-600 rounded-lg shadow-md m-1"
        style={{
          transform: [{ scale }],
          borderWidth: critPressed ? 2 : 0,
          borderColor: critPressed ? 'red' : 'transparent',
        }}
      >
        {image && <Image source={{ uri: image }} className="w-56 h-56 object-cover rounded-t" />}
        {linkMeta && <Image source={{ uri: linkMeta.imageURL }} className="w-56 h-56 object-cover rounded-t" />}
        <View className="w-56">
          {(linkMeta?.title || title) !== '' && (
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-50 p-2 text-center">
              {linkMeta?.title || title}
            </Text>
          )}

          {(linkMeta?.description || description) !== '' && (
            <Text className="text-slate-900 dark:text-slate-50 pl-2 pr-2 pb-2 text-center">
              {linkMeta?.description || description}
            </Text>
          )}

          {tags && tags.length > 0 && (
            <View className="flex flex-row flex-wrap justify-center">
              {tags.map((tag, index) => (
                <Pressable
                  onPress={() => {
                    if (onTagPress) {
                      onTagPress(tag)
                    }
                  }}
                  key={index}
                >
                  <View key={index} className="bg-slate-400 dark:bg-slate-500 rounded-full p-1 pr-2 pl-2 m-1">
                    <Text className="text-sm text-slate-900 dark:text-slate-50">{tag}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  )
}

export default Card
