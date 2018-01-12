const list = [];
const r = ()=>Math.random().toString(36).substr(2,8);

for (let i = 0, len = 4; i < len; i++) {
    list.push({
        "org_id":    ''+i,
        "org_name":  r(),
        "parent_id": "",
    })

    for (let j = 0, len = Math.floor(Math.random() * 5); j < len; j++) {
        const org_id = `${i}-${j}`;
        list.push({
            org_id,
            "org_name":  r(),
            "parent_id": ''+i,
        })
        if (len > 2) {
            for (let z = 0, len = Math.floor(Math.random() * 5); z < len; z++) {
                list.push({
                    "org_id": `${org_id}-${z}`,
                    "org_name":  r(),
                    "parent_id": org_id
                })
            }
        }
    }
}

module.exports = function(type) {
    return {
        "list": list
    }
};
