const mongoose = require('mongoose'); // Correctly import mongoose
const { Schema } = mongoose; // Destructure Schema from mongoose

// Define the schema
const stockData_schema  = new Schema({
    stock : {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    family_name : Schema.Types.String,
    price: {
        type: Schema.Types.Number,
        required: true,
    },
    likes:{
        type: Schema.Types.Number,
        required: true,
        default : 0
    },
    ips :{
        type : [Schema.Types.String],
        required : true
    } 
});

// Create the model
const stockData = mongoose.model("Stock", stockData_schema ); // Model name is capitalized and singular

// Export the model
module.exports = stockData;
