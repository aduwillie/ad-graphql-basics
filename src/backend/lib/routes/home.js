module.exports = {
    method: 'GET',
    path: '/',
    options: {
        handler: async (_, h) => {
            return h.file('index.html');
        },
    },
};
