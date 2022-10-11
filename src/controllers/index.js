const Explorer = require('../models/Explorer');
const helper = require('./helper');
const aws = require("aws-sdk");
const path = require("path");
const {exec} = require("child_process");
const fs = require("fs");

module.exports ={
    createFileOrFolder: async function(req, res){
        const { name, fileType, parentId, userId, createdBy } = req.body;
        console.log(req.body);
        if(!name){
            return res.status(400).json({success:false, message:'Please provide a name of file'});
        }
        let ff = new Explorer({name: name, fileType: fileType, createdBy: createdBy, parentId: parentId || null, user: userId});
        ff.save( async (err, status) => {
            // console.log(err,status)
            let _id = status._id;
            if(parentId && typeof parentId !== 'undefined') {
                // console.log(_id, fileType)
                await Explorer.updateOne({_id: parentId, user: userId}, {
                    $push: {
                        children:  _id
                    }
                });
            }
            res.status(200).json({success:true, data: {
                _id: _id,
                name,
                fileType
            }}); 
        });
    },
    saveFileContent: async function(req, res){
        const { _id, content, userId } = req.body;
        if(!_id || !content){
            return res.status(400).json({success:false, message:'Please provide file id and content of file'});
        }
        if(_id && typeof _id !== 'undefined'){
            await Explorer.updateOne({_id: _id, user: userId}, { content: content});
            res.status(200).json({success:true, message:'Successfully saved'});
        } else {
            res.status(500).json({success:false, message:'Something went wrong'});
        }
    },
    getFileContent: async function(req, res){
        const { fileId } = req.params;
        if(!fileId){
            return res.status(400).json({success:false, message:'Please provide file id'});
        }
        if(fileId && typeof fileId !== 'undefined'){
            let file = await Explorer.findOne({_id: fileId, user: req.user._id});
            res.status(200).json({success:true, message:'ok', data: file});
        } else {
            res.status(500).json({success:false, message:'Something went wrong'});
        }
    },
    deleteFileOrFolder: async function(req, res){
        const { _id, userId } = req.body;
        if(!_id){
            return res.status(400).json({success:false, message:'Please provide file id'});
        }
        if(_id && typeof _id !== 'undefined'){
            let ff = await Explorer.findOne({_id:_id, user: userId});
            if (ff) {
                //deleting object it self
                await Explorer.deleteOne({_id: _id, user: userId});
                //deleting all childs
                await Explorer.deleteMany({ parentId: _id, user: userId});
                //pulling reference from its parent
                if(ff.parentId) {
                    await Explorer.updateOne({ _id: ff.parentId, user: userId }, {
                        $pull: { 
                            children: _id
                        }
                    });
                }
                res.status(200).json({success:true, message:'Successfully saved'});
            } else {
                res.status(500).json({success:false, message:'File or folder not found'});
            }
        } else {
            res.status(500).json({success:false, message:'Something went wrong'});
        }
    },
    listFilesAndFolder: async function(req, res){
        let ff = await helper.populateFFData(req.params.id);
        res.status(200).json({success:true, message:'ok', data:ff});
    },
    shareFoldersOrFilesWithUsers: async function(req, res) {
        for (const item of req.body.data) {
            await saveFolderOrFile(item);
        }

        res.status(200).json({success: true, message: 'Successfully Shared'});
    },
}
async function saveFolderOrFile(item) {
    const explorer = new Explorer({name: item.name, fileType: item.fileType, createdBy: item.createdBy, parentId: item.parentId || null, user: item.userId});
    await explorer.save( async (error, response) => {
        const _id = response._id;
        if(item.parentId) {
            await Explorer.updateOne({_id: item.parentId, user: item.userId}, {
                $push: {
                    children:  _id
                }
            });
        }

        if (item.children && item.children.length > 0) {
            for(const childItem of item.children) {
                childItem.parentId = _id;
                await saveFolderOrFile(childItem);
            }
        }
    });
}

