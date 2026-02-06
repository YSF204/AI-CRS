import Job from '../models/Job.js';
import Employer from '../models/Employer.js';

// ================================== //
//         CREATE NEW JOB             //
// ================================== //

export const createJob = async (req, res) => {
    try {
        const { 
            employerId, 
            position, 
            description, 
            salary,
            workSite,
            workDuration,
            yearsOfExperience,
            language,
            certification,
            softSkills,
            technicalSkills } = req.body;

        // make sure that all the fields are provided
        if (!employerId || !position || !description || !salary || !workSite || !workDuration || !yearsOfExperience) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // check if the employer exists and is active
        const employer = await Employer.findById(employerId);
        if (!employer) {
            return res.status(404).json({
                success: false,
                message: 'Employer not found'
            });
        }

        const job = await Job.create({
            employerId: employer._id,
            position,
            description,
            salary,
            workSite,
            workDuration,
            yearsOfExperience,
            language: language || [],
            certification: certification || [],
            softSkills: softSkills || [],
            technicalSkills: technicalSkills || [],
            status: 'OPEN'
        });

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: { job }
        });

    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create job',
            error: error.message
        });
    }
};

// ================================== //
//         GET ALL JOBS               //
// ================================== //    

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'OPEN' })
            .populate('employerId', 'company')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: { jobs }
        });

    } catch (error) {
        console.error('Get all jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs',
            error: error.message
        });
    }
};


// ================================== //
//          UPDATE JOB                //
// ================================== //

export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Verify ownership
        const employer = await Employer.findOne({ userId: req.user._id });
        if (!employer || job.employerId.toString() !== employer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        const updatedJob = await Job.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: { job: updatedJob }
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update job',
            error: error.message
        });
    }
};

// ================================== //
//          DELETE JOB                //
// ================================== //

export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Verify ownership
        const employer = await Employer.findOne({ userId: req.user._id });
        if (!employer || job.employerId.toString() !== employer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job'
            });
        }

        await Job.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete job',
            error: error.message
        });
    }
};