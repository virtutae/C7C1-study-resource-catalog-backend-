import { Client } from "pg";

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

export async function getTagCloud(client: Client) {
    const result = await client.query(`SELECT tag_name FROM tags_cloud`);

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

function createSearchTagsQuery(tagsToSearchArr: string[] | null): string {
    if (tagsToSearchArr === null) {
        return "true";
    }
    const sqlArr = tagsToSearchArr.map((t) => `tag_list LIKE '%#${t}#%'`);
    const sqlStr = sqlArr.join("OR ");
    return sqlStr;
}

function createSearchTermQuery(searchTerm: string | null): string {
    if (searchTerm === null) {
        return "true";
    }
    const sqlStr = `name ILIKE '%${searchTerm}%' OR description ILIKE '%${searchTerm}%' OR author ILIKE '%${searchTerm}%' OR tag_list ILIKE '%${searchTerm}%'`;
    return sqlStr;
}
