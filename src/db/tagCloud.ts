import { Client } from "pg";

export async function getTagCloud(client: Client) {
    const result = await client.query(
        `SELECT tag_name FROM tags_cloud ORDER BY tag_name;`
    );

    return result;
}
