import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer',
        required: false,
        default: null
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['OPEN', 'CLOSED', 'PENDING'],
        default: 'OPEN'
    },
    workSite: {
        type: String,
        required: true,
        trim: true
    },
    workDuration: {
        type: String,
        required: true,
        trim: true
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        min: 0
    },
    language: {
        type: [String],
        default: []
    },
    certification: {
        type: [String],
        default: []
    },
    softSkills: {
        type: [String],
        default: []
    },
    technicalSkills: {
        type: [String],
        default: []
    },
    externalUrl: {
        type: String,
        trim: true,
        default: ""
    },
    sourceName: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});

// Indexes for faster queries
jobSchema.index({ employerId: 1 });
jobSchema.index({ position: 1 });
jobSchema.index({ status: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
