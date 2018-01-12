const createResponse = require('../helper/createResponse.js');
const routeHandler = function(req, res, next) {
    const {request } = JSON.parse(Object.keys(req.body)[0]);
    const name = request.name;
    let list = [];
    for (let i = 0, len = 4; i < len; i++) {
        list.push({
            name : `${name}-${i}`,
            id :`${name}-id-${i}`
        })
    }

    res.json(createResponse({ list }))
}

module.exports = function(type) {
    if (type === 'route') {
        return routeHandler
    } else {
        return {
            "list": []
        }
    }
};
