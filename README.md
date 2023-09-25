# C7C1 Study Catalog - Backend

## Install

`yarn`

## DB Setup

-   Copy .env.example to .env and set `DATABASE_URL`, `LOCAL_DATABASE_URL` and `PORT` to your liking.
-   You will need to create a user in the Rapid API website to obtain the `X_RAPIDAPI_KEY` and be able to get images for the thumbnails (if not, you will still get a standard image when the user creates a new recommendation). Please refer to https://docs.rapidapi.com/.
-   Please link the corresponding `DISCORD_URL` in order to receive a notification when a new recommendation is posted.

e.g.

```
DATABASE_URL=postgres://someuser:somebigsecretpassword@somedbhost/pastebin
LOCAL_DATABASE_URL=postgres://user@localhost/project
PORT=4000
X_RAPIDAPI_KEY=123456789examplekey
DISCORD_URL=https://discord.com/api/webhooks/example/example123456789
```

Tables that need to be created and the appropriate PostgreSQL queries are available in the path /sql/createTables.sql
Example data/information is available in the path /sql/insertQueries.sql

Service chosen by the team for hosting our database in this project:

-   https://www.elephantsql.com/

[Deployed backend ↗️](https://c7c1-study-resource-catalog.onrender.com/)

## Sending requests using Postman

You can find in the website below a list of the requests needed to test the paths on the server
[Postman Requests ↗️](https://documenter.getpostman.com/view/28881704/2s9YC8upwp)

## Running locally

`yarn start:dev`

The env var LOCAL_DATABASE_URL will be consulted.

## Running locally against a remote db

`yarn start:dev-with-remote-db`

The env var DATABASE_URL will be consulted.
