var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema
;

var schema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    not_read: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    name: {
        type: String,
    },
    messages: [{
        body: {
            type: String,
            required: true,
        },
        created_at: {
	    type: Date,
            default: Date.now,
            required: true,
        },
        from: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    }],
});

exports.Chat = mongoose.model('Chat', schema);
