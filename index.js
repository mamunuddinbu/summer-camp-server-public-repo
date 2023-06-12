const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
// const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nekc4yh.mongodb.net/summerCampDB?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: 'Unauthorized access' });
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: "Forbidden access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

async function run() {
  try {
    await client.connect();

    const database = client.db("summerCampDB");
    const usersCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const paymentCollection = database.collection("payments");
    const selectedClassesCollection = database.collection("selectedClasses");

    //JWT

    // const verifyAdmin = async (req, res, next) => {
    //   console.log("hello");
    //   const decodedEmail = req.decoded.email;
    //   console.log(decodedEmail);
    //   const query = { email: decodedEmail };
    //   const user = await usersCollection.findOne(query);
    //   if (user?.role !== 'admin') {
    //     return res.status(403).send({ message: "Forbidden" });
    //   }
    //   next();
    // };

    app.delete("/deleteClass/:id", async (req, res) => {
      const { id } = req.params;

      console.log(id);
      const result = await selectedClassesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      if (result.deletedCount === 0) {
        res.status(404).json({ message: "Class not found 3333" });
        return;
      }
      res.send({ message: "Class deleted successfully" });
    });

    ///////////////////////MyClasses/////////////////////////////
    // Fetch all classes for a specific instructor by email
    app.get("/myclasses", async (req, res) => {
      const instructorEmail = req.query.email;
      const allClasses = await classesCollection
        .find({ instructorEmail })
        .toArray();
      res.send(allClasses);
    });

    // Update a class
    app.put("/classes/:id", async (req, res) => {
      const updatedClass = await classes.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.send(updatedClass);
    });

    ///////////////////////////////////////////////////////////////////////////////
    //API for Manage Classes...........................................................
    app.get("/classes", async (req, res) => {
      const classes = await classesCollection.find().toArray();
      res.send(classes);
    });

    app.put("/approveClass/:id", async (req, res) => {
      const { id } = req.params;
      const result = await classesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved" } }
      );
      res.send(result);
    });

    app.put("/denyClass/:id", async (req, res) => {
      const { id } = req.params;
      const result = await classesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "denied" } }
      );
      res.send(result);
    });

    app.post("/sendFeedback/:id", async (req, res) => {
      const { id } = req.params;
      const { feedback } = req.body;

      try {
        // Implement the logic to send feedback to the instructor
        res.json({ message: "Feedback sent successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to send feedback" });
      }
    });

    // API for manage users..........................................................
    app.put("/makeAdmin/:id", async (req, res) => {
      const { id } = req.params;
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "admin" } }
      );
      res.send(result);
    });
    app.put("/makeInstructor/:id", async (req, res) => {
      const { id } = req.params;

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: "instructor" } }
      );
      res.send(result);
    });
    //............................................................................

    app.get("/instructor", async (req, res) => {
      const result = await usersCollection
        .find({ role: "instructor" })
        .toArray();
      res.send(result);
    });

    app.get("/student", async (req, res) => {
      const result = await usersCollection.find({ role: "student" }).toArray();
      res.send(result);
    });

    app.get(
      "/all-user",
      /*verifyJWT, verifyAdmin,*/ async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      }
    );

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.post("/selectedClasses", async (req, res) => {
      const classData = req.body;
      const result = await selectedClassesCollection.insertOne(classData);
      res.send(result);
    });

    app.get("/selectedClasses", async (req, res) => {
      const result = await selectedClassesCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.get("/users/instructor/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isInstructor: user?.role === "instructor" });
    });

    app.get("/users/student/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isStudent: user?.role === "student" });
    });

    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    // app.post("/classes", async (req, res) => {
    //   const {
    //     className,
    //     classImage,
    //     availableSeats,
    //     price,
    //     instructorName,
    //     instructorEmail,
    //   } = req.body;

    //   await classesCollection.insertOne({
    //     name: className,
    //     image: classImage,
    //     availableSeats,
    //     price,
    //     instructor: instructorName,
    //     instructorEmail,
    //     status: "pending",
    //     popular: false,
    //     enrolledStudent: 0,
    //   });
    //   res.status(201).json({ message: "Class added successfully" });
    // });
    /////////////////////////////FeedBack/////////////////////////////////////
    app.post("/classes", async (req, res) => {
      const {
        className,
        classImage,
        availableSeats,
        price,
        instructorName,
        instructorEmail,
      } = req.body;

      await classesCollection.insertOne({
        name: className,
        image: classImage,
        availableSeats,
        price,
        instructor: instructorName,
        instructorEmail,
        status: "pending",
        popular: false,
        enrolledStudent: 0,
        feedback: "",
      });

      res.status(201).send({ message: "Class added successfully" });
    });

    app.post("/classes/feedback", async (req, res) => {
      const { classId, feedback } = req.body;

      try {
        await classesCollection.updateOne(
          { _id: ObjectId(classId) },
          { $set: { feedback } }
        );
        res.status(200).send({ message: "Feedback sent successfully" });
      } catch (error) {
        console.error("Failed to send feedback:", error);
        res.status(500).send({ message: "Failed to send feedback" });
      }
    });

    //////////////////////////////////////////////////////////////////////////
    app.get("/popular-classes", async (req, res) => {
      const result = await classesCollection
        .find({ popular: true })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/popular-instructor", async (req, res) => {
      const result = await classesCollection
      .find({ popular: true })
      .limit(6)
      .toArray();
      res.send(result);
    });

    //payment method////////////////////////
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });

      app.post("/payments", async (req, res) => {
        const payment = req.body;
        const result = await paymentCollection.insertOne(payment);
        const id = payment.bookingId;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            paid: true,
            transactionId: payment.transactionId,
          },
        };
        const updatedResult = await bookingsCollection.updateOne(
          filter,
          updatedDoc
        );
        res.send(result);
      });
    });

    // await client.db("admin").command({ ping: 1 });
  } catch (error) {
    // console.error("Error connecting to MongoDB:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Summer camp server is running");
});

app.listen(port, () => {
  console.log(`Summer camp server is running on port ${port}`);
});
