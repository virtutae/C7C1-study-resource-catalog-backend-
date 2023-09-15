import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";
import {
    getTagCloud,
    getRecentTenRecommmendations,
    getRecommendationsFiltered,
    getUrl,
    postNewRecommendation,
} from "./db";
import { Recommendation } from "./types/express/Recommendation";

dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.get("/", async (_req, res) => {
    res.json({ msg: "Hello! There's nothing interesting for GET /" });
});

app.get("/users", async (_req, res) => {
    try {
        const { rows } = await client.query("SELECT * FROM users;");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error get request for /users", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.get("/recommendation/recent10", async (_req, res) => {
    try {
        const { rows } = await getRecentTenRecommmendations(client);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error get request for /recommendation/recent10", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.get("/tag-cloud", async (_req, res) => {
    try {
        const { rows } = await getTagCloud(client);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error get request for /tags/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.get<{ search: string; tags: string }>(
    "/recommendation/:search/:tags",
    async (req, res) => {
        const searchTerm =
            req.params.search === "null" ? null : req.params.search;
        const tagsToSearchArr =
            req.params.tags === "null"
                ? null
                : req.params.tags.split("#").filter((t) => t.length !== 0);
        try {
            const { rows } = await getRecommendationsFiltered(
                client,
                searchTerm,
                tagsToSearchArr
            );
            res.status(200).json(rows);
        } catch (error) {
            console.error(
                "Error get request for /recommendation/:search/:tags",
                error
            );
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

app.post<{}, {}, { url: string }>("/recommendation/url", async (req, res) => {
    try {
        const url = req.body.url;
        const { rowCount } = await getUrl(client, url);
        if (rowCount === 0) {
            res.status(200).json("Valid URL");
        } else {
            res.status(403).json("URL already exists");
        }
    } catch (error) {
        console.error("Error get request for /recommendation/new/:url", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});
//WORKING ON THE FOLLOWING POST REQUEST 15/09

// app.post<{}, {}, { recommendation: Recommendation }>("/recommendation", async (req, res) => {
//     try {
//         const recommendation = req.body.recommendation;
//         const { rows } = await postNewRecommendation(client, recommendation);
//         if (rowCount === 0) {
//             res.status(200).json("Valid URL");
//         } else {
//             res.status(403).json("URL already exists");
//         }
//     } catch (error) {
//         console.error("Error get request for /recommendation/new/:url", error);
//         res.status(500).send("An error occurred. Check server logs.");
//     }
// });

// first insert into table recommendations
// grab the string of tags and separate them by the # and filter empty strings
// map through the tag array to create the SQL query string.
//

app.get("/health-check", async (_req, res) => {
    try {
        //For this to be successful, must connect to db
        await client.query("select now()");
        res.status(200).send("system ok");
    } catch (error) {
        //Recover from error rather than letting system halt
        console.error(error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

connectToDBAndStartListening();

async function connectToDBAndStartListening() {
    console.log("Attempting to connect to db");
    await client.connect();
    console.log("Connected to db!");

    const port = getEnvVarOrFail("PORT");
    app.listen(port, () => {
        console.log(
            `Server started listening for HTTP requests on port ${port}.  Let's go!`
        );
    });
}
