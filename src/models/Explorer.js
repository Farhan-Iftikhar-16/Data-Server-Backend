const mongoose = require('mongoose');

const ExplorerSchema = new mongoose.Schema({
    user: { type: mongoose.ObjectId, ref: 'User' },
    name: { type: String, required: true},
    fileType: { type: String},
    content: {type: String},
    createdBy: {type: String},
    children: [{ type: mongoose.ObjectId, ref: 'Explorer' }],
    parentId: { type: mongoose.ObjectId, ref: 'Explorer' }
}, { timestamps: true });


const autoPopulateChildren = function(next) {
    this.populate('children');
    next();
  };
  
  ExplorerSchema.pre('findOne', autoPopulateChildren).pre(
    'find',
    autoPopulateChildren,
  );
  const Explorer = mongoose.model('Explorer', ExplorerSchema);
module.exports = Explorer;
