import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDb = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongo.uri, {
    dbName: config.mongo.dbName,
    autoIndex: config.isDev,
    maxPoolSize: 50,
  });

  isConnected = true;
  console.log('📦 MongoDB connected');
  return mongoose.connection;
};

export const disconnectDb = async () => {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
};
