const path = require('path');

module.exports = {
    method: 'GET',
    path: '/assets/{file*}',
    options: {
        handler: async (req, h) => {
            const { file } = req.params;
            return h.file(file);
        },
    },
};
