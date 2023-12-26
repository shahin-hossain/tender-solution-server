const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = 5000;
const app = express();
//middleware
app.use(cors());
app.use(express.json());

//server running
app.get('/', (req, res) => {
    res.send('Tender Solution Server in Running')
})

//mongoDB user & password from .env
const user = process.env.USER_DB;
const pass = process.env.PASS_DB;

const uri = `mongodb+srv://${user}:${pass}@cluster0.throxid.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // Connect to the "insertDB" database and access its "haiku" collection
        const tendersDB = client.db("tendersDB").collection('tender');
        //POST data
        app.post('/tenders', async (req, res) => {
            console.log(req.body)
            const newTender = req.body;
            const result = await tendersDB.insertOne(newTender)
            res.send(result)
        })

        //GET data
        app.get('/tenders', async (req, res) => {
            const cursor = tendersDB.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        //Get data id Wise
        app.get('/tender/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await tendersDB.findOne(query);

            res.send(result);
        })

        //Update data

        app.put('/tender/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTender = req.body;

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateTender = {
                $set: {
                    scope: updatedTender.scope,
                    caller: updatedTender.caller,
                    schedulePrice: updatedTender.schedulePrice,
                    security: updatedTender.security,
                    method: updatedTender.method
                }
            }
            const result = await tendersDB.updateOne(filter, updateTender, options);

            res.send(result);

        })

        //Delete Data 
        app.delete('/tenders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tendersDB.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();/
    }
}
run().catch(console.dir);


//server port
app.listen(port, () => {
    console.log(`Tender Solution server running port on ${port}`)
})