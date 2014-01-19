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

schema.statics.approvedById = function(_id, callback) {
    if (!_id) return callback([]);

    this.findOne({_id: _id})
        .populate({
            path: 'approved.friend',
            select: 'username login',
        })
        .populate({
            path: 'approved.chat',
            select: '_id name not_read',
        })
        .exec(function(err, friends) {
            if (friends && friends.approved)
                callback(friends.approved);
            else
                callback([]);
        })
    ;
};

exports.Friends = mongoose.model('Friends', schema);
