import mongoose from 'mongoose';

// MongoDB URI
const uri = 'mongodb://localhost:27017/lighthouseDB'; // 이 부분은 실제 데이터베이스 URI로 수정하세요

// Mongoose 연결 설정
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 연결 성공 또는 실패 이벤트 처리
mongoose.connection.on('connected', () => {
    console.log('Mongoose successfully connected to database');
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from database');
});

// 연결 종료 시 재연결 시도
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to application termination');
    process.exit(0);
});

export default mongoose;
