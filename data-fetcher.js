import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'lighthouseDB';
const metricsCollectionName = 'metrics';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function fetchData() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(metricsCollectionName);

        const data = await collection.find({}, { projection: { _id: 0, fcp: 1, lcp: 1, fmp: 1 } }).toArray();

        await client.close();

        return data;
    } catch (err) {
        console.error('Error fetching data:', err);
        await client.close();
        throw err;
    }
}

export { fetchData };
