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
    const userdatabase = client.db("contestHub").collection("users");
 

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
       app.get("/users/:_id", async (req, res) => {
        const id = req.params._id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await userdatabase.findOne(query);
        res.send(result);
      });      

      app.post("/allcontest", async  (req, res) => {
        const contest = req.body;
        const result = await database.insertOne(contest);
        console.log(result);
        res.send(result);
      }); 

      //post user

      app.post('/users', async (req, res) => {
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await userdatabase.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userdatabase.insertOne(user);
        res.send(result);
      });
      
      //get user

      app.get('/users',  async (req, res) => {
        const result = await userdatabase.find().toArray();
        res.send(result);
      });
      app.get('/contest',  async (req, res) => {
        const result = await database.find().toArray();
        res.send(result);
      });
//updated Add contest
app.put("/allcontest/:id", async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    console.log("id", id, data);
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedata = {
      $set: {
        title: data.title,
        image: data.image,
        participants: data.participants,
        startDate: data.startDate,
        endDate: data.endDate,
        price: data.price,
        description: data.description,
        prizes: data.prizes,

      },
    };
    const result = await database.updateOne(filter, updatedata, options);
    res.send(result);
  });

      app.get('/users/admin/:email', async (req, res) => {
        const email = req.params.email;
  
       
  
        const query = { email: email };
        const user = await userdatabase.findOne(query);
        let admin = false;
        if (user) {
          admin = user?.role === 'admin';
        }
        res.send({ admin });
      })

     
      
    app.patch('/users/admin/:id',  async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'admin',
          }
        }
        const result = await userdatabase.updateOne(filter, updatedDoc);
        res.send(result);
      })

      app.delete('/users/:_id',  async (req, res) => {
        const id = req.params._id;
        const query = { _id: new ObjectId(id) }
        const result = await userdatabase.deleteOne(query);
        res.send(result);
      })

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