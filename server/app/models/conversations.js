
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ConvSchema = new Schema({


    isgroup : {
        type : Boolean
    },
    image : {

        type: String
    },
    name : {

        type : String
    },
    namereq : {

        type : String
    },
    imagereq : {

        type : String
    },
    requestby: {

        type : String
    },
    gotrequest : {
        type : String
    },
    members : {
        type : []
    },
    membersname : {
        type : String
    },
    chats : {
        type: []
    },
    confirmed : {

        type : Boolean
    }
},
    {
        timestamps : true
    });

module.exports = mongoose.model('Conversation', ConvSchema);