const MongoClient = require('mongodb').MongoClient;

class MongoAPI {
    static async connectMongo() {
        const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
        const MONGODB_DB = process.env.MONGODB_DB || 'ambulu_admin';
        const client = await MongoClient.connect(MONGODB_URL, {
            useUnifiedTopology: true
        });
        return client.db(MONGODB_DB);
    }

    static async insertOne(data, collection) {
        const dbClient = await this.connectMongo();
        return await dbClient.collection(collection).insertOne(data);
    }

    static async find(query, collection) {
        const dbClient = await this.connectMongo();
        return await dbClient.collection(collection).find(query).toArray();
    }

    static async findOne(query, collection) {
        const result = await this.find(query, collection);
        return result[0];
    }
}

module.exports = MongoAPI;