import mongoose from './db.js';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import Metric from './models/Metrics.js';
import cron from 'node-cron';

// 측정할 URL 목록과 제목
const urlsWithTitles = [
    { url: 'https://www.amoremall.com/kr/ko/display/main', title: 'amore_pc_Main' },
    { url: 'https://www.amoremall.com/kr/ko/product/detail?onlineProdSn=61281', title: 'amore_pc_pro_detail' },
    { url: 'https://www.github.com', title: 'GitHub' },
    { url: 'https://www.amoremall.com/kr/ko/display/search?query=%EC%84%A4%ED%99%94%EC%88%98', title: 'amore_pc_Search' },
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
        const chrome = await launch({ chromeFlags: ['--headless'] });
        const options = {
            logLevel: 'info',
            output: 'json',
            port: chrome.port,
            emulatedFormFactor: 'desktop' // 데스크탑 모드 설정
        };

        try {
            const runnerResult = await lighthouse(url, options);
            const report = runnerResult.lhr;

            // 모든 주요 메트릭을 포함하여 데이터베이스에 저장
            const metrics = new Metric({
                url: report.finalUrl,
                title: title,
                fcp: report.audits['first-contentful-paint'].numericValue,
                lcp: report.audits['largest-contentful-paint'].numericValue,
                fmp: report.audits['first-meaningful-paint'] ? report.audits['first-meaningful-paint'].numericValue : 'N/A',
                tti: report.audits['interactive'].numericValue,
                si: report.audits['speed-index'].numericValue,
                tbt: report.audits['total-blocking-time'].numericValue,
                cls: report.audits['cumulative-layout-shift'].numericValue,
                ttfb: report.audits['server-response-time'].numericValue,
                timestamp: new Date(),
            });

            await metrics.save();

            console.log(`메트릭이 성공적으로 저장되었습니다: ${url}`);

        } catch (error) {
            console.error(`Lighthouse 테스트 실패: ${url}`, error);
        } finally {
            await chrome.kill();
        }
    }

    // 10분마다 runAllTests 함수 실행
    cron.schedule('*/10 * * * *', runAllTests);

    // 프로그램 시작 시 즉시 테스트 실행
    runAllTests().catch(console.error);
});
