import { readFileSync } from 'fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import resolvers from './graphql/resolvers.js';
import mongoose from 'mongoose';

const typeDefs = readFileSync('./dist/graphql/schema.graphql', { encoding: 'utf-8' });

interface MyContext {
    // Define context shared across all resolvers and plugins 
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
});

mongoose.connect('mongodb://127.0.0.1:27017/test');
  
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
