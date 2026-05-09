import mongoose from "mongoose";
import validator from "validator";

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: "",
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
        trim: true,
        default: "",
      },
      country: {
        type: String,
        trim: true,
        default: "",
      },
    },
    experience: [
      {
        institutionName: {
          type: String,
          required: true,
          trim: true,
        },
        durationFrom: {
          type: String,
          trim: true,
          default: "",
        },
        durationTo: {
          type: String,
          trim: true,
          default: "",
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
        durationFrom: {
          type: String,
          trim: true,
          default: "",
        },
        durationTo: {
          type: String,
          trim: true,
          default: "",
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
      type: [mongoose.Schema.Types.Mixed],
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
          trim: true,
          default: "",
        },
        sectionType: {
          type: String,
          enum: ["projects", "hobbies", "other", "certifications"],
          default: "other",
        },
        items: [
          {
            name: {
              type: String,
              trim: true,
              default: "",
            },
            description: {
              type: String,
              trim: true,
            },
            durationFrom: {
              type: String,
              trim: true,
              default: "",
            },
            durationTo: {
              type: String,
              trim: true,
              default: "",
            },
            link: {
              type: String,
              trim: true,
            },
          },
        ],
      },
    ],
    templateId: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    profileImage: {
      type: String,
      default: "",
    },
    layout: {
      sectionOrder: {
        type: [String],
        default: [],
      },
      visibleSections: {
        type: Map,
        of: Boolean,
        default: {},
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

// Indexes for faster queries
cvSchema.index({ userId: 1 });
cvSchema.index({ jobTitle: 1 });

const CV = mongoose.model("CV", cvSchema);

export default CV;
