const GQLFactory = require('../lib/graphql/server');

module.exports = {
    name: 'ad-apollo-graphql',
    version: '1.0.0',
    register: async (server) => {
        const gqlServer = GQLFactory.web();
        await gqlServer.applyMiddleware({
            app: server,
        });
        await gqlServer.installSubscriptionHandlers(server.listener);
    },
};
