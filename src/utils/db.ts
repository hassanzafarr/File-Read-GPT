import mongoose from 'mongoose'

interface IConnection {
  isConnected?: number
}

const MONGODB_URI = process.env.MONGODB_URI || ''
const connection: IConnection = {}

async function connect() {
  if (connection.isConnected) {
    console.log('already connected')
    return
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState
    if (connection.isConnected === 1) {
      console.log('use previous connection')
      return
    }
    await mongoose.disconnect()
  }
  const db = await mongoose.connect(MONGODB_URI)
  console.log('new connection')
  connection.isConnected = db.connections[0].readyState
}

async function disconnect(): Promise<void> {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = undefined;
    } else {
      console.log('not disconnected');
    }
  }
}

function convertDocToObj<T extends { _id: any; createdAt: any; updatedAt: any }>(doc: T): T {
  doc._id = doc._id.toString();
  doc.createdAt = doc.createdAt.toString();
  doc.updatedAt = doc.updatedAt.toString();
  return doc;
}

const db = { connect, disconnect, convertDocToObj }
export default db
