import mongoose from "mongoose";

export const connectMongoDB = () => {
    // ADD 'return' HERE so server.js receives the Promise
    return mongoose.connect(process.env.DB_URI).then((data) => {
        console.log(`✅ MongoDb connected with server ${data.connection.host}`);
        return data; // Pass the data along
    }).catch((err) => {
        console.log(`❌ DB Connection Error: ${err.message}`);
        throw err; // Re-throw so server.js knows it failed
    });
};
