import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import {
    deleteVote,
    getRecentTenRecommmendations,
    getRecommendationsFiltered,
    getTagCloud,
    getUrl,
    postComment,
    postRecommendation,
    postTags,
    upsertVote,
} from "./db";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";
import { Recommendation } from "./types/express/Recommendation";
import morgan from "morgan";

dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.use(morgan("tiny"));

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

app.post<{}, {}, { recommendation: Recommendation }>(
    "/recommendation",
    async (req, res) => {
        try {
            const recommendation = req.body.recommendation;
            await postRecommendation(client, recommendation);

            const { url, tags } = recommendation;
            await postTags(client, tags, url);

            await axios.post(
                "https://discord.com/api/webhooks/1153278935187062794/FpxDzjkcGrJvWvzJAS7wELMSbtNUOWETgYdi__YcRR_F2cxp5ZH3Nfd5jHOay3LpCHrS",
                {
                    content: `New Recommendation added:\nTitle: ${recommendation.name}\nLink: ${recommendation.url}`,
                }
            );

            res.status(200).json("New recommendation added");
        } catch (error) {
            console.error("Error post request for /recommendation/", error);
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

app.post("/comments", async (req, res) => {
    try {
        const { user_id, recommendation_url, text } = req.body;
        await postComment(client, user_id, recommendation_url, text);
        res.status(200).json("New comment added");
    } catch (error) {
        console.error("Error post request for /comments/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.post("/votes", async (req, res) => {
    try {
        const { user_id, url, is_like } = req.body;
        await upsertVote(client, user_id, url, is_like);
        res.status(200).json("New vote added");
    } catch (error) {
        console.error("Error post request for /votes/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.delete("/votes", async (req, res) => {
    try {
        const { user_id, url } = req.body;
        await deleteVote(client, user_id, url);
        res.status(200).json("Vote deleted");
    } catch (error) {
        console.error("Error post request for /votes/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

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
