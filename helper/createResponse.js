module.exports = function createResponse({ response, header }) {
    let ret = {}
    if (header) {
        ret = { header, response }
    } else {
        ret = {
            header: {
                "rspcode": "0000",
                "rspdesc": "描述",
                "responseseq": "错误原因"
            },
            response: arguments[0]
        }
    }

    return ret;
}
