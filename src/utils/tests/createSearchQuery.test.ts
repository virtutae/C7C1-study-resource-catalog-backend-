import {
    createSearchTagsQuery,
    createSearchTermQuery,
} from "../createSearchQuery";

test("Create search tags query", () => {
    expect(createSearchTagsQuery(["react", "typescript"])).toBe(
        "tag_list LIKE '%#react#%' OR tag_list LIKE '%#typescript#%'"
    );
});

test("Create Search Term Query with null search term", () => {
    expect(createSearchTermQuery(null)).toBe("true");
});

test("Create Search Term Query with 'hello' as search term", () => {
    expect(createSearchTermQuery("hello")).toBe(
        "name ILIKE '%hello%' OR description ILIKE '%hello%' OR author ILIKE '%hello%' OR tag_list ILIKE '%hello%'"
    );
});
