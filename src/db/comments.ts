import { Client } from "pg";

export async function getCommentsFromRecommendation(
    client: Client,
    url: string
) {
    const result = await client.query(
        `SELECT u.user_name, c.text
        FROM comments as c
        LEFT JOIN users as u
            ON c.user_id = u.id
        WHERE recommendation_url = $1
        ORDER BY u.creation_date DESC;`,
        [url]
    );

    return result;
}

export async function postComment(
    client: Client,
    user_id: number,
    url: string,
    text: string
) {
    const result = await client.query(
        "INSERT INTO comments(user_id, url, text) VALUES ($1, $2, $3);",
        [user_id, url, text]
    );

    return result;
}
