const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello!!!')
})





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mongodb1.tgvctz1.mongodb.net/?retryWrites=true&w=majority`;

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
        // client.connect();

        const toysCollection = client.db("toysDB").collection("toys");
        const sellersCollection = client.db("toysDB").collection("sellertoys");


        app.get('/sellers', async (req, res) => {
            const cursor = sellersCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/limittoys', async (req, res) => {
            const query = { selleremail: { $exists: true } };
            const result = await toysCollection.find(query).limit(20).toArray();
            res.send(result)
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        app.get('/toys/:email', async (req, res) => {
            const email = req.params.email;
            const query = { selleremail: email };
            const cursor = toysCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })



        app.post('/toys', async (req, res) => {
            const toyForm = req.body;
            console.log(toyForm);
            const result = await toysCollection.insertOne(toyForm);
            res.send(result);
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedToy = req.body;
            const toy = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description
                }
            };
            const result = await toysCollection.updateOne(filter, toy, options);
            res.send(result)
        })

        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
