# Game Server

## Node.js Server using express and Socket.io

## Introduction

This game is a project requested by our University (UFPE), developed and designed by students.

Our idea was to create a game that would be played by one or two players.

You can understand more of the game in the Front-End Readme (will be added here later :D).

## Requirements

| Type                 | Description          |
| -------------------- | -------------------- |
| Node.js              | Server               |
| Express              | Server               |
| Socket.io            | Server               |
| Nodemon              | Server (Development) |
| TypeScript           | Server               |

## Installation

Run the following command in your terminal:

```shell
npm install
```

Now you can run the server with the following command:

```shell
nodemon index.ts
```

_OBS_: Nodemon is only for development purposes. If you want to run the server in production, you can run the following command:

```shell
node index.ts
```

## How to play with friends?

We can use ngrok to share the server with other people.

You can check ngrok documentation [here](ngrok.com).

## Usage

### Communication

#### Especifications

All our communication, except the test-only ones, are made using Websockets.

##### Event `create-room`

`Body`

```
  "room_name": string (required),
  "steps": number (required),
  "owner": string(required)
```

- The back-end will use the room name as ID for invite your friends.

##### Event `join-room`

`Body`

```json
  "roomID": string (required),
  "user": string (required),
```

##### `POST` /api/restart-room

`Body`

```json
  "roomId": UUID, (required)
```

`Response`

```json
  "status": 200 | 404,
  "message": string,
```

