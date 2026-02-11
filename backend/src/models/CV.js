import mongoose from "mongoose";
import validator from "validator";

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
          validator: (v) => !v || validator.isEmail(v),
          message: "Please enter a valid email",
        },
      },
      github: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
    },
    address: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      street: {
        type: String,
        required: true,
        trim: true,
      },
    },
    experience: [
      {
        institutionName: {
          type: String,
          required: true,
          trim: true,
        },
        duration: {
          type: Number,
          required: true,
          min: 0,
        },
        position: {
          type: String,
          required: true,
          trim: true,
        },
        summary: {
          type: String,
          trim: true,
        },
      },
    ],
    education: [
      {
        institutionName: {
          type: String,
          required: true,
          trim: true,
        },
        duration: {
          type: Number,
          required: true,
          min: 0,
        },
        certification: {
          type: String,
          required: true,
          trim: true,
        },
        summary: {
          type: String,
          trim: true,
        },
      },
    ],
    language: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: [],
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    customSections: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        items: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            description: {
              type: String,
              trim: true,
            },
            duration: {
              type: Number,
              min: 0,
            },
            link: {
              type: String,
              trim: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for faster queries
cvSchema.index({ userId: 1 });
cvSchema.index({ jobTitle: 1 });

const CV = mongoose.model("CV", cvSchema);

export default CV;
