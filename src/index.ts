import Express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { Db } from 'mongodb';
import * as Conf from './Service';
import DbClient = require('./DbClient');

import userRouter from './controllers/UserController';
import docsRouter from './controllers/DocsController';
import projRouter from './controllers/ProjectController';
import vesRouter from './controllers/VesselController';
import messageRouter from './controllers/MessageController';
const server: Application = Express();
let db: Db;

server.use(Express.static(__dirname + "/public"));
server.use(bodyParser.json());

server.use((req : Request, res: Response, next: NextFunction) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,POST');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

server.use('/', userRouter);
server.use('/', docsRouter);
server.use('/', projRouter);
server.use('/', vesRouter);
server.use('/', messageRouter);

server.get('/docs/:type', async (req : Request, res: Response) => { //Get the set of documents from MongoDB by name (collection's name = type param)
    let docs: Array<Object>;
    try {
        docs = await Conf.getSpecialDoc(db, req.params.type)
        res.send(JSON.stringify(docs));
    }    
        catch(error) {
            Conf.setLog('Db error: ' + error.message, 'error');
            res.status(500).send(new Error('Error db connection in GET query...'));
        }  
});

server.get('/ships', async (req : Request, res: Response) => {
    let ships: Array<Object>;
    try {
        ships = await Conf.getShipsInfo(db)
        res.send(ships);
    }    
        catch(error) {
            Conf.setLog('Db error: ' + error.message, 'error');
            res.status(500).send(new Error('Error db connection in GET query...'));
        }  
});

server.listen(3030, async () => {
    try {
        db = await DbClient.connect();
        Conf.setLog('Connected to db. Server listening port 3030...', 'success');
    }
        catch(error) {
            Conf.setLog('Server error: ' + error.message, 'error');
        }
})

process.on("SIGINT", () => {
    db.serverConfig.removeAllListeners();
    Conf.setLog('Server stoped...', 'success');
    process.exit();
})