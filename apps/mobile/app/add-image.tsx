import { Pressable, Text, TextInput, View } from 'react-native'
import Card from '../components/card'
import React from 'react'

import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Filesystem from 'expo-file-system'

import * as SecureStore from 'expo-secure-store'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { JSHash, CONSTANTS } from 'react-native-hash'

import * as ExpoFileSystem from 'expo-file-system'
import * as Clipboard from 'expo-clipboard'

import { getLinkPreview } from 'link-preview-js'

async function fileToGenerativePart(path: string, mimeType: string) {
  try {
    const base64image = await ExpoFileSystem.readAsStringAsync(path, {
      encoding: ExpoFileSystem.EncodingType.Base64,
    })
    return {
      inlineData: {
        data: base64image,
        mimeType,
      },
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function describeImage(model: any, asset: any, mimeType: string) {
  let prompt = ''
  switch (mimeType) {
    case 'image':
      prompt = `You are to analyze the content of this image and generate a short and conscise json object like the following with no more than 5 tags {"title": "bowl of penne", "tags": ["red", "bowl", "penne", "pasta", "food"]}. don't include any other text.`
      break
    case 'url':
      prompt = `You are to analyze the content of this web page and generate a short and conscise json object like the following with no more than 5 tags {"title": "a blog post on typescript's powers with bun", "tags": ["ts", "bun", "typescript", "blog", "kieran"]}. don't include any other text.`
      break
    default:
      throw new Error('Unsupported mime type')
  }

  const aiResult = await model.generateContent([
    prompt,
    mimeType === 'image' ? await fileToGenerativePart(asset.uri, asset.mimeType!) : JSON.stringify(asset),
  ])
  const response = await aiResult.response
  const analysis = response.text()

  const analysisObject = JSON.parse(analysis)

  return analysisObject
}

async function generateUniqueHash(uri: string) {
  let isUnique = false
  let hash = ''

  while (!isUnique) {
    hash = await JSHash(uri + Math.random(), CONSTANTS.HashAlgorithms.sha256)
    const allImages = await AsyncStorage.getItem('images')
    const images = JSON.parse(allImages || '[]')
    isUnique = !images.some((image: { id: string; uri: string }) => image.id === hash)
  }

  return hash
}

export default function ImagePickerPage() {
  const [apiKey, setApiKey] = React.useState<string | null>(null) // State for API key
  const [message, setMessage] = React.useState<{
    message: string
    ok: boolean
  } | null>(null) // State for message
  const [clipboardURL, setClipboardURL] = React.useState<URL | null>(null)

  React.useEffect(() => {
    const getApiKey = async () => {
      const retrievedKey = await SecureStore.getItemAsync('GEMINI_API_KEY')
      setApiKey(retrievedKey)
    }
    getApiKey()
  }, [])

  React.useEffect(() => {
    const getClipboardText = async () => {
      const clipboardText = await Clipboard.getStringAsync()
      // check if its a url
      const urlRegex = /(https?:\/\/[^\s]+)/g
      if (clipboardText.match(urlRegex)) {
        setClipboardURL(new URL(clipboardText))
        return
      }
    }
    getClipboardText()
  }, [])

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      const allImages = await AsyncStorage.getItem('images')

      const genAI = new GoogleGenerativeAI(apiKey!)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const images: {
        id: string
        uri: string
        title: string
        tags: string[]
      }[] = JSON.parse(allImages || '[]')
      const id = await generateUniqueHash(result.assets[0].uri)

      const newUri = Filesystem.documentDirectory + 'images/' + id + '.' + result.assets[0].uri.split('.').pop()

      try {
        // make the images directory if it doesn't exist
        await Filesystem.makeDirectoryAsync(Filesystem.documentDirectory + 'images', { intermediates: true })

        await Filesystem.downloadAsync(result.assets[0].uri, newUri)
      } catch (e) {
        console.error(e)
        setMessage({ message: 'Failed to add image', ok: false })
        return
      }

      images.unshift({
        id,
        uri: newUri,
        title: '',
        tags: ['needs tagging'],
      })

      await AsyncStorage.setItem('images', JSON.stringify(images))

      try {
        if (!apiKey) {
          throw new Error('No API key found.')
        }

        console.log('Image analysis started: ', id)

        setTimeout(async () => {
          const analysisObject = await describeImage(model, result.assets[0], 'image')

          const allImages = await AsyncStorage.getItem('images')
          const images: {
            id: string
            uri: string
            title: string
            tags: string[]
          }[] = JSON.parse(allImages!)

          const newImages = images.map(image => {
            if (image.id === id) {
              return {
                ...image,
                title: analysisObject.title,
                tags: analysisObject.tags,
              }
            } else {
              return image
            }
          })

          await AsyncStorage.setItem('images', JSON.stringify(newImages))
          console.log('Image analysis complete: ', analysisObject.title)
        }, 0)

        setMessage({ message: 'Image added successfully!', ok: true })
      } catch (e) {
        if (e instanceof Error) {
          console.error(e)
          setMessage({ message: e.message, ok: false })
        }
      }
    } else {
      setMessage({ message: 'Image selection cancelled.', ok: false })
    }
  }

  const addUrl = async (url: URL) => {
    const preview = (await getLinkPreview(url.toString())) as {
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

    const allImages = await AsyncStorage.getItem('images')

    const genAI = new GoogleGenerativeAI(apiKey!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const images: {
      id: string
      url: string
      title: string
      tags: string[]
    }[] = JSON.parse(allImages || '[]')
    const id = await generateUniqueHash(url.href)

    images.unshift({
      id,
      title: preview.title,
      url: url.toString(),
      tags: ['needs tagging'],
    })

    await AsyncStorage.setItem('images', JSON.stringify(images))

    // clear clipboard
    await Clipboard.setStringAsync('')
    setClipboardURL(null)

    try {
      if (!apiKey) {
        throw new Error('No API key found.')
      }

      console.log('web page analysis started: ', id)

      setTimeout(async () => {
        const analysisObject = await describeImage(
          model,
          {
            url: url.toString(),
            title: preview.title,
            description: preview.description,
          },
          'url',
        )

        const allImages = await AsyncStorage.getItem('images')
        const images: {
          id: string
          uri: string
          title: string
          tags: string[]
        }[] = JSON.parse(allImages!)

        const newImages = images.map(image => {
          if (image.id === id) {
            return {
              ...image,
              title: analysisObject.title,
              tags: analysisObject.tags,
            }
          } else {
            return image
          }
        })

        await AsyncStorage.setItem('images', JSON.stringify(newImages))
        console.log('web page analysis complete: ', analysisObject.title)
      }, 0)

      setMessage({ message: 'web page added successfully!', ok: true })
    } catch (e) {
      if (e instanceof Error) {
        console.error(e)
        setMessage({ message: e.message, ok: false })
      }
    }
  }

  return (
    <View className="flex-1 items-center bg-slate-50 dark:bg-slate-700 justify-center">
      {clipboardURL && (
        <View className="flex flex-col items-center justify-center">
          <Pressable
            className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg"
            onPress={() => addUrl(clipboardURL)}
          >
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
              Add {clipboardURL.hostname} to your collection!
            </Text>
          </Pressable>

          <Card link={clipboardURL} title={clipboardURL.hostname} />
        </View>
      )}

      <Pressable className="p-3 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg" onPress={pickImageAsync}>
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-200">
          {clipboardURL ? 'Alternatively ' : ''} Select an Image
        </Text>
      </Pressable>

      {!clipboardURL && (
        <TextInput
          className="p-3 mb-36 mt-5 bg-slate-300 dark:bg-slate-600 rounded-lg text-slate-900 dark:text-slate-200 w-9/12"
          placeholder="Alternatively, enter a website's URL!"
          onSubmitEditing={event => {
            let inputURL = event.nativeEvent.text
            try {
              // check if it has http or https
              if (!inputURL.match(/^https?:\/\//)) {
                inputURL = 'https://' + inputURL
              }
              const url = new URL(inputURL)
              addUrl(url)
            } catch (error) {
              setMessage({ message: 'Invalid URL', ok: false })
            }
          }}
          textContentType="URL"
        />
      )}

      {message && (
        <Text className={`text-xl text-center font-bold mt-8 ${message.ok ? 'text-green-500' : 'text-red-500'}`}>
          {message.message}
        </Text>
      )}
    </View>
  )
}
