module.exports = function(io, client, events) {
    var Chat = require('models/chat').Chat,
        User = require('models/user').User,
        config = require('config'),
        _chat
    ;

    function update_messages_in(room) {
        if (!_chat || !room) return;

        Chat.findOne({_id: _chat._id}).populate({ path: "messages.from", select: "username login"}).exec(function(err, chat) {
            io.sockets.in(room).emit("messages", chat.messages);
        });
    }

    // ------------------------------------------------------------

    client.on("open_chat", function(friend) {
        Chat.findOne(
            {participants: {
                $in: [friend._id, client.handshake.user._id],
                $size: 2,
            }}, function(err, chat) {
                if (chat) {
                    _chat = chat;
                } else {
                    var chat = new Chat();

                    User.find({$or: [{_id: client.handshake.user._id}, {_id: friend._id}]}, function(err, users) {
                        if (users.length !== 2) {
                            return;
                        }

                        chat.participants.push.apply(chat.participants, users);
                        chat.save();
                        _chat = chat;
                    });
                }
                var room = config.get("socket:key_for_private_rooms") + _chat._id;
                client.join(room);
                update_messages_in(room)
            }
        )
    });

    client.on("close_chat", function(friend) {
        var room = config.get("socket:key_for_private_rooms") + _chat._id;

        client.leave(room);
    });

    client.on("new_message", function(message) {
        if (!_chat._id) {
            return;
        }

        Chat.findOne({_id: _chat._id}, function(err, chat) {
            chat.messages.push({
                body: message,
                from: client.handshake.user,
            });
            chat.save(function() {
                update_messages_in(config.get("socket:key_for_private_rooms") + _chat._id);
            });
        });
    });
};
