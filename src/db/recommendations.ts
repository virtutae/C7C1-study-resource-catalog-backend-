import { Client } from "pg";
import { RecommendationCandidate } from "../types/Recommendation";
import {
    createSearchTagsQuery,
    createSearchTermQuery,
} from "../utils/createSearchQuery";
import { createSqlParams, createSqlValues } from "../utils/createTagsQuery";

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
        WHERE (${searchTagsQuery}) AND (${searchTermQuery})
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
