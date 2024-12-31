import mongoose from "mongoose";
import projectModel from "../models/project.model.js";


export const createProject = async ({
    name, userId
}) => {

    if(!name) {
       throw new Error('Name is required.');
    }

    if(!userId) {
        throw new Error('UserId is required.');
    }

    let project;
    try {
        project = await projectModel.create({ name, users: [userId] });
    } catch (error) {
        if(error.code === 11000) {
          throw new Error('Project already exists.');
        }
        throw error;
    }
    return project;
}

export const getAllProjectByUserId = async ({ userId }) => {

    if(!userId) {
        throw new Error('UserId is required.');
    }

    const allUserProjects = await projectModel.find({ users: userId });
    return allUserProjects;
}

export const addUserToProject = async ({ projectId, users, userId }) => {
    if(!projectId) {
        throw new Error('ProjectId is required.');
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)) { 
        throw new Error('ProjectId is invalid.'); 
    }    

    if(!users) {
        throw new Error('Users are required.');
    }

    if(!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) { 
        throw new Error('Users must be an array of valid userIds.'); 
    }

    if(!userId) {
        throw new Error('UserId is required.');
    }

    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('UserId is invalid.');
    }

    const project = await projectModel.findOne({ _id: projectId, 
        users: userId
    });

    if(!project) {
        throw new Error('Project not found.');
    }

    const updatedProject = await projectModel.findOneAndUpdate({ _id: projectId
    },{
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })
    return updatedProject;
}

export const getProjectById = async ({ projectId }) => {
    if(!projectId) {
        throw new Error('ProjectId is required.');
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('ProjectId is invalid.');
    }

    const project = await projectModel.findOne({ _id: projectId }).populate('users');
    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if(!projectId) {
        throw new Error("projectId is required")
    }
    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }
    if(!fileTree){
        throw new Error("fileTree is required")
    }
    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })
    return project;
}