import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';

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

// 한국 시간으로 변환하여 UTC로 변환
const getUTCFromKoreanTime = (date) => {
    return moment.tz(date, 'Asia/Seoul').utc().toDate();
};

// 데이터 저장 함수
const saveMetric = async (data) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(metricsCollectionName);

        // 한국 시간으로 변환
        const koreanTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

        // UTC로 변환
        const utcTime = getUTCFromKoreanTime(koreanTime);

        // 데이터 준비
        const metricData = {
            ...data,
            timestamp: utcTime, // 변환된 UTC 시간 저장
        };

        // MongoDB에 데이터 저장
        await collection.insertOne(metricData);
        console.log('Metric saved successfully');
    } catch (error) {
        console.error('Error saving metric:', error);
    } finally {
        await client.close();
    }
};

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
            acc[metric.url].push({
                ...metric,
                timestamp: moment(metric.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            });
            return acc;
        }, {});

        res.render('dashboard', { metricsByUrl, currentTime: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss') });
    } catch (err) {
        console.error('Error fetching metrics:', err);
        res.status(500).send('Error fetching metrics');
    } finally {
        await client.close();
    }
});

// JSON 데이터를 제공하는 엔드포인트
app.get('/api/metrics', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(metricsCollectionName);

        const metrics = await collection.find().sort({ timestamp: -1 }).toArray();
        const metricsByUrl = metrics.reduce((acc, metric) => {
            if (!acc[metric.url]) {
                acc[metric.url] = [];
            }
            acc[metric.url].push({
                ...metric,
                timestamp: moment(metric.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            });
            return acc;
        }, {});

        res.json(metricsByUrl);
    } catch (err) {
        console.error('Error fetching metrics for graph:', err);
        res.status(500).send('Error fetching metrics for graph');
    } finally {
        await client.close();
    }
});

// 그래프 페이지를 렌더링하는 엔드포인트
app.get('/graph', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(metricsCollectionName);

        const metrics = await collection.find().sort({ timestamp: -1 }).toArray();
        const metricsByUrl = metrics.reduce((acc, metric) => {
            if (!acc[metric.url]) {
                acc[metric.url] = [];
            }
            acc[metric.url].push({
                ...metric,
                timestamp: moment(metric.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
            });
            return acc;
        }, {});

        res.render('graph', { metricsByUrl, currentTime: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss') });
    } catch (err) {
        console.error('Error fetching metrics for graph:', err);
        res.status(500).send('Error fetching metrics for graph');
    } finally {
        await client.close();
    }
});

// Waterfall 데이터 페이지 렌더링
app.get('/waterfalls', (req, res) => {
    res.render('waterfalls', { currentTime: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss') });
});

// 전체 데이터 Waterfall 엔드포인트
app.get('/api/complete-waterfall', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(metricsCollectionName);

        // 전체 Waterfall 데이터 가져오기
        const metrics = await collection.find().sort({ timestamp: -1 }).toArray();
        const items = metrics.map(request => ({
            url: request.url,
            startTime: request.startTime,
            endTime: request.endTime,
            totalBytes: request.totalBytes,
            timestamp: moment(request.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
        }));

        res.json(items);
    } catch (err) {
        console.error('Error fetching complete waterfall data:', err);
        res.status(500).send('Error fetching complete waterfall data');
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
