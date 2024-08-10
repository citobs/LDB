// models/Metrics.js
import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true }, // 제목 필드 추가
    fcp: { type: Number, required: true },
    lcp: { type: Number, required: true },
    fmp: { type: Number, default: 'N/A' },
    timestamp: { type: Date, default: Date.now }
});

const Metric = mongoose.model('Metric', metricsSchema);

export default Metric;
