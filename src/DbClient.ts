import { MongoClient, Db } from 'mongodb';
import { URL_ATLAS, OPTIONS } from './Service';

class DbClient { //Singletone for mongodb connection
    private static mongoClient: DbClient;
    public db: Db;
    private constructor() {}
    
    public async connect() {
        if(!this.db)
            this.db = await MongoClient.connect(URL_ATLAS, OPTIONS);
        return this.db;
    }

    public static getInstance(): DbClient {
        if(!DbClient.mongoClient) {
            DbClient.mongoClient = new DbClient()
        }
        return DbClient.mongoClient;
    }
}

export = DbClient.getInstance();