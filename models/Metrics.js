import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    fcp: { type: Number, required: true }, // First Contentful Paint
    lcp: { type: Number, required: true }, // Largest Contentful Paint
    fmp: { type: Number },                 // First Meaningful Paint (optional, can be 'N/A')
    tti: { type: Number, required: true }, // Time to Interactive
    si: { type: Number, required: true },  // Speed Index
    tbt: { type: Number, required: true }, // Total Blocking Time
    cls: { type: Number, required: true }, // Cumulative Layout Shift
    ttfb: { type: Number, required: true },// Time to First Byte (Server Response Time)
    timestamp: { type: Date, default: Date.now }
});

const Metric = mongoose.model('Metric', metricSchema);

export default Metric;
