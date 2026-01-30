import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        phone: {
            type: String,
            trim: true,
            match: /^\d{10}$/
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        },
        github: {
            type: String,
            trim: true
        },
        linkedin: {
            type: String,
            trim: true
        }
    },
    address: {
        city: {
            type: String,
            required: true,
            trim: true
        },
        street: {
            type: String,
            required: true,
            trim: true
        }
    },
    experience: [{
        institutionName: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: Number,
            required: true,
            min: 0
        },
        position: {
            type: String,
            required: true,
            trim: true
        },
        summary: {
            type: String,
            required: true,
            trim: true
        }
    }],
    education: [{
        institutionName: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: Number,
            required: true,
            min: 0
        },
        certification: {
            type: String,
            required: true,
            trim: true
        },
        summary: {
            type: String,
            required: true,
            trim: true
        }
    }],
    language: {
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
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
cvSchema.index({ userId: 1 });
cvSchema.index({ jobTitle: 1 });

const CV = mongoose.model('CV', cvSchema);

export default CV;
