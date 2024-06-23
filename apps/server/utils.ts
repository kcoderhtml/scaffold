import type { Database } from "bun:sqlite";

export async function generateToken(tokenDB: Database) {
    // generate crypto.randomUUID() and check if it already exists in the db to avoid duplicates
    let token = crypto.randomUUID()
    while (tokenDB.prepare('SELECT * FROM tokens WHERE token = ?').get(token)) {
        token = crypto.randomUUID()
    }

    return token
}

export async function getTokenData(tokenDB: Database, token: string): Promise<{ token: string, userid: string } | null> {
    // get token data from db
    return tokenDB.prepare('SELECT * FROM tokens WHERE token = ?').get(token) as { token: string, userid: string };
}