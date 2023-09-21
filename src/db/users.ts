import { Client } from "pg";

export async function getUsers(client: Client) {
    const result = await client.query(
        "SELECT * FROM users ORDER BY user_name;"
    );

    return result;
}

export async function getUserName(client: Client, user_id: string) {
    const result = await client.query(
        "SELECT user_name FROM users WHERE id = $1",
        [user_id]
    );

    return result;
}
