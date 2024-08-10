import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 디렉토리 경로를 얻기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// MongoDB 연결 정보
const uri = 'mongodb://localhost:27017';
const dbName = 'lighthouseDB';
const metricsCollectionName = 'metrics';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// 데이터 조회 및 대시보드 렌더링
app.get('/', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(metricsCollectionName);

        // 최근 데이터 가져오기
        const metrics = await collection.find().sort({ timestamp: -1 }).toArray();
        
        // 데이터 URL별로 그룹화
        const metricsByUrl = metrics.reduce((acc, metric) => {
            if (!acc[metric.url]) {
                acc[metric.url] = [];
            }
            acc[metric.url].push(metric);
            return acc;
        }, {});

        res.render('dashboard', { metricsByUrl });
    } catch (err) {
        console.error('Error fetching metrics:', err);
        res.status(500).send('Error fetching metrics');
    } finally {
        // 클라이언트 연결 종료
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
