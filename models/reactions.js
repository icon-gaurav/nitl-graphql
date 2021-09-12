const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const mongoosePaginate = require('mongoose-paginate-v2');

const reactionSchema = mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Post'
    },
    user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User'
    },
    reaction:{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Reaction'
    },
    kind:{
        type: String,
        default: 'like'
    },
    data:String
});

reactionSchema.plugin(timestamp);
reactionSchema.plugin(mongoosePaginate);
const Reaction = mongoose.model("Reaction", reactionSchema);

module.exports = Reaction;
