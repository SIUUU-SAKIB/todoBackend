require(`dotenv`).config();
const express = require(`express`);
const app = express();
const port = process.env.PORT || 1000;
const cors = require(`cors`);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.y1e7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
app.use(express.json(), express.urlencoded({ extended: true }));
app.use(
  cors({ credentials: true, origin: `http://localhost:${process.env.ORIGIN}` })
);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB"
    );

    // TODO APPLICATION
    const db = client.db(`todo-database`);
    const todoCollection = db.collection(`todos`);

    app.get(`/todo/:email`, async (req, res) => {
      const { email } = req.params;
      console.log(email);
      try {
        const data = await todoCollection.find({ user: email }).toArray();
        res.send(data);
      } catch (error) {
        res.status(500).send(`Something went wrong`);
      }
    });

    app.post(`/todo-post`, async (req, res) => {
      try {
        const data = await todoCollection.insertOne(req.body);
        res.send(data);
      } catch (error) {
        res.status(500).json({
          message: `Failed to post todo`,
          status: false,
          error,
        });
      }
    });

    app.patch(`/done-todo/:id`, async (req, res) => {
      const { id } = req.params;
      try {
        const filter = { _id: new ObjectId(id) };
        const updateInfo = { $set: { ...req.body } };
        const options = { upsert: false };

        const result = await todoCollection.updateOne(
          filter,
          updateInfo,
          options
        );
        res
          .status(200)
          .json({ status: true, message: `Successfully updated the todo` });
      } catch (error) {
        res.status(500).send(`Failed to update the todo.`);
      }
    });

    app.patch(`/todo-update/:id`, async (req, res) => {
      const { id } = req.params;
      try {
        const filter = { _id: new ObjectId(id) };
        const updateInfo = { $set: { ...req.body } };
        const options = { upsert: false };

        const result = await todoCollection.updateOne(
          filter,
          updateInfo,
          options
        );
        res.status(200).json({
          status: true,
          message: `Successfully updated the todo`,
          result,
        });
      } catch (error) {
        res.status(500).send(`Failed to update the todo.`);
      }
    });

    app.delete(`/todo-delete/:id`, async (req, res) => {
      try {
        const result = await todoCollection.deleteOne({
          _id: new ObjectId(req.params),
        });
        res.status(200).json({
          status: true,
          result,
        });
      } catch (error) {
        res.status(200).send({ message: `Failed to delete todo` });
      }
    });
    // END OF TODO APPLICATION
    const dataBase = client.db(`my-database`);
    const usersCollection = dataBase.collection(`users-collection`);

    app.post(`/add-user`, async (req, res) => {
      try {
        const result = await usersCollection.insertMany(req.body);
        console.log(req.body);
        res.status(200).json({
          message: `User created successfully`,
          result,
        });
      } catch (error) {
        res.status(400).json({ message: `Failed to create user` });
      }
    });

    app.get(`/users`, async (req, res) => {
      try {
        const data = await usersCollection.find().toArray();
        res.send(data);
      } catch (error) {
        res.status(400).json({
          message: `failed to get data`,
          error,
        });
      }
    });
    // search via ID
    app.get(`/users/:id`, async (req, res) => {
      try {
        const { id } = req.params;
        const data = await usersCollection.findOne({ _id: new ObjectId(id) });

        res.send(data);
      } catch (error) {
        res.status(400).json({ message: `Failed to get the data` }, error);
      }
    });

    // serach via Email
    app.get(`/users/user/:email`, async (req, res) => {
      try {
        const data = await usersCollection
          .find({ email: req.params.email }, { projection: { email: 0 } })
          .toArray();
        res.status(200).json({
          status: `Success`,
          message: `Successfully Got the data`,
          data: data,
        });
      } catch (error) {
        res.status(400).json({ message: `Failed to get data` });
      }
    });

    // update items
    app.put("/update-user/:id", async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      try {
        const filter = { _id: new ObjectId(id) };
        const updateInfo = { $set: { ...req.body } };
        const options = { upsert: false };

        const result = await usersCollection.updateOne(
          filter,
          updateInfo,
          options
        );

        res.json({
          message: "User updated successfully",
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update user",
          error: error.message,
        });
      }
    });

    // update many
    app.patch(`/update-all`, async (req, res) => {
      try {
        const result = await usersCollection.updateMany(
          {},
          { $set: { salary: 5000 } }
        );
        res.status(200).json({
          result,
        });
      } catch (error) {
        res.status(400).json({
          message: `Failed to update user`,
          error,
        });
      }
    });
    // Delete user
    app.delete(`/delete-user/:id`, async (req, res) => {
      try {
        const result = await usersCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.status(200).json({ message: `Deleted Successfully`, result });
      } catch (error) {
        res.status(500).json({
          status: false,
          message: `Failed to delete user ${error}`,
        });
      }
    });
    // delete many user
    app.delete(`/delete-users/status`, async (req, res) => {
      const { status } = req.body;
      try {
        const result = await usersCollection.deleteMany({ status });
        res.status(200).json({
          status: true,
          message: `Successfully deleted user`,
          result,
        });
      } catch (error) {
        res.status(500).json({
          status: true,
          message: `Selected users successfully`,
        });
      }
    });
    // Condition user search
    app.get(`/users/older-than/:salary`, async function (req, res) {
      const { salary } = req.params;
      const result = await usersCollection
        .find({ salary: { $gt: Number(salary) } })
        .toArray();
      res.send(result);
    });
    // Default Route
    app.get(`/`, (req, res) => {
      res.send("SERVER IS WORKING");
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () =>
  console.log(`SERVER IS RUNNING ON http://localhost:${port}`)
);
