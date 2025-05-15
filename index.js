const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 5000;


const mongoURI = 'mongodb://localhost:27017/leadsDb'; 
const client = new MongoClient(mongoURI);

app.use(cors());

app.use((err, req, res, next) => {
  console.error("Backend Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('MongoDB: Connected to the "leadsDb" database successfully!');
  } catch (error) {
    console.error('MongoDB: Failed to connect to the database:', error);
  
    throw error; 
  }
}


app.get('/leads', async (req, res) => {
  try {
    const db = client.db();
    const leadsCollection = db.collection('leadsData');

    const leads = await leadsCollection.find({}).toArray();
     if (!leads || leads.length === 0) {
      console.warn("Backend: No leads found in the database.");
      return res.status(200).json([]); 
    }
    res.json(leads);
    console.log('API: Successfully fetched leads data from "leadsData" collection.');
  } catch (error) {
    console.error('API: Error fetching leads:', error);
    next(error); 
  }
});

app.listen(port, () => {
  console.log(`Server: Server is running on port ${port}`);
});

connectToMongoDB().then(() => {
  
}).catch(err => {
  
    console.error("Server: Failed to start due to database connection error", err);
});

process.on('SIGINT', async () => {
  console.log('Server: Closing MongoDB connection...');
  try {
    await client.close();
    console.log('Server: MongoDB connection closed.');
  } catch (err) {
    console.error("Server: Error closing MongoDB connection", err);
  }
  console.log('Server: Server shutting down...');
  process.exit();
});