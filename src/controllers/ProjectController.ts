import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import DbClient = require('../DbClient');
import * as Conf from '../Service';
import { ProjectI } from '../Interfaces';

const projRouter = Router();

projRouter.post('/project', bodyParser.json(), (req : Request, res: Response) => {
    try
    {
        let project: ProjectI = Conf.getProject(req.body.project);
        DbClient.db.collection('projects').insertOne(project, function(err: Error, res) {
            if (err) 
                throw err;
        });
        res.status(200).send('Success server work...');
    }
        catch(error) {
            Conf.setLog('Database error: ' + error.message, 'error');
            res.status(500).send('Database error: ' + error.message);
        }
});

projRouter.put('/project', bodyParser.json(), async (req : Request, res: Response) => {
    try
    {
        let lastName = req.body.vessel.prevName;
        let project: ProjectI = Conf.getProject(req.body.project);
        await Promise.all([
            await DbClient.db.collection('projects').updateOne({ name: lastName } , { $set : {
                name : project.name,
                name_en : project.name_en,
                date_start : project.date_start,
                date_end : project.date_end
            } }),
            await DbClient.db.collection('messages').updateOne({ vessel: lastName } , { $set : {
                    project : project.name,
                    datestart : project.date_start,
                    dateend : project.date_end
                }
            })]).then(() => {
                res.status(200).send('Ship\'s doc was modified...');
            })
                .catch((error) => {
                    throw new Error(error);
                })
    }
        catch(error) {
            Conf.setLog('Database error: ' + error.message, 'error');
            res.status(500).send('Database error: ' + error.message);
        }
});

projRouter.delete('/project', bodyParser.json(), async (req : Request, res: Response) => {
    try
    {
        let project: ProjectI = Conf.getProject(req.body.project);
        if (await DbClient.db.collection('messages').findOne({ project: project.name })) {
            res.status(500).send('This doc is in messages table...');
        };

        try {
            await DbClient.db.collection('projects').deleteOne({ name: project.name, name_en: project.name_en})
            res.status(200).send('Project was success deleted...');
        }
            catch(error) {
                throw new Error(error);
            }

    }
        catch(error) {
            Conf.setLog('Database error: ' + error.message, 'error');
            res.status(500).send('Database error: ' + error.message);
        }
});

export default projRouter;