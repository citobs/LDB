// db.js
import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/lighthouseDB'; // 여기에 적절한 MongoDB URI를 넣으세요

mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // 30초
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

export default mongoose;
