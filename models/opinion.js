const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const mongoosePaginate = require('mongoose-paginate-v2');

const opinionSchema = mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Post'
    },
    user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User'
    },
    option:String,
});

opinionSchema.plugin(timestamp);
opinionSchema.plugin(mongoosePaginate);
const Opinion = mongoose.model("Opinion", opinionSchema);

module.exports = Opinion;
