const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
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
      const userCollection = client.db('usedcars').collection('users');
      const bookingCollection = client.db('usedcars').collection('booking');
      const categoryCollection = client.db('usedcars').collection('category');

      app.post('/users', async (req, res) => {
         const user = req.body;
         const result = await userCollection.insertOne(user);
         res.send(result);
      });

      app.get('/users/:role', async (req, res) => {
         const role = req.params.role;
         const query = { role: role };
         const result = await userCollection.find(query).toArray();
         res.send(result);
      });

      app.delete('/users/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await userCollection.deleteOne(query);
         res.send(result);
      });

      app.get('/cars', async (req, res) => {
         const query = {};
         const result = await carCollection.find(query).toArray();
         res.send(result);
      });

      app.get('/cars/:email', async (req, res) => {
         const email = req.params.email;
         const query = { sellerEmail: email };
         const result = await carCollection.find(query).toArray();
         res.send(result);
      });

      app.post('/cars', async (req, res) => {
         const car = req.body;
         const result = await carCollection.insertOne(car);
         res.send(result);
      });

      app.delete('/cars/:id', async (req, res) => {
         const id = req.params.id;

         const query = { _id: ObjectId(id) };
         const result = await carCollection.deleteOne(query);
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
      app.get('/category/single/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await categoryCollection.findOne(query);
         res.send(result);
      });

      app.post('/bookings', async (req, res) => {
         const booking = req.body;
         const result = await bookingCollection.insertOne(booking);
         res.send(result);
      });

      app.get('/bookings/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const result = await bookingCollection.find(query).toArray();
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
