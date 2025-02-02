// main/mongodb-service.js
import { MongoClient } from "mongodb";

class MongoDBService {
  constructor() {
    this.client = null;
    // Using default MongoDB local connection URL
    this.mongoUrl = "mongodb://localhost:27017/farm";
  }

  async start() {
    try {
      this.client = new MongoClient(this.mongoUrl);
      await this.client.connect();
      console.log("Connected successfully to local MongoDB");
      return this.mongoUrl;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.client) {
        await this.client.close();
        console.log("MongoDB connection closed");
      }
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }
}

export default MongoDBService;
