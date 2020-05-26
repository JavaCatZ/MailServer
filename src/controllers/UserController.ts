import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import md5 from 'md5';
import DbClient = require('../DbClient');

const userRouter = Router();

userRouter.post("/auth", bodyParser.json(), async (req: Request, res: Response) => { //auth user
    res.setHeader('Content-Type', 'application/json'); 
    try {
            let login = req.body.user.login;
            let pass = md5(req.body.user.pass);
            let answer = null;
            let doc = await DbClient.db.collection('users').findOne( { login : login }); 
            
            if(!doc)
            {
                answer = {
                    message : 'Введены неверные данные',
                    loginAuth : 'false',
                    passAuth : 'false'
                };
            }
                else
                {
                    if(doc.pass != pass)
                    {
                        answer = {
                            message : 'Введены неверные данные',
                            loginAuth : 'true',
                            passAuth : 'false'
                        };
                    }
                        else
                        {
                            answer = {
                                message : 'Вы авторизованы',
                                loginAuth : 'true',
                                passAuth : 'true'
                            };
                        }
                }

            res.send(JSON.stringify(answer));
    }
      catch(error) {
         res.status(500).send(new Error('Error db connection in GET query...'));
      }
 });

export default userRouter;