const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

class DataStore {
  constructor(dbUrl, dbName, dbCollection) {
    this.dbUrl = dbUrl;
    this.dbName = dbName;
    this.dbCollection = dbCollection;
    this.dbClient = null;
  }

  async client() {
    //check if the client exists, and is connected
    if(this.dbClient && this.dbClient.isConnected()) {
      //if it is use the previously established connection to our database's server
      return this.dbClient
    } else {
      console.log(`Connecting to ${this.dbUrl}...`)
      //otherwise we set a new connection, and store it as a property of the object
      this.dbClient = await MongoClient.connect(this.dbUrl, { useUnifiedTopology: true })
      console.log("Connected to database.");
      //return that established collection back out
      return this.dbClient;
    }
  }

  async collection() {
    const client = await this.client();
    const database = client.db(this.dbName);
    const collection = database.collection(this.dbCollection);
    return collection;
  }

  async getAll() {
    let collection = await this.collection()
    let items = []
    await collection.find({}).forEach((item) => {
      items.push(item)
    })

    this.dbClient.close()
    return items
  }

  //write a method that will allow you to insert a document
  async insertDoc(document) {
    let collection = await this.collection()

    await collection.insertOne(document)

  }

  //Write a method that will return a single (specific) document
  async getOne(target) {
    let collection = await this.collection()
    let id = ObjectId(target)

    let entry = await collection.findOne({_id: id})

    this.dbClient.close()

    return entry

  }

  //write a method that will allow you to delete a specific document
  async deleteDoc(target) {
    let collection = await this.collection()
    let id = ObjectId(target)

    await collection.deleteOne({_id: id})

  }

  //write a method that will allow you to edit a specific document
  async editDoc(doc, target) {
    let collection = await this.collection()

    let id = ObjectId(target)

    await collection.updateOne({_id: id}, {$set: doc})

  }

}

module.exports = DataStore
