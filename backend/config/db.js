import mongoose from 'mongoose';

// <!-- connect with mongodb -->
const mongoDBConnect = async () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log(`MongoDB connect successful`.bgBlue);
      })
      .catch((error) => {
        console.log(`${error.message}`.bgRed);
      });
  } catch (error) {
    console.log(`${error.message}`.bgRed);
  }
};

export default mongoDBConnect;
