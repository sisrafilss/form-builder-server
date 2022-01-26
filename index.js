const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
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

      console.log(form);
      const result = await formList.insertOne(form);

      const newForm = {
        id: result.insertedId,
        name: form.name,
        fieldTypes: form.fieldTypes,
        fieldLabels: form.fieldLabels,
      };
      res.json(newForm);
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
