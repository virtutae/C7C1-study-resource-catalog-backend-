import { createSqlParams, createSqlValues } from "../createTagsQuery";

test("Create dynamically sql text", () => {
    expect(createSqlValues("#React#Typescript")).toBe("($1, $2), ($3, $4)");
    expect(createSqlValues("#React")).toBe("($1, $2)");
});

test("Create dynamically sql text", () => {
    expect(createSqlParams("#React#Typescript", "hello")).toEqual([
        "#React",
        "hello",
        "#Typescript",
        "hello",
    ]);
});
