const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();
const port= process.env.PORT  || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


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