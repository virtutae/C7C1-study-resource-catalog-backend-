export function createSearchTagsQuery(
    tagsToSearchArr: string[] | null
): string {
    if (tagsToSearchArr === null) {
        return "true";
    }
    const sqlArr = tagsToSearchArr.map((t) => `tag_list LIKE '%#${t}#%'`);
    const sqlStr = sqlArr.join(" OR ");
    return sqlStr;
}
export function createSearchTermQuery(searchTerm: string | null): string {
    if (searchTerm === null) {
        return "true";
    }
    const sqlStr = `name ILIKE '%${searchTerm}%' OR description ILIKE '%${searchTerm}%' OR author ILIKE '%${searchTerm}%' OR tag_list ILIKE '%${searchTerm}%'`;
    return sqlStr;
}
