const { logger } = require('../../index');
const Project = require('../models/Project');

module.exports.addProject = async (req, res) => {
    try {
        const { name, description, link, status, thumbnailUrl } = req.body;

        if (!name || !description || !status || !link) {
            return res.status(400).json({ 
                status: "failed",
                data: [],
                message: 'Name, description, link, and status are required'
            });
        }

        if (!['active', 'inactive', 'archive'].includes(status.toLowerCase())) {
            return res.status(400).json({ 
                status: "failed",
                data: [],
                message: 'Invalid status value (must be active, inactive, or archived)'
            });
        }

        const newProject = new Project({
            name,
            description,
            link,
            status: status.toLowerCase(),
            thumbnailUrl
        });

        await newProject.save();

        res.status(201).json({
            status: "success",
            data: [newProject],
            message: "Project added successfully"
        });
    } catch (e) {
        logger.error(`Error adding project:\n${e}`);
        res.status(500).json({
            status: "failed",
            data: [],
            message: "Internal Server Error"
        });
    }

    res.end();
}

module.exports.editProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, link, status, thumbnailUrl } = req.body;

        if (!name || !description || !status || !link) {
            return res.status(400).json({ 
                status: "failed",
                data: [],
                message: 'Name, description, link, and status are required'
            });
        }

        if (!['active', 'inactive', 'archive'].includes(status.toLowerCase())) {
            return res.status(400).json({ 
                status: "failed",
                data: [],
                message: 'Invalid status value (must be active, inactive, or archived)'
            });
        }

        const savedProject = await Project.updateOne(
            { _id: id },
            {
                name,
                description,
                link,
                status: status.toLowerCase(),
                thumbnailUrl
            }
        );

        res.status(201).json({
            status: "success",
            data: [savedProject],
            message: "Project edited successfully"
        });
    } catch (e) {
        logger.error(`Error adding project:\n${e}`);
        res.status(500).json({
            status: "failed",
            data: [],
            message: "Internal Server Error"
        });
    }

    res.end();
}

module.exports.removeProject = async (req, res) => {
    try {
        const result = await Project.findByIdAndDelete(req.params.id);

        if(!result) {
            return res.status(404).json({
                status: "failed",
                data: [],
                message: "Project not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: [result],
            message: "Successfully removed project from database"
        })
    } catch(e) {
        logger.error(`Error removing project:\n${e}`);
        res.status(500).json({
            status: "failed",
            data: [],
            message: "Internal Server Error"
        });
    }

    res.end();
}