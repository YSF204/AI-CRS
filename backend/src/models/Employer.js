import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        license: {
            type: String,
            required: true,
            trim: true
        },
        branches: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
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
        }],
        website: {
            type: String,
            trim: true,
            match: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
        },
        contactEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});

// indexes for faster queries
employerSchema.index({ userId: 1 });
employerSchema.index({ 'company.name': 1 });

const Employer = mongoose.model('Employer', employerSchema);

export default Employer;
