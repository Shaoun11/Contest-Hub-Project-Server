const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

                        


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uzun1bo.mongodb.net/?retryWrites=true&w=majority`;

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
    const database = client.db("contestHub").collection("contest");
    await client.connect();

    //get contest data
    app.get("/allcontest", async (req, res) => {
        let query = {};
        const name = req.query.title;
        if (name) {
          query.title = name;
        }
  
        const page = parseInt(req.query.page);
        const limit = 9;
        const skip = page * limit;
  
        const result = await database
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort({ participants: "desc" })
          .toArray();
        const total = await database.countDocuments();
        res.send({ result, total });
      });

       //get contest single data
       app.get("/allcontest/:_id", async (req, res) => {
        const id = req.params._id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await database.findOne(query);
        res.send(result);
      });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("Contest Hub...");
  }); 
  
  app.listen(port, () => {
    console.log(`Contest-Hub server is Running on port ${port}`);
  });