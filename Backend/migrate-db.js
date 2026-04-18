const { MongoClient } = require('mongodb');
require('dotenv').config();

// Replace this with your new Atlas Connection String!
const ATLAS_URI = 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/Prithvii?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://127.0.0.1:27017/Prithvii';

async function migrate() {
    let localClient, atlasClient;
    
    try {
        console.log('Connecting to Local Database...');
        localClient = await MongoClient.connect(LOCAL_URI);
        const localDb = localClient.db('Prithvii');
        
        console.log('Connecting to Atlas Database...');
        atlasClient = await MongoClient.connect(ATLAS_URI);
        const atlasDb = atlasClient.db('Prithvii');
        
        // Let's get all collections in the local database
        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections. Starting migration...`);
        
        for (let collection of collections) {
            const colName = collection.name;
            console.log(`\n Migrating collection: ${colName}`);
            
            // Get all documents from local collection
            const docs = await localDb.collection(colName).find({}).toArray();
            
            if (docs.length === 0) {
                console.log(` - Collection '${colName}' is empty. Skipping.`);
                continue;
            }
            
            console.log(` - Backing up ${docs.length} documents...`);
            
            // Insert documents into atlas collection
            try {
                // Delete existing ones to avoid duplicate key errors if run multiple times
                await atlasDb.collection(colName).deleteMany({}); 
                await atlasDb.collection(colName).insertMany(docs);
                console.log(` - Successfully migrated '${colName}'.`);
            } catch (err) {
                console.error(` - Error inserting into '${colName}':`, err.message);
            }
        }
        
        console.log('\nMigration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
    }
}

migrate();
