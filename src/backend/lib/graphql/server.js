const { ApolloServer, PubSub } = require('apollo-server-hapi');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const pubSub = new PubSub();

exports.web = () => {
    return new ApolloServer({
        typeDefs,
        resolvers,
        context: {
            pubSub,
        },
    });
};
