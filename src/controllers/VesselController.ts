import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import DbClient = require('../DbClient');
import * as Conf from '../Service';
import { ShipI } from '../Interfaces';

const vesRouter = Router();

vesRouter.post('/vessel', bodyParser.json(), (req : Request, res: Response) => {
    try
    {
        let vessel: ShipI = Conf.getVessel(req.body.vessel);
        DbClient.db.collection('ships').insertOne(vessel, function(err: Error, res) {
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

vesRouter.put('/vessel', bodyParser.json(), async (req : Request, res: Response) => {
    try
    {
        let lastName = req.body.vessel.prevName;
        let vessel: ShipI = Conf.getVessel(req.body.vessel);
        await Promise.all([
            await DbClient.db.collection('ships').updateOne({ name: lastName } , { $set : {
                name : vessel.name,
                name_en : vessel.name_en,
                icon : vessel.icon
            } }),
            await DbClient.db.collection('messages').updateOne({ vessel: lastName } , { $set : {
                    vessel : vessel.name
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

vesRouter.delete('/vessel', bodyParser.json(), async (req : Request, res: Response) => {
    try
    {
        let vessel: ShipI = Conf.getVessel(req.body.vessel);
        if (await DbClient.db.collection('messages').findOne({ name: vessel.name })) {
            res.status(500).send('This doc is in messages table...');
        };

        try {
            await DbClient.db.collection('ships').deleteOne({ name: vessel.name, name_en: vessel.name_en})
            res.status(200).send('Ship was success deleted...');
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

export default  vesRouter;