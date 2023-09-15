import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";
import { getTagCloud, getRecentTenRecommmendations } from "./db";

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
// export interface Recommendation {
//     url: string;
//     name: string;
//     author: string;
//     description: string;
//     content_type: string;
//     build_phase: string;
//     creation_date: Date; //verify specific type for this one
//     user_id: number;
//     recommendation_type:
//         | "I recommend this resource after having used it"
//         | "I do not recommend this resource, having used it"
//         | "I haven't used this resosurce but it looks promising";
//     reason: string;
//     likes:number;
//     dislikes:number;
//     tags: string[];
//     comments:UserComment[];
// }

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
