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
        required: false,
        default: null,
    },
    searchRequirements: {
        position: { type: String, trim: true },
        description: { type: String, trim: true },
        technicalSkills: { type: [String], default: [] },
        softSkills: { type: [String], default: [] },
        yearsOfExperience: { type: Number, min: 0 },
        language: { type: [String], default: [] },
        additionalNotes: { type: String, trim: true }
    },

    candidate: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        CVId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CV',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },

        rank: { type: Number },
        matchScore: { type: Number },
        reasoning: { type: String },
        strengths: { type: [String], default: [] },
        skillsMatched: { type: [String], default: [] },
        skillsMissing: { type: [String], default: [] },

    }],


},


    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strict: true,
        strictQuery: true,
    });

// Indexes for faster queries
potentialCandidatesSchema.index({ employerId: 1 });
potentialCandidatesSchema.index({ jobId: 1 });
potentialCandidatesSchema.index({ 'candidate.userId': 1 });

const PotentialCandidates = mongoose.model('PotentialCandidates', potentialCandidatesSchema);

export default PotentialCandidates;
