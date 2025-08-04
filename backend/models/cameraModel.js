const mongoose = require("mongoose");

const camera = mongoose.Schema({

    email: {
        type: String,
        required: [true, "Please Enter Email"],
    },
    userId: {
        type: String,
        required: [true, "Please Enter User Id"],
    },
    deviceId: {
        type: String,
        required: [true, "Please Enter camera Id"],
    },
    name: {
        type: String,
        required: [true, "Please Enter Camera Name"],
    },
    created_date: {
        type: String,
    },
    isp2p: {
        type: Number,
        default: 1,
    },
    productType: {
        type: String
    },
    lastImage: {
        type: String,
    },
    timestamp: {
        type: Number
    },
    sharedWith: [
        {
            email: {
                type: String,
            },
            userId: {
                type: String,
            }
        },
    ]
}, { collection: 'camera' });

module.exports = mongoose.model("camera", camera);