const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const path = require('path');

const homeRoute = require('../lib/routes/home');
const assetsRoute = require('../lib/routes/assets');

const startServer = async () => {
    const server = new Hapi.Server({
        port: process.env.PORT || 4000,
        host: '0.0.0.0',
        routes: {
            files: {
                relativeTo: path.resolve(__dirname, 'public'),
            },
        },
    });

    server.route([
        homeRoute,
        assetsRoute,
    ]);

    await server.register([
        Inert,
        {
            plugin: require('../plugins/graphql'),
        }
    ]);

    await server.start();
    console.log(`Server started at: ${server.info.uri}`);
};

startServer();
