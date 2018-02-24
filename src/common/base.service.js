/* const { nodeList,linkToNodeList  } = require("../../data/topoNodeList");
console.log(nodeList,linkToNodeList); */
const createReqParam = (method, request) => {
    return {
        "header": {
            "requestseq": "" + Date.now(),
            method
        },
        request
    }
}

const SERVER_PATH = isProd ? "/IMSMonitor/apphub/api/" : "/IMSMonitor/apphub/api/"; //"http://localhost:3000/";

function  createRequest({method,param}) {
    return new Promise((res, rej) => {
        $.ajax({
            headers: {
                Accept: "application/json; charset=utf-8"
            },
            method: "POST",
            url: `${SERVER_PATH}${method}`,
            dtatType: 'json',
            data:JSON.stringify(createReqParam(method, param)),
            success(resp) {
                res(resp);
            },
            error(err) {
                rej(err);
            }
        })
    })
}

export default function requestFactory(method) {
    return function(param) {
        return createRequest({method,param});
    }
}
