var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema
;

var schema = new Schema({
    approved: {
        type: Array,
        default: [],
    },
    sent_invitations: {
        type: Array,
        default: [],
    },
    received_invitations: {
        type: Array,
        default: [],
    },
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
