import { Client } from "pg";

export async function getStudyListForUser(client: Client, user_id: number) {
    const result = await client.query(
        `SELECT r.*, COALESCE(likes.like_count, 0) AS like_count, COALESCE(dislikes.dislike_count, 0) AS dislike_count,
        COALESCE(tags.tag_list, '') AS tags, COALESCE(thumbnails.thumbnail_url, '') AS thumbnail_url
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
                LEFT JOIN (
                    SELECT url, thumbnail_url
                    FROM thumbnails
                ) AS thumbnails ON r.url = thumbnails.url
               LEFT JOIN study_list s ON r.url = s.url
               WHERE s.user_id = $1
               ORDER BY s.creation_date DESC;`,
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

export async function isInStudyList(
    client: Client,
    user_id: number,
    url: string
) {
    const response = await client.query(
        "SELECT * FROM study_list WHERE user_id = $1 AND url = $2",
        [user_id, url]
    );
    if (response.rowCount === 0) {
        return false;
    }

    return true;
}
