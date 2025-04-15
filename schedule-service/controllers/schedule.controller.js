import Schedule from "../models/schedule.model.js";


export const createSchedule = async (req, res) => {
    try {
        const { title, description, startTime, endTime, module, location, recurring, status } = req.body;

        // Validate required fields
        if (!title || !startTime || !endTime || !module) {
            return res.status(400).json({ message: "Title, start time, end time, and module are required" });
        }

        // Validate time
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        const newSchedule = await Schedule.create({
            title,
            description,
            startTime,
            endTime,
            module,
            location,
            recurring,
            status
        });

        res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            data: newSchedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create schedule",
            error: error.message
        });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingSchedule = await Schedule.findById(id);
        if (!existingSchedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        // Validate time if being updated
        if (updateData.startTime || updateData.endTime) {
            const startTime = updateData.startTime || existingSchedule.startTime;
            const endTime = updateData.endTime || existingSchedule.endTime;

            if (new Date(endTime) <= new Date(startTime)) {
                return res.status(400).json({ message: "End time must be after start time" });
            }
        }

        const updatedSchedule = await Schedule.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: "Schedule updated successfully",
            data: updatedSchedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update schedule",
            error: error.message
        });
    }
};


export const getSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findById(id);

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.status(200).json({
            success: true,
            data: schedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch schedule",
            error: error.message
        });
    }
};



export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSchedule = await Schedule.findByIdAndDelete(id);

        if (!deletedSchedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.status(200).json({
            success: true,
            message: "Schedule deleted successfully",
            data: deletedSchedule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete schedule",
            error: error.message
        });
    }
};

export const getAllSchedules = async (req, res) => {
    try {
        const { startDate, endDate, module, status } = req.query;

        let query = {};

        if (startDate && endDate) {
            query.startTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (module) {
            query.module = module;
        }

        if (status) {
            query.status = status;
        }

        const schedules = await Schedule.find(query).sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch schedules",
            error: error.message
        });
    }
};
