import mongoose from 'mongoose';

const cvAnalysisSchema = new mongoose.Schema({
    CVId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CV',
        required: true
    },
    atsScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    strength: {
        type: String,
        required: true,
        trim: true
    },
    weakness: {
        type: String,
        required: true,
        trim: true
    },
    suggestion: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
cvAnalysisSchema.index({ CVId: 1 });
cvAnalysisSchema.index({ atsScore: 1 });
cvAnalysisSchema.index({ createdAt: -1 });

const CVAnalysis = mongoose.model('CVAnalysis', cvAnalysisSchema);

export default CVAnalysis;
