import mongoose from "mongoose";
import "dotenv/config";

export const connect = async () => {
  try {
    // console.log(`${process.env.MONGODB_URL}/splitappdb`)

    const conn = await mongoose.connect(
      `${process.env.MONGODB_URL}/splitappdb`
    );

    console.log(`DB HOST: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MONGO DB CONNECTION ERROR: ${error}`);
  }
};