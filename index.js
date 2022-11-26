const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DETABASE_USER}:${process.env.DETABASE_PASSWORD}@cluster0.2redmm4.mongodb.net/?retryWrites=true&w=majority`;

const verifyToken = (req, res, next) => {
   const authorization = req.headers.authorization;

   if (!authorization) {
      return res.status(401).send({ message: 'unauthorized access cannot get accesstoken' });
   }
   const token = authorization.split(' ')[1];
   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
      if (err) {
         return res.status(401).send({ message: 'forbidden access' });
      }

      req.decoded = decoded;

      next();
   });
};

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

      app.get('/jwt', async (req, res) => {
         const email = req.query.email;
         const query = { email: email };
         const user = await userCollection.findOne(query);
         if (user) {
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            return res.send({ accessToken: token });
         }
         console.log(user);
         res.status(403).send({ accessToken: 'token' });
      });

      app.post('/users', async (req, res) => {
         const user = req.body;
         const result = await userCollection.insertOne(user);
         res.send(result);
      });

      app.post('/users/:email', async (req, res) => {
         const email = req.params.email;
         const user = req.body;
         const query = { email: email };
         const alreadyExist = await userCollection.findOne(query);
         if (alreadyExist) {
            return res.status(403).send({ message: 'already exist' });
         }
         const result = await userCollection.insertOne(user);
         res.send(result);
      });

      app.get('/users/:role', async (req, res) => {
         const role = req.params.role;
         const query = { role: role };
         const result = await userCollection.find(query).toArray();
         res.send(result);
      });

      app.delete('/users/:id', verifyToken, async (req, res) => {
         const email = req.query.email;
         const decodedEmail = req.decoded.email;
         if (email !== decodedEmail) {
            return res.status(403).send({ message: 'Forbidden access' });
         }
         const filter = { email: decodedEmail };
         const user = await userCollection.findOne(filter);
         if (user.role !== 'admin') {
            return res.status(403).send({ message: 'Forbidden access' });
         }

         const id = req.params.id;
         const query = { _id: ObjectId(id) };
         const result = await userCollection.deleteOne(query);
         res.send(result);
      });

      app.get('/users/admin/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const user = await userCollection.findOne(query);
         res.send({ isAdmin: user?.role === 'admin' });
      });
      app.get('/users/seller/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const user = await userCollection.findOne(query);
         res.send({ isSeller: user?.role === 'seller' });
      });
      app.get('/users/buyer/:email', async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const user = await userCollection.findOne(query);
         res.send({ isBuyer: user?.role === 'buyer' });
      });

      app.get('/cars', async (req, res) => {
         const query = {};
         const result = await carCollection.find(query).toArray();
         res.send(result);
      });

      app.get('/cars/:email', verifyToken, async (req, res) => {
         const decodedEmail = req.decoded.email;
         const email = req.params.email;
         if (email !== decodedEmail) {
            return res.status(403).send({ message: 'Forbidden access' });
         }
         const query = { sellerEmail: email };
         const result = await carCollection.find(query).toArray();
         res.send(result);
      });

      app.post('/cars', verifyToken, async (req, res) => {
         const email = req.query.email;
         const decodedEmail = req.decoded.email;
         if (email !== decodedEmail) {
            res.status(403).send({ message: 'Forbidden access' });
         }
         const query = { email: decodedEmail };
         const user = await userCollection.findOne(query);
         if (user.role !== 'seller') {
            return res.status(403).send({ message: 'Forbidden Access Only seller can add product' });
         }
         const car = req.body;
         const result = await carCollection.insertOne(car);
         res.send(result);
      });

      app.delete('/cars/:id', verifyToken, async (req, res) => {
         const decodedEmail = req.decoded.email;
         const email = req.query.email;
         if (email !== decodedEmail) {
            res.status(403).send({ message: 'Forbidden Access' });
         }
         const filter = { email: decodedEmail };
         const user = await userCollection.findOne(filter);
         if (user.role !== 'seller') {
            return res.status(403).send({ message: 'Forbidden Access' });
         }
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

      app.get('/bookings/:email', verifyToken, async (req, res) => {
         const decodedEmail = req.decoded.email;
         const email = req.params.email;
         if (decodedEmail !== email) {
            return res.status(403).send({ message: 'Forbidden Access' });
         }
         const filter = { email: decodedEmail };
         const user = await userCollection.findOne(filter);
         if (user.role !== 'buyer') {
            return res.status(403).send({ message: 'Forbidden access' });
         }
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
