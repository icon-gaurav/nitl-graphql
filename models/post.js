const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const mongoosePaginate = require('mongoose-paginate-v2');

const paperSchema = mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    description:String,
    options:[String]
});

paperSchema.plugin(timestamp);
paperSchema.plugin(mongoosePaginate);
const Post = mongoose.model("Post", paperSchema);

module.exports = Post;
