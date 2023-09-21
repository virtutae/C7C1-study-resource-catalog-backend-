import { Client } from "pg";

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
