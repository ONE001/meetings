var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema
;

var schema = new Schema({
    approved: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
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
    }
});

exports.Friends = mongoose.model('Friends', schema);
