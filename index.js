const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.quv1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    console.log("database connected successfully");

    const database = client.db("formBuilder");
    // Collections
    const formList = database.collection("form_list");

    // GET - All users
    app.get("/form-list", async (req, res) => {
      const cursor = formList.find({});
      const formsListData = await cursor.toArray();
      res.json(formsListData);
    });

    // POST - Save new form to form list
    app.post("/form-list", async (req, res) => {
      const form = req.body;
      const result = await formList.insertOne(form);

      const newForm = {
        _id: result.insertedId,
        name: form.name,
        fieldTypes: form.fieldTypes,
        fieldLabels: form.fieldLabels,
      };
      res.json(newForm);
    });

    // PUT - Update a specific form data
    app.put("/form-list", async (req, res) => {
      const formData = req.body;
      //   console.log(formData);

      // Find the specific form
      const query = { _id: ObjectId(formData.id) };
      const result = await formList.findOne(query);

      if (result.formData) {
        result.formData.values.push(formData.values);
      } else {
        result.formData = {
          labels: formData.labels,
          values: [formData.values],
        };
      }
      const filter = { _id: ObjectId(formData.id) };
      const options = { upsert: true };
      const updateDoc = { $set: result };
      const response = await formList.updateOne(filter, updateDoc, options);
      res.json({
        _id: formData.id,
        modifiedCount: response.modifiedCount,
        labels: formData.labels,
        values: formData.values,
      });
      // console.log(response);
    });

    // Delete - Delete a form formList
    app.delete("/form-list/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await formList.deleteOne(query);
      res.json({ _id: id, deletedCount: result.deletedCount });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Simple Express Server is Running");
});

app.listen(port, () => {
  console.log("Server has started at port:", port);
});
