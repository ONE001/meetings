var User = require('models/user').User,
    Friends = require('models/friends').Friends,
    Chat = require('models/chat').Chat,
    config = require('config'),
    async = require('async')
;

module.exports = function(io, client) {
    function room(user_id) {
        return config.get("socket:key_for_private_rooms") + user_id;
    }

    client.join(room(client.handshake.user._id));

    function update(user_id)
    {
        io.sockets.in(room(user_id)).emit('need_update');
    }

    function notify_friends(friends)
    {
        Friends.approvedById(client.handshake.user.friends, function(approved) {
            if (!friends)
                approved.forEach(function(f) { update(f.friend._id); });
            else
                approved.forEach(function(f) {
                    if (friends.indexOf(f.friend._id) != -1)
                        update(f.friend._id);
                });
        });
    }

    // invitations_to_friends
    function update_invitations(user_id) {
        async.waterfall([
            function(callback) {
                User.findById(user_id, callback);
            },
            function(user, callback) {
                if (user.friends) {
                    Friends
                        .findById(user.friends)
                        .populate({
                            path: 'received_invitations',
                            select: 'username login',
                        })
                        .exec(callback)
                    ;
                }
            },
        ], function(err, inv) {
            if (err) return;

            io.sockets
                .in(room(user_id))
                .emit('invitations', inv.received_invitations);
        });
    }

    function update_new_messages(user_id) {
        Chat.find({not_read: {
            $in: [user_id]
        }}, '_id name', function(err, chats) {
            io.sockets.in(room(user_id)).emit('unread_messages', chats);
        });
    }

    update_invitations(client.handshake.user._id);
    update_new_messages(client.handshake.user._id);

    return {
        room: room,
        update: update,
        notify_friends: notify_friends,
        update_invitations: update_invitations,
        update_new_messages: update_new_messages,
        send: function(user_id, event, data) {
            io.sockets
                .in(room(user_id))
                .emit(event, data)
            ;
        },
    };
};
