import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(colors.bgMagenta.white(`Connected To Mongodb Database ${conn.connection.host}`));
    return conn;
  } catch (error) {
    console.log(colors.bgRed.white(`Error in Mongodb ${error}`));
  }
};

export default connectDB;