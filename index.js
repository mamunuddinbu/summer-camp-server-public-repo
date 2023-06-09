const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


/////////////////////////

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nekc4yh.mongodb.net/?retryWrites=true&w=majority`;


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
    await client.connect();




    const usersCollection = client.db("summerCampDB").collection("users");
    const classesCollection = client.db("summerCampDB").collection("classes");

    app.get('/instructor', async (req, res) => {
        const result = await usersCollection.find({ role: 'instructor' }).toArray();
        res.send(result);
      })
    app.get('/student', async (req, res) => {
        const result = await usersCollection.find({ role: 'student' }).toArray();
        res.send(result);
      })
    app.get('/all-user', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      })

      
      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
        })
/////////////////////////////////////////////////////////
app.get('/users/admin/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollection.findOne(query);
  res.send({ isAdmin: user?.role === 'admin' });
})
// Postion for seller =====================================
app.get('/users/instructor/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollection.findOne(query);
  res.send({ inInstructor: user?.role === 'instructor' });
})
// Postion for admin buyer =====================================
app.get('/users/student/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollection.findOne(query);
  res.send({ isStudent: user?.role === 'student' });
})
/////////////////////////////////////////////////////////

    app.get('/classes', async (req, res) => {
        const result = await classesCollection.find().toArray();
        res.send(result);
      })

      app.post('/classes', async (req, res) => {
        try {
          const { className, classImage, availableSeats, price, instructorName, instructorEmail } = req.body;
      
          // Perform any necessary validation or data processing
 //=====================================================     
          // Save the class data to the database
          await classesCollection.insertOne({
            name: className,
            image: classImage,
            availableSeats,
            price,
            instructor: instructorName,
            instructorEmail,
            status: "pending",
            popular: false


          });
      
          res.status(201).json({ message: 'Class added successfully' });
        } catch (error) {
          console.error('Error adding class:', error);
          res.status(500).json({ error: 'Failed to add class' });
        }
      });
////==============================================================      

    app.get('/popular-classes', async (req, res) => {
        const result = await classesCollection.find({popular: true}).toArray();
        res.send(result);
      })
    app.get('/popular-instructor', async (req, res) => {
        const result = await classesCollection.find({popular: true}).toArray();
        res.send(result);
      })



      console.log(process.env.DB_USER);
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

/////////////////////////

app.get('/', (req, res) => {
 res.send('Summer camp server is running')
})

app.listen(port, () => {
    console.log(`Summer camp server is running on port ${port}`);
})