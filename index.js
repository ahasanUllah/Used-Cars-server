const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DETABASE_USER}:${process.env.DETABASE_PASSWORD}@cluster0.2redmm4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverApi: ServerApiVersion.v1,
});

const run = async () => {
   try {
      const carCollection = client.db('usedcars').collection('cars');
      const categoryCollection = client.db('usedcars').collection('category');

      app.get('/cars', async (req, res) => {
         const query = {};
         const result = await carCollection.find(query).toArray();
         res.send(result);
      });

      app.get('/category/:id', async (req, res) => {
         const id = req.params.id;
         console.log(id);

         const query = { categoryid: id };
         const result = await carCollection.find(query).toArray();
         res.send(result);
      });

      app.get('/category', async (req, res) => {
         const query = {};
         const result = await categoryCollection.find(query).toArray();
         res.send(result);
      });
   } finally {
   }
};
run().catch((err) => console.log(err));

app.get('/', (req, res) => {
   res.send('used cars server is running');
});

app.listen(port, () => `Used cars running on ${port}`);
