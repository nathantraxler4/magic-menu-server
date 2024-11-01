const config = {
    overwrite: true,
    schema: "./src/graphql/schema.graphql",
    generates: {
        "src/__generated__/types.ts": {
            plugins: ["typescript", "typescript-resolvers"]
        }
    }
};
export default config;
