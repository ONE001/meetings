var User = require('models/user').User,
    Friends = require('models/friends').Friends,
    config = require('config')
;

module.exports = function(io, client) {
    function events_room(user_id) {
        return config.get("socket:key_for_private_rooms") + user_id;
    }

    client.join(events_room(client.handshake.user._id));

    // invitations_to_friends
    function update_invitations(user_id) {
        User.findById(user_id, function(err, user) {
            if (user.friends) {
                Friends
                    .findById(user.friends)
                    .populate({
                        path: 'received_invitations',
                        select: 'username login',
                    })
                    .exec(function(err, inv) {
                        io.sockets.in(events_room(user_id)).emit('invitations', inv.received_invitations);
                    });
            }
        });
    }

    function update_new_messages() {
        return null;
    }

    update_invitations(client.handshake.user._id);
    update_new_messages(client.handshake.user._id);

    return {
        update_invitations: update_invitations,
        update_new_messages: update_new_messages,
        send: function(user_id, event, data) {
            io.sockets.in(events_room(user_id)).emit(event, data);
        },
    };
};
