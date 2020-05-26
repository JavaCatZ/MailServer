import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import DbClient = require('../DbClient');
import * as Conf from '../Service';
import { MessageI } from '../Interfaces';
import nodemailer from 'nodemailer';

const messageRouter = Router();

messageRouter.post('/data', bodyParser.json(), (req : Request, res: Response) => {

    res.setHeader('Content-Type', 'application/json');      
    if(DbClient.db === null)
    {
        Conf.setLog('Error db connection...', 'error');
        res.status(500).send(new Error('Error db connection...'));
    }

    let message: MessageI = Conf.getMsg(req.body.message);
    const output: string = Conf.getOutHtml(message);
    const fullMail = Conf.getMail(message, output);
  
    let smtpTransport;
    try 
    {
        smtpTransport = nodemailer.createTransport({ 
            host: Conf.SMTP_HOST,
            port: Conf.SMTP_PORT,
            secure: Conf.SECURE,
			requireTLS: Conf.REQUIRE_TLS,
            auth: {
                user: Conf.USER_AUTH,
                pass: Conf.USER_PASS
            }
        });
    } 
        catch (error) 
        {
            Conf.setLog('Mail server error: ' + error.message, 'error');
            return res.status(500).send(new Error('Mail server error...'));
        }

    smtpTransport.sendMail(fullMail, (error, info) => {
        if (error) 
        {
            Conf.setLog('Mail wasn\'t sent: ' + error.message, 'error');
            return res.status(500).send(new Error('Error with mail message from server...'));
        } 
            else 
            {
                try
                {
                    DbClient.db.collection('messages').insertOne(message, function(err: Error, res) 
                    {
                        if (err) 
                            throw err;
                    });
                    Conf.setLog('Server success send and save mail from: ' + message.vessel, 'success');
                    res.status(200).send('Success server work...');
                }
                    catch(error)
                    {
                        Conf.setLog('Database error: ' + error.message, 'error');
                        res.status(500).send('Database error: ' + error.message);
                    }
            }
    });
});

export default messageRouter;