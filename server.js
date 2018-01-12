const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);

const createResponse = require('./helper/createResponse.js');
const data = {};
const DATA_PATH = path.join(__dirname, 'data');

fs.readdirSync(DATA_PATH).forEach(fp => {
    const key = fp.substr(0, fp.lastIndexOf('.'))
    const ext = fp.substr(fp.lastIndexOf('.'));
    let fn = null;
    if (/json$/.test(ext)) {
        d = createResponse(require(path.join(DATA_PATH, fp)))
    } else {
        fn = require(path.join(DATA_PATH, fp))
        try {
            d = createResponse(fn())
        } catch (err) {
            console.log(key, err);
            d = createResponse(fn);
        };
    }
    data[key] = d;
})

fs.writeFileSync('db.json', JSON.stringify(data));

const router = jsonServer.router('db.json');

server.use(function(req, res, next) {
    req.method = 'GET';
    next();
})

server.use(middlewares)

server.get('/getTree', function(req, res, next) {
    const getTree = require(path.join(DATA_PATH, 'getTree.js'));
    getTree('route').call(null, req, res, next)
})

server.get('/qryDict', function(req, res, next) {
    const getTree = require(path.join(DATA_PATH, 'qryDict.js'));
    getTree('route').call(null, req, res, next)
})

server.use(router)

const port = 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on ${port}`)
})
