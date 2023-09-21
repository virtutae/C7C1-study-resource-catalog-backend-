import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";
import {
    Recommendation,
    RecommendationCandidate,
} from "./types/Recommendation";
import { Tag } from "./types/Tag";
import { User } from "./types/User";
import { RecommendationComment } from "./types/RecommendationComment";
import { getCommentsFromRecommendation, postComment } from "./db/comments";
import {
    getRecentTenRecommmendations,
    getRecommendationsFiltered,
    getRecommendationUrl,
    postRecommendation,
    postTags,
    postThumbnail,
} from "./db/recommendations";
import {
    getStudyListForUser,
    postStudyListEntry,
    deleteStudyListEntry,
} from "./db/studyList";
import { getTagCloud } from "./db/tagCloud";
import { getUsers, getUserName } from "./db/users";
import { getVotes, upsertVote, deleteVote } from "./db/votes";

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

// USERS ROUTES
app.get<{}, User[] | string>("/users", async (_req, res) => {
    try {
        const { rows } = await getUsers(client);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error get request for /users", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.get<{ user_id: string }, { user_name: string } | string>(
    "/users/:user_id",
    async (req, res) => {
        try {
            const { user_id } = req.params;
            const { rows } = await getUserName(client, user_id);
            res.status(200).json(rows[0]);
        } catch (error) {
            console.error(
                "Error get request for /recommendation/recent10",
                error
            );
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

// RECOMMENDATION ROUTES
app.get<{}, Recommendation[] | string>(
    "/recommendation/recent10",
    async (_req, res) => {
        try {
            const { rows } = await getRecentTenRecommmendations(client);
            res.status(200).json(rows);
        } catch (error) {
            console.error(
                "Error get request for /recommendation/recent10",
                error
            );
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

app.get<{ search: string; tags: string }, Recommendation[] | string>(
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
        const { rowCount } = await getRecommendationUrl(client, url);
        if (rowCount === 0) {
            res.status(201).json("Valid URL");
        } else {
            res.status(202).json("URL already exists");
        }
    } catch (error) {
        console.error("Error get request for /recommendation/new/:url", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.post<{}, {}, { recommendation: RecommendationCandidate }>(
    "/recommendation",
    async (req, res) => {
        const recommendation = req.body.recommendation;
        try {
            await postRecommendation(client, recommendation);
            const { url, tags } = recommendation;
            await postTags(client, tags, url);
            await postThumbnail(client, url);

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

// TAG-CLOUD ROUTES
app.get<{}, Tag[] | string>("/tag-cloud", async (_req, res) => {
    try {
        const { rows } = await getTagCloud(client);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error get request for /tags/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

// COMMENTS ROUTES
app.get<{ url: string }, RecommendationComment[] | string>(
    "/comments/:url",
    async (req, res) => {
        try {
            const { url } = req.params;
            const { rows } = await getCommentsFromRecommendation(client, url);
            res.status(200).json(rows);
        } catch (error) {
            console.error("Error get request for /comments/:url", error);
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

app.post<
    {},
    string,
    { user_id: number; recommendation_url: string; text: string }
>("/comments", async (req, res) => {
    try {
        const { user_id, recommendation_url, text } = req.body;
        await postComment(client, user_id, recommendation_url, text);
        res.status(200).json("New comment added");
    } catch (error) {
        console.error("Error post request for /comments/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

// VOTES ROUTES
app.get<
    { url: string },
    { newLikeCount: number; newDislikeCount: number } | string
>("/votes/:url", async (req, res) => {
    try {
        const url = req.params.url;
        const votesCount = {
            newLikeCount: await getVotes(client, url, true),
            newDislikeCount: await getVotes(client, url, false),
        };
        res.status(200).json(votesCount);
    } catch (error) {
        console.error("Error post request for /votes/:url", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.post<{}, string, { user_id: number; url: string; is_like: boolean }>(
    "/votes",
    async (req, res) => {
        try {
            const { user_id, url, is_like } = req.body;
            await upsertVote(client, user_id, url, is_like);
            res.status(200).json("New vote added");
        } catch (error) {
            console.error("Error post request for /votes/", error);
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

app.delete<{ user_id: number; url: string }, string>(
    "/votes/:user_id/:url",
    async (req, res) => {
        try {
            const { user_id, url } = req.params;
            await deleteVote(client, user_id, url);
            res.status(200).json("Vote deleted");
        } catch (error) {
            console.error("Error post request for /votes/", error);
            res.status(500).send("An error occurred. Check server logs.");
        }
    }
);

//STUDY-VIEW ROUTES

app.get("/study-list/:user_id", async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);
        const { rows } = await getStudyListForUser(client, user_id);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error get request for /study-list/:user_id", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.post("/study-list", async (req, res) => {
    try {
        const { user_id, url } = req.body;
        await postStudyListEntry(client, user_id, url);
        res.status(200).json("Added new study list entry");
    } catch (error) {
        console.error("Error post request for /study-list/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

app.delete("/study-list", async (req, res) => {
    try {
        const { user_id, url } = req.body;
        await deleteStudyListEntry(client, user_id, url);
        res.status(200).json("Deleted study list entry");
    } catch (error) {
        console.error("Error in delete request for /study-list/", error);
        res.status(500).send("An error occurred. Check server logs.");
    }
});

// GENERAL ROUTES
app.get<{}, string>("/health-check", async (_req, res) => {
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
