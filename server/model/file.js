const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    upc             : 
    { type: String, 
        required: true,
         index: { unique: true } 
        },
    description     : 
    { type: String, 
        trim: true },
    size_weight     :
     { type: String,
         trim: true }
})






const File = mongoose.model('File',fileSchema)


module.exports = { File }

