import path from 'path';
import { MessageI, ShipI, ProjectI }  from './Interfaces';
import date from 'date-and-time';
import fs from 'fs';
import os from 'os';
import { Db } from 'mongodb';

/*********************For NodeMailer***************************/
export const SMTP_HOST: string = 'smtp.office365.com';
export const SMTP_PORT: number = 587;
export const USER_AUTH: string = 'disp@mage.ru';
export const USER_PASS: string = 'Qomo69541';
export const RECEIVER: string = 'newdisp@mage.ru';
export const SECURE: boolean = false;       //  settings for STARTTLS
export const REQUIRE_TLS: boolean = true;   //

/*********************For MongoDb******************************/
export const URL: string = "mongodb://127.0.0.1:27017/magemap";
export const URL_ATLAS: string = "mongodb://cat:6953472789@cluster0-shard-00-00-musba.mongodb.net:27017,cluster0-shard-00-01-musba.mongodb.net:27017,cluster0-shard-00-02-musba.mongodb.net:27017/magemap?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"
export const OPTIONS = {
    appname: "contserverts",
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
};

/************************For logs******************************/

function _getCurrentDate(): string
{
    return date.format(new Date(), 'DD-MMM-YYYY HH:mm:ss A');
}

/**************************************************************/

export function getOutHtml(message: MessageI) : string  //format html message for nodemailer mail content
{
    let outHtml: string = `<div style="font-size:20px"><p>Поступила форма:</p>
                    <h3>Судно: ${message.vessel}</h3>
                        <ul>  
                            <li>Время: ${message.time}</li>
                            <li>Дата: ${message.date}</li>
                            <li>Широта: ${message.lat}</li>
                            <li>Долгота: ${message.longi}</li>
                            <li>Курс: ${message.course}°</li>
                            <li>Скорость: ${message.speed} уз.</li>
                            <li>Экипаж: ${message.crew} чел.</li>
                            <li>Остаток топлива: ${message.fuel}т</li>
                            <li>Остаток масла: ${message.oil}т</li>
                            <li>Остаток пресной воды: ${message.water}т</li>
							<li>Дата предыдущей бункеровки: ${message.prev_bunker}</li>
                            <li>Дата следующей бункеровки: ${message.bunker}</li>
                            <li>Температура: ${message.temp}C°</li>
                            <li>Скорость ветра: ${message.wind} м/с</li>
                            <li>Направление ветра: ${message.wind_direct}°</li>
                            <li>Высота волны: ${message.wave}м</li>
                            <li>Ледовая обстановка: ${message.iceset}</li>
                            <li>Проект: ${message.project}</li>
                            <li>Дата начала проекта: ${message.datestart}</li>
                            <li>Дата окончания проекта: ${message.dateend}</li>
							<li>Статус судна: ${message.vstatus}</li>
                        </ul>
                    <h3>Комментарий:</h3>
                    <p>${message.comment}</p> </div>`;
    return outHtml;
}

export function getMail(message: MessageI, output: string): Object
{
    let mailOptions: Object = {
        from: USER_AUTH, 
        to: RECEIVER,
        subject: 'Форма по судну' + ' ' + message.vessel,
        text: 'Оформленная форма описания по судну',
        html: output
    };

    return mailOptions;
}

export function getMsg(msg: MessageI): MessageI     //get formated message
{
    let message = {
        vessel: msg.vessel,
        time : msg.time,
        date : msg.date,
        lat : msg.lat,
        longi : msg.longi,
        course : msg.course,
        speed : msg.speed,
        crew : msg.crew,
        fuel : msg.fuel,
        oil : msg.oil,
        water : msg.water,
        prev_bunker : msg.prev_bunker,
        bunker : msg.bunker,
        temp : msg.temp,
        wind : msg.wind,
        wind_direct : msg.wind_direct,
        wave : msg.wave,
        iceset : msg.iceset,
        project : msg.project,
        datestart : msg.datestart,
        dateend : msg.dateend,
        vstatus : msg.vstatus,
        comment : msg.comment
    }; 

    return message;
}

export function getVessel(vsl: ShipI): ShipI    //get formated vessel
{
    let vessel = {
        name: vsl.name,
        name_en : vsl.name_en,
        icon : vsl.icon
    }; 

    return vessel;
}

export function getProject(proj: ProjectI): ProjectI    //get formated project
{
    let project = {
        name: proj.name,
        name_en : proj.name_en,
        date_start : proj.date_start,
        date_end : proj.date_end
    }; 

    return project;
}


export function getEmptyMsg(): MessageI //get empty message
{
    let message = {
        vessel: 'none'
    };

    return message;
}

export async function getShipsInfo(db: Db) //get full set of messages with group by ships
{
    let ships: Array<Object> = new Array();
    let result;

    let shipsArr = await getSpecialDoc(db, 'ships');

    for(let i = 0; i < shipsArr.length; i++)  
    {
        result = await _getShipDoc(db, { vessel: shipsArr[i].name } );
        ships.push(result);
    };

    return ships;
}

async function _getShipDoc(db: Db, query: Object)   //get set of messages one ship 
{
    let ships: Array<MessageI> = new Array();
    try
    {
        let result = await db.collection("messages").find(query).sort({ $natural: -1 }).limit(5).toArray();
            result.map((item) => {
                let msg = getMsg(item);
                ships.push(msg);
            });
		if(ships.length === 0)
			ships.push(getEmptyMsg());
        return ships;
    }
        catch(error)
        {
            throw new Error();
        }  
}

export async function getSpecialDoc(db: Db, collect: string) //Project and Vessels
{
    try
    {
        let result = await db.collection(collect).find().toArray();
        return result;
    }
        catch(error)
        {
            throw new Error();
        }  
}

export function setLog(message: String, log_type: string): void     //set logs
{
    const row = _getCurrentDate() + ' --> ' + message + os.EOL;
    fs.appendFile(path.resolve(__dirname + ((log_type === 'success') ? '/Logs/success.log' : '/Logs/errors.log')), row, (err) => {
        if (err) {
            console.error(err)
            return;
        }
    });
}
