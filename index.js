const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();
const port= process.env.PORT  || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.Mongo_Name}:${process.env.Mongo_Pasword}@cluster0.wy4ghoc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();

    // database collection name
    const userdata=client.db('assignment-12').collection('Users');
    const added_tasks = client.db('assignment-12').collection('TaskCollection');

    app.post('/tasks', async(req,res)=>{
      const newTask=req.body;
      const result = await added_tasks.insertOne(newTask);
      res.send(result); 
    })

    app.post('/users', async(req,res)=>{
        const newUser=req.body;
        const query={email:newUser.email};
        const existingUser=await userdata.findOne(query);
        if(existingUser){
            return res.send({message:"user already exists",insertedId:null})
        }
        const result = await userdata.insertOne(newUser);
        res.send(result); 
    })

    app.get('/users', async(req,res) =>{
        const cursor=userdata.find();
        const users = await cursor.toArray();
        res.send(users);
    })

    app.get('/tasks/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const task=await added_tasks.findOne(query);
      res.send(task);
    })

    app.get('/tasks', async(req,res) =>{
      const cursor=added_tasks.find();
      const users = await cursor.toArray();
      res.send(users);
  })

app.get('/tasks/:email',async(req,res)=>{
       const email = req.params.email;
        const query = { creator_email: email };
        const result = await added_tasks.find(query).sort({ current_time: -1 }).toArray();
        res.send(result);
})

    app.put('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedstatus =req.body;
      const coin = {
          $set: {
              coins:updatedstatus.coins
          }
      }
      const result = await userdata.updateOne(filter,coin,options);
      res.send(result);
    })

    app.put('/tasks/:id',async(req,res)=>{
      const id=req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedstatus =req.body;
      const coin = {
          $set: {
            task_title:updatedstatus.task_title,
            task_details:updatedstatus.task_details,
            submission_info:updatedstatus.submission_info
          }
      }
      const result = await added_tasks.updateOne(filter,coin,options);
      res.send(result);
    })

    app.delete('/tasks/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const books=await added_tasks.deleteOne(query);
      res.send(books);
    })


    app.get('/users/:email', async(req,res) =>{
        const email = req.params.email;
        const query = { email: email };
        const result = await userdata.find(query).toArray();
        res.send(result);
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/",(req,res) =>{
    res.send("Server is running");
})

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
})