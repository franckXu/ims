const nodeListNum = 5;
const idPrefix = 'x';
const typeEnum = ['0', '1']; //0-端口、1-设备

const idList = [];
for (var i = 0, len = nodeListNum; i < len; i++) {
    idList.push(`${idPrefix}${i}`)
}

const rangeRandom = range => range[Math.floor(Math.random() * range.length)]

const createLinkToNodeList = self => {
    const notSelfIdList = idList.filter(id => id !== self);
    const ret = []
    for (var i = 0, len = Math.floor(4 * Math.random()); i < len; i++) {
        ret.push({
            id: notSelfIdList[Math.floor(Math.random() * notSelfIdList.length)],
            color: ""
        })
    }

    return ret;
}

/* export const nodeList = idList.map(id => {
    return {
        "id": `${id}`,
        "name": `${id}`,
        "type": rangeRandom(typeEnum),
        "positionX": /x0|x1|x3/.test(id) ? "" : 850 * Math.random(),
        "positionY": /x0|x1|x3/.test(id) ? "" : 550 * Math.random(),
    };
}); */

const _linkToNodeList = [];

idList.forEach(id => {
    let linkToNode = idList.filter(idx => idx !== id);
    for (var i = 0, len = Math.floor(Math.random() * 3) ; i < len; i++) {
        _linkToNodeList.push({
            linkId:""+Math.floor(Math.random() * 1000),
            fromEquipment:id,
            toEquipment:linkToNode[i],//to设备主键,
            type:rangeRandom(['1','0']), //1-有方向，0-无方向
        });
    };
});

module.exports = function(){
    return {
        list : []
    };
}
