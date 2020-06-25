const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://nicolefitz:nicolefitz@cluster0-inygt.mongodb.net/users?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log("Connected to Database");
  client.close();
});
