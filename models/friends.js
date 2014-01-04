var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema
;

var schema = new Schema({
    approved: [{
        friend: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
        },
    }],
    sent_invitations: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    }],
    received_invitations: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    }],
    created_at: {
	type: Date,
        default: Date.now,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    },
});

exports.Friends = mongoose.model('Friends', schema);
