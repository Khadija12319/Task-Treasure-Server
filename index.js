const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port= process.env.PORT  || 5000;
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    // await client.connect();

    // database collection name
    const userdata=client.db('assignment-12').collection('Users');
    const added_tasks = client.db('assignment-12').collection('TaskCollection');
    const submission_collection = client.db('assignment-12').collection('Submission Collection');
    const payment_collection=client.db('assignment-12').collection('Payment Collections');
    const WITHDRAW_COLLECTION=client.db('assignment-12').collection('WITHDRAW_COLLECTION');

    // post requests


    app.post('/submissions',async(req,res)=>{
      const newTask=req.body;
      const result = await submission_collection.insertOne(newTask);
      res.send(result);
    })

    app.get('/users/:email', async(req,res) =>{
      const email = req.params.email;
      const query = { email: email };
      const result = await userdata.find(query).toArray();
      res.send(result);
  })

    app.get('/users', async(req,res) =>{
      const cursor=userdata.find();
      const users = await cursor.toArray();
      res.send(users);
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

    // app.put('/users/:id',async(req,res)=>{
    //   const id=req.params.id;
    //   const filter = {_id: new ObjectId(id)};
    //   const options = { upsert: true };
    //   const updatedstatus =req.body;
    //   const coin = {
    //       $set: {
    //           coins:updatedstatus.coins
    //       }
    //   }
    //   const result = await userdata.updateOne(filter,coin,options);
    //   res.send(result);
    // })
app.put('/users/:identifier', async(req, res) => {
      const identifier = req.params.identifier;
  const updatedStatus = req.body;

  let query = {};
  if (ObjectId.isValid(identifier) && identifier.length === 24) {
    query = { _id: new ObjectId(identifier) };
  } else {
    query = { email: identifier };
  }

  const options = { upsert: true };
  const update = {};
    if (updatedStatus.role) {
        update.role = updatedStatus.role;
    }
    if (updatedStatus.coins) {
        update.coins = updatedStatus.coins;
    }

    const result = await userdata.updateOne(query, { $set: update }, options);
    res.send(result);
    });

    // get requests

    app.post('/tasks', async(req,res)=>{
      const newTask=req.body;
      const result = await added_tasks.insertOne(newTask);
      res.send(result); 
    })

    app.post('/withdraws', async(req,res)=>{
      const newWithDraw=req.body;
      const result = await WITHDRAW_COLLECTION.insertOne(newWithDraw);
      res.send(result); 
    })

    app.get('/withdraws', async(req,res) =>{
      const cursor=WITHDRAW_COLLECTION.find();
      const withdraws = await cursor.toArray();
      res.send(withdraws);
  })

    app.get('/submissions', async(req,res) =>{
      const cursor=submission_collection.find();
      const users = await cursor.toArray();
      res.send(users);
  })

  app.get('/tasks', async(req,res) =>{
    const cursor=added_tasks.find();
    const users = await cursor.toArray();
    res.send(users);
})

app.get('/submissions/:email', async(req,res) =>{
  const email = req.params.email;
  const query = {
    $or: [
        { worker_email: email },
        { creator_email: email }
    ]
};
  const result = await submission_collection.find(query).toArray();
  res.send(result);
})

app.get('/tasks/:identifier', async(req, res) => {
  const identifier = req.params.identifier;

  // Check if identifier is a valid ObjectId (for fetching by _id)
  if (ObjectId.isValid(identifier)) {
      const query = { _id: new ObjectId(identifier) };
      const task = await added_tasks.findOne(query);
      if (task) {
          res.send(task);
      } else {
          res.status(404).send('Task not found');
      }
  } else {
      // Assume identifier is an email (for fetching by creator_email)
      const query = { creator_email: identifier };
      const result = await added_tasks.find(query).sort({ current_time: -1 }).toArray();
      res.send(result);
  }
});




// put requests




    app.put('/submissions/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }; 
      const options = { upsert: true };
      const updatedStatus = req.body;
  
          const result = await submission_collection.updateOne(filter, 
            { $set: { status: updatedStatus.status } 
          },options);
          res.send(result);
          
      }
  );
  

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


    // delete requests

    app.delete('/tasks/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const books=await added_tasks.deleteOne(query);
      res.send(books);
    })
    app.delete('/withdraws/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const books=await WITHDRAW_COLLECTION.deleteOne(query);
      res.send(books);
    })
    app.delete('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const books=await userdata.deleteOne(query);
      res.send(books);
    })

// payment intent
app.post('/create-payment-intent', async(req,res)=>{
  const {price} =req.body;
  const amount= parseInt(price*100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount:amount,
    currency:'usd',
    payment_method_types:['card']
  });
  res.send({
    clientSecret:paymentIntent.client_secret
  })
})
// payment collection
app.post('/payments',async(req,res)=>{
  const payment=req.body;
  const paymentResult=await payment_collection.insertOne(payment);
  res.send(paymentResult);
})

app.get('/payments',async(req,res)=>{
      const cursor=payment_collection.find();
      const payments = await cursor.toArray();
      res.send(payments);
})

app.get('/payments/:email',async(req,res)=>{
  const email = req.params.email;
   const query = { email: email };
   const result = await payment_collection.find(query).toArray();
   res.send(result);
})



    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

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