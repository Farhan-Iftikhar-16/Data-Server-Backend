const Explorer = require('../models/Explorer');
const { ObjectId } = require('mongoose');

const helper = {
    populateFFData: async (userId) => {
        return new Promise(async (resolve, reject) => {
            let files = await Explorer.find({ parentId: null, user: userId});
            resolve(files)
        })
    },
    flatData: async (userId) => {
        return new Promise(async (resolve, reject) => {
            let files = await Explorer.find({ user: userId}).select("-children");
            resolve(files)
        })
    }
};
module.exports = helper;