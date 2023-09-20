import { Client } from "pg";
import { RecommendationCandidate } from "./types/Recommendation";
import {
    createSearchTagsQuery,
    createSearchTermQuery,
} from "./utils/createSearchQuery";
import { createSqlParams, createSqlValues } from "./utils/createTagsQuery";

// USERS QUERIES
export async function getUsers(client: Client) {
    const result = await client.query("SELECT * FROM users;");

    return result;
}

// RECOMMENDATION QUERIES
export async function getRecentTenRecommmendations(client: Client) {
    const result = await client.query(
        `SELECT r.*, COALESCE(likes.like_count, 0) AS like_count, COALESCE(dislikes.dislike_count, 0) AS dislike_count, COALESCE(tags.tag_list, '') AS tags
        FROM recommendations r
        LEFT JOIN (
            SELECT url, COUNT(*) AS like_count
            FROM votes
            WHERE is_like = true
            GROUP BY url
        ) AS likes ON r.url = likes.url
        LEFT JOIN (
            SELECT url, COUNT(*) AS dislike_count
            FROM votes
            WHERE is_like = false
            GROUP BY url
        ) AS dislikes ON r.url = dislikes.url
        LEFT JOIN (
            SELECT url, CONCAT(STRING_AGG(tag_name, ''), '#') AS tag_list
            FROM tags
            GROUP BY url
        ) AS tags ON r.url = tags.url
        ORDER BY r.creation_date DESC LIMIT 10;`
    );

    return result;
}

export async function getRecommendationsFiltered(
    client: Client,
    searchTerm: string | null,
    tagsToSearchArr: string[] | null
) {
    createSearchTagsQuery(tagsToSearchArr);
    const searchTagsQuery = createSearchTagsQuery(tagsToSearchArr);
    const searchTermQuery = createSearchTermQuery(searchTerm);

    const result = await client.query(
        `SELECT r.*, COALESCE(likes.like_count, 0) AS like_count, COALESCE(dislikes.dislike_count, 0) AS dislike_count, COALESCE(tags.tag_list, '') AS tags
        FROM recommendations r
        LEFT JOIN (
            SELECT url, COUNT(*) AS like_count
            FROM votes
            WHERE is_like = true
            GROUP BY url
        ) AS likes ON r.url = likes.url
        LEFT JOIN (
            SELECT url, COUNT(*) AS dislike_count
            FROM votes
            WHERE is_like = false
            GROUP BY url
        ) AS dislikes ON r.url = dislikes.url
        LEFT JOIN (
            SELECT url, CONCAT(STRING_AGG(tag_name, ''), '#') AS tag_list
            FROM tags
            GROUP BY url
        ) AS tags ON r.url = tags.url
        WHERE ${searchTagsQuery} AND ${searchTermQuery}
        ;`
    );

    return result;
}

export async function getRecommendationUrl(client: Client, url: string) {
    const result = await client.query(
        `SELECT * FROM recommendations WHERE url = $1`,
        [url]
    );

    return result;
}

export async function postRecommendation(
    client: Client,
    recommendation: RecommendationCandidate
) {
    const {
        url,
        name,
        author,
        description,
        content_type,
        build_phase,
        user_id,
        recommendation_type,
        reason,
    } = recommendation;
    const result = await client.query(
        `INSERT INTO recommendations (url,
            name,
            author,
            description,
            content_type,
            build_phase,
            user_id,
            recommendation_type,
            reason
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING * ;`,
        [
            url,
            name,
            author,
            description,
            content_type,
            build_phase,
            user_id,
            recommendation_type,
            reason,
        ]
    );

    return result;
}

export async function postTags(client: Client, tags: string, url: string) {
    if (tags === "") {
        return;
    }

    const sqlValues = createSqlValues(tags);
    const sqlParams = createSqlParams(tags, url);
    const result = await client.query(
        `INSERT INTO tags (tag_name, url) VALUES ${sqlValues};`,
        sqlParams
    );

    return result;
}

// TAG-CLOUD QUERIES
export async function getTagCloud(client: Client) {
    const result = await client.query(`SELECT tag_name FROM tags_cloud;`);

    return result;
}

// COMMENT QUERIES
export async function postComment(
    client: Client,
    user_id: number,
    recommendation_url: string,
    text: string
) {
    const result = await client.query(
        "INSERT INTO comments(user_id, recommendation_url, text) VALUES ($1, $2, $3);",
        [user_id, recommendation_url, text]
    );

    return result;
}

// VOTES QUERIES
export async function upsertVote(
    client: Client,
    user_id: number,
    url: string,
    is_like: boolean
) {
    const result = await client.query(
        "INSERT INTO votes(user_id, url, is_like) VALUES ($1, $2, $3) ON CONFLICT (user_id, url) DO UPDATE SET is_like = $3 RETURNING *;",
        [user_id, url, is_like]
    );

    return result;
}

export async function deleteVote(client: Client, user_id: number, url: string) {
    const result = await client.query(
        "DELETE FROM votes WHERE user_id = $1 AND url = $2 RETURNING *;",
        [user_id, url]
    );

    return result;
}

export async function getVotes(
    client: Client,
    url: string,
    vote_type: boolean
): Promise<number> {
    const result = await client.query(
        "SELECT * FROM votes WHERE url = $1 AND is_like = $2;",
        [url, vote_type]
    );

    return result.rowCount;
}

export async function getStudyListForUser(client: Client, user_id: number) {
    const result = await client.query(
        `SELECT r.*, COALESCE(likes.like_count, 0) AS like_count, COALESCE(dislikes.dislike_count, 0) AS dislike_count,
        COALESCE(tags.tag_list, '') AS tags
                FROM recommendations r
                LEFT JOIN (
                    SELECT url, COUNT(*) AS like_count
                    FROM votes
                    WHERE is_like = true
                    GROUP BY url
                ) AS likes ON r.url = likes.url
                LEFT JOIN (
                    SELECT url, COUNT(*) AS dislike_count
                    FROM votes
                    WHERE is_like = false
                    GROUP BY url
                ) AS dislikes ON r.url = dislikes.url
                LEFT JOIN (
                    SELECT url, CONCAT(STRING_AGG(tag_name, ''), '#') AS tag_list
                    FROM tags
                    GROUP BY url
                ) AS tags ON r.url = tags.url
               LEFT JOIN study_list s ON r.url = s.url
               WHERE s.user_id = $1`,
        [user_id]
    );
    return result;
}

export async function postStudyListEntry(
    client: Client,
    user_id: number,
    url: string
) {
    const result = await client.query(
        "INSERT INTO study_list(user_id, url) VALUES ($1, $2)",
        [user_id, url]
    );
    return result;
}

export async function deleteStudyListEntry(
    client: Client,
    user_id: number,
    url: string
) {
    await client.query(
        "DELETE FROM study_list WHERE user_id = $1 AND url = $2",
        [user_id, url]
    );
}
