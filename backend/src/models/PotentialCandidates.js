import mongoose from 'mongoose';

const potentialCandidatesSchema = new mongoose.Schema({
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidate: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        CVId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CV',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
potentialCandidatesSchema.index({ employerId: 1 });
potentialCandidatesSchema.index({ jobId: 1 });
potentialCandidatesSchema.index({ 'candidate.userId': 1 });

const PotentialCandidates = mongoose.model('PotentialCandidates', potentialCandidatesSchema);

export default PotentialCandidates;
