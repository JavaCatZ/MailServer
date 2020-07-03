import { Router, Request, Response } from 'express';
import { getProjFiles } from '../Service';

const filesRouter = Router();

filesRouter.get('/projfiles', (req : Request, res: Response) => {
    getProjFiles('./dist', function (err : Error, files : FileList) {
        console.log(err || files);
    });
});

export default filesRouter;