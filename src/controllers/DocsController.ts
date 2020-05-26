import { Router, Request, Response } from 'express';
import DbClient = require('../DbClient');
import * as Conf from '../Service';

const docsRouter = Router();

docsRouter.get('/alldocs', (req : Request, res: Response) => {
    let alldocs: Array<Object> = [];
    
    try {
        Promise.all([
            Conf.getShipsInfo(DbClient.db)
                    .then((value) => {
                        alldocs.push({ docs: value })
                    })
                    .catch((error) => {
                        throw new Error(error)
                    }),
            Conf.getSpecialDoc(DbClient.db, 'projects')
                    .then((value) => {
                        alldocs.push({ projects: value })
                    })
                    .catch((error) => {
                        throw new Error(error)
                    }),
            Conf.getSpecialDoc(DbClient.db, 'ships')
                    .then((value) => {
                        alldocs.push({ ships: value })
                    }) 
                    .catch((error) => {
                        throw new Error(error)
                    })]
        ).then(() => {
            res.send(alldocs);
        }).catch((error) => { throw new Error(error) })
    }  
        catch(error) {
            Conf.setLog('Db error: ' + error.message, 'error');
            res.status(500).send(new Error('Error db connection in GET query...'));
        }  
});

export default docsRouter;