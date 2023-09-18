export function createSqlValues(tags: string) {
    let paramCounter = 1;
    const tagsArr = tags.split("#").filter((t) => t !== "");

    const sqlValuesArr = tagsArr.map(
        () => `($${paramCounter++}, $${paramCounter++})`
    );
    const sqlValues = sqlValuesArr.join(", ");
    return sqlValues;
}

export function createSqlParams(tags: string, url: string) {
    const tagsArr = tags.split("#").filter((t) => t !== "");
    const tagsWithHashtagArr = tagsArr.map((t) => `#${t}`);
    const sqlParams: string[] = [];

    tagsWithHashtagArr.forEach((t) => {
        sqlParams.push(t);
        sqlParams.push(url);
    });
    return sqlParams;
}
