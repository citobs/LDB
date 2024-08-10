// lighthouse.js
import mongoose from './db.js';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import Metric from './models/Metrics.js';
import cron from 'node-cron';

// 측정할 URL 목록과 제목
const urlsWithTitles = [
    { url: 'https://www.amoremall.com/kr/ko/display/main', title: 'Main' },
    { url: 'https://www.google.com', title: 'Google' },
    { url: 'https://www.github.com', title: 'GitHub' },
    { url: 'https://www.amoremall.com/kr/ko/display/search?query=1234', title: 'Search' },
    // 여기에 추가적인 URL과 제목을 넣으세요
];

// MongoDB 연결 확인
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');

    // 모든 URL에 대해 테스트를 실행하는 함수
    async function runAllTests() {
        for (const { url, title } of urlsWithTitles) {
            await runLighthouse(url, title);
        }
    }

    // 각 URL에 대해 Lighthouse 성능 테스트를 실행하는 함수
    async function runLighthouse(url, title) {
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
        const options = { logLevel: 'info', output: 'json', port: chrome.port };
        const runnerResult = await lighthouse(url, options);

        const report = runnerResult.lhr;

        const metrics = new Metric({
            url: report.finalUrl,
            title: title, // 제목 추가
            fcp: report.audits['first-contentful-paint'].numericValue,
            lcp: report.audits['largest-contentful-paint'].numericValue,
            fmp: report.audits['first-meaningful-paint'] ? report.audits['first-meaningful-paint'].numericValue : 'N/A',
        });

        await metrics.save();

        console.log(`메트릭이 성공적으로 저장되었습니다: ${url}`);

        await chrome.kill();
    }

    // 10분마다 runAllTests 함수 실행
    cron.schedule('*/10 * * * *', runAllTests);

    // 프로그램 시작 시 즉시 테스트 실행
    runAllTests().catch(console.error);
});
