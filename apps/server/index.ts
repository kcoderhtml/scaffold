import { count, create, getByID, insert, remove, search } from '@orama/orama'
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server'

import { Database } from "bun:sqlite";
import { generateToken, getTokenData } from './utils';

import Elysia from 'elysia'
const version = require('./package.json').version

console.log("----------------------------------\nScaffold Server\n----------------------------------\n")
console.log("🚀 Starting server")

console.log("📦 Loading SQLite DB")
const tokenDB = new Database('data/tokens.db')
tokenDB.exec('CREATE TABLE IF NOT EXISTS tokens (token TEXT PRIMARY KEY, userid TEXT)')

// list number of tokens
const tokens = tokenDB.prepare('SELECT * FROM tokens').all()
console.log("✅ SQLite DB loaded with", tokens.length, "tokens")

// check if data/vectorDB.msp exists
console.log("⛁  Loading Vector DB")
const imageSchema = {
    title: 'string',
    tags: 'string[]',
} as const

interface Image {
    title: string
    tags: string[]
    owner: string
}

let vectorDB = await create({ schema: imageSchema })
try {
    vectorDB = await restoreFromFile('binary', 'data/vectorDB.msp')
} catch (e) {
    console.log('❌ No data/vectorDB.msp file found; creating new Vector DB')
}
console.log(`✅ Vector DB loaded with ${await count(vectorDB)} images`)

console.log("⚙️  Setting up handlers")
process.on('SIGINT', async () => {
    await persistToFile(vectorDB, 'binary', "data/vectorDB.msp")
    process.exit()
})

process.on("SIGTERM", async () => {
    await persistToFile(vectorDB, 'binary', "data/vectorDB.msp")
    process.exit()
})
console.log("✅ Handlers set up")

// start elysia
console.log("🦊 Starting Elysia")

const elysia = new Elysia()
    .get('/', () => "Hello from Elysia! 🦊")
    .post('/query', async ({ request }) => {
        // get search query
        const { query } = await request.json()
        const bearer = request.headers.get('Authorization');

        const tokenData = await getTokenData(tokenDB, bearer!)

        // check if user is authenticated
        if (!tokenData) {
            return { error: 'Unauthorized' }
        }

        if (!query) {
            return { error: 'Invalid query' }
        }

        // search for images
        const results = await search<typeof vectorDB, Image>(vectorDB, { term: query as string })
        const images = results.hits.map((hit) => {
            const { document, id } = hit;
            return { ...document, id };
        });

        return images.filter((image) => image.owner === tokenData.userid)
    })
    .post('/insert', async ({ request }) => {
        // get image data
        const { title, tags } = await request.json()
        const bearer = request.headers.get('Authorization');

        const tokenData = await getTokenData(tokenDB, bearer!)

        // check if user is authenticated
        if (!tokenData) {
            return { error: 'Unauthorized' }
        }

        // ensure that image has the same type as the interface Image
        if (!title || !tags) {
            return { error: 'Invalid image data' }
        }

        // insert image into db
        try {
            const cloudID = await insert(vectorDB, { title, tags, owner: tokenData.userid })

            await persistToFile(vectorDB, 'binary', "data/vectorDB.msp")

            return { success: true, cloudID: cloudID }
        } catch (e) {
            return { error: 'Failed to insert image' }
        }
    })
    .post('/remove', async ({ request }) => {
        // get image data
        const { id } = await request.json()
        const bearer = request.headers.get('Authorization');

        const tokenData = await getTokenData(tokenDB, bearer!)

        // check if user is authenticated
        if (!tokenData) {
            return { error: 'Unauthorized' }
        }

        if (!id) {
            return { error: 'Invalid image data' }
        }

        // remove image from db
        try {
            // check that the id exists and the owner is the same as the token
            const image = await getByID(vectorDB, id)
            if (!image || image.owner !== tokenData.userid) {
                return { error: 'Image not found' }
            }

            await remove(vectorDB, id)

            await persistToFile(vectorDB, 'binary', "data/vectorDB.msp")
        } catch (e) {
            return { error: 'Failed to remove image' }
        }

        return { success: true }
    })
    .post('/token/new', async ({ request }) => {
        const { userID } = await request.json()
        const bearer = request.headers.get('Authorization');

        // check if user is authenticated
        if (bearer !== process.env.TOKEN) {
            return { error: 'Unauthorized' }
        }

        if (!userID) {
            return { error: 'Invalid data' }
        }

        // generate token
        const token = await generateToken(tokenDB)

        // insert token into db
        try {
            tokenDB.prepare('INSERT INTO tokens (token, userid) VALUES (?, ?)').run(token, userID)
        } catch (e) {
            return { error: 'Failed to insert token' }
        }

        return { success: true, token }
    })
    .post('/token/remove', async ({ request }) => {
        const { token } = await request.json()
        const bearer = request.headers.get('Authorization');

        // check if user is authenticated
        if (bearer !== process.env.TOKEN) {
            return { error: 'Unauthorized' }
        }

        if (!token) {
            return { error: 'Invalid token data' }
        }

        // remove token from db
        try {
            // check if token exists
            if (!tokenDB.prepare('SELECT * FROM tokens WHERE token = ?').get(token)) {
                return { error: 'Token not found' }
            }

            tokenDB.prepare('DELETE FROM tokens WHERE token = ?').run(token)
        } catch (e) {
            return { error: 'Failed to remove token' }
        }

        return { success: true }
    })
    .get('/version', () => {
        return { version }
    })
    .onRequest(({ request }) => {
        console.log(`📡  \x1b[32m[${new Date().toLocaleString()}]\x1b[0m - ${request.method} ${request.url}`);
    })
    .listen(4221)

console.log("✅ Elysia started at http://localhost:4221")
console.log("🚀 Server Started in", Bun.nanoseconds() / 1000000, "milliseconds on version:", version + "!", "\n\n----------------------------------\n")