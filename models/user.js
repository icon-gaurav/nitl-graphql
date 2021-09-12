/*
 * @author Gaurav Kumar
 */
const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");
const mongoosePaginate = require('mongoose-paginate-v2');
const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        isNullable:false
    },
    name:String,
    email: {
        type: String,
        unique: true,
        validate: {
            validator: function (v) {
                if(v) {
                    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
                }else{
                    return false;
                }
            },
            message: '{VALUE} is not a valid email address!'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                    return v.length >= 6;
            },
            message: 'Valid password is of min. 6 characters!'
        },
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
        default: new Date()
    }
});

userSchema.plugin(timestamp);
userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);

module.exports = User;
