const createResponse = require('../helper/createResponse.js');
const routeHandler = function(req, res, next) {
    const {
        request
    } = JSON.parse(Object.keys(req.body)[0]);
    const id = request.id || '1'
    let list = [];
    if (request.id) {
        for (var i = 0, len = 3, newId; i < len; i++) {
            newId = `${id}_${i}`;
            list.push({
                "id": newId,
                "text": '蒙B' + newId,
                "nodeType": '' + Math.floor(Math.random() * 3), //0-端口、1-设备 、2-组织机构
                "eq" : Math.random() > 0.5,
            })
        }
    } else {
        list = [{
            "id": 96,
            "name": "专业1108",
            "nodeType": "0",
            "position_x": 11,
            "position_y": 11,
            "sort_order": 10,
            "status": "1",
            "text": "专业1108",
            "type": "0",
            "eq" : false
        }, {
            "id": 1107,
            "name": "专业1107",
            "nodeType": "0",
            "parent_id": 96,
            "position_x": 12,
            "position_y": 12,
            "sort_order": 11,
            "status": "1",
            "text": "专业1107",
            "type": "0",
            "eq" : false
        }, {
            "id": 1109,
            "name": "专业1109",
            "nodeType": "0",
            "parent_id": 96,
            "position_x": 11,
            "position_y": 11,
            "sort_order": 10,
            "status": "1",
            "text": "专业1109",
            "type": "0",
            "eq" : false
        }]
    }

    res.json(createResponse({
        list
    }))

}

module.exports = function(type) {
    if (type === 'route') {
        return routeHandler
    } else {
        return {
            "list": [{
                "id": 1,
                "text": "蒙B",
                "nodeType": "2", //0-端口、1-设备 、2-组织机构
            }]
        }
    }
};
