# scaffold-server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

You can insert an image like this:

```bash
curl -X POST -H "Authorization: 7e09bb82-5b78-4688-acbd-9d6c7ae49b60" http://localhost:4221/insert -d '{"title": "special image", "tags": ["sparkles", "red"], "uri": "file:///smwhere"}'
```

or as a fetch:

```typescript
fetch('http://localhost:4221/insert', {
    method: 'POST',
    headers: {
        'Authorization': '7e09bb82-5b78-4688-acbd-9d6c7ae49b60',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        title: 'special image',
        tags: ['sparkles', 'red'],
        uri: 'file:///smwhere',
    })
})
```

To query the db:

```bash
curl -X POST -H "Authorization: 7e09bb82-5b78-4688-acbd-9d6c7ae49b60" http://localhost:4221/query -d '{"query": "special"}'
```

or as a fetch:

```typescript
fetch('http://localhost:4221/query', {
    method: 'POST',
    headers: {
        'Authorization': '7e09bb82-5b78-4688-acbd-9d6c7ae49b60',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        query: 'special'
    })
})
```

To remove an image:

```bash
curl -X POST -H "Authorization: 7e09bb82-5b78-4688-acbd-9d6c7ae49b60" http://localhost:4221/remove -d '{"id": "32323-d"}'
```

or as a fetch:

```typescript
fetch('http://localhost:4221/remove', {
    method: 'POST',
    headers: {
        'Authorization: 7e09bb82-5b78-4688-acbd-9d6c7ae49b60',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        id: '32323-d'
    })
})
```

To generate a token:

```bash
curl -X POST -H "Authorization: supersecretadmintoken" http://localhost:4221/token/new -d '{"userID": "kieran"}'
```

or as a fetch:

```typescript
fetch('http://localhost:4221/token/new', {
    method: 'POST',
    headers: {
        'Authorization': 'supersecretadmintoken',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userID: 'kieran'
    })
})
```

To delete a token:

```bash
curl -X POST -H "Authorization: supersecretadmintoken" http://localhost:4221/token/remove -d '{"token": "7e09bb82-5b78-4688-acbd-9d6c7ae49b60"}'
```

or as a fetch:

```typescript
fetch('http://localhost:4221/token/remove', {
    method: 'POST',
    headers: {
        'Authorization: supersecretadmintoken',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token: '7e09bb82-5b78-4688-acbd-9d6c7ae49b60'
    })
})
```
