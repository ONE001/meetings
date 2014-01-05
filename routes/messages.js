module.exports = function(io, client, events) {
    var Chat = require('models/chat').Chat,
        User = require('models/user').User,
        config = require('config'),
        _chat,
        join_room = function() {
            if (!_chat) return;
            var room = config.get("socket:key_for_private_rooms") + _chat._id;
            client.join(room);
        },
        leave_room = function() {
            if (!_chat) return;
            var room = config.get("socket:key_for_private_rooms") + _chat._id;
            client.leave(room);
        },
        update_messages = function() {
            if (!_chat) return;

            var room = config.get("socket:key_for_private_rooms") + _chat._id;

            Chat.findOne({_id: _chat._id})
                .populate({
                    path: "messages.from",
                    select: "username login",
                })
                .exec(function(err, chat) {
                    var messages = [];
                    if (chat) messages = chat.messages;
                    io.sockets.in(room).emit("messages", messages);
                });
        }
    ;

    // ------------------------------------------------------------

    client.on("open_chat", function(c) {
        Chat.findOne({
            _id: c._id,
            participants: {
                $in: [client.handshake.user._id],
                $size: 2,
            },
        }, function(err, chat) {
            if (chat) {
                leave_room();
                _chat = chat;
                join_room();
                update_messages();
            }
        });
    });

    client.on("close_chat", function() {
        var room = config.get("socket:key_for_private_rooms") + _chat._id;
        client.leave(room);
    });

    client.on("new_message", function(message) {
        if (!_chat._id) return;

        Chat.findOne({_id: _chat._id}, function(err, chat) {
            chat.participants.forEach(function(participant) {
                if (participant._id !== client.handshake.user._id)
                    chat.not_read.addToSet(participant);
            });

            setTimeout(function() {
                Chat.findOne({_id: _chat._id}, function(err, chat) {
                    chat.not_read.forEach(function(user_id) {
                        events.update_new_messages(user_id);
                    });
                });
            }, 1500);

            chat.messages.push({
                body: message,
                from: client.handshake.user,
            });

            chat.save(function() {
                update_messages();
            });
        });
    });

    client.on("read", function() {
        Chat.findOne({_id: _chat._id}, function(err, chat) {
            chat.not_read.remove(client.handshake.user);
            chat.save(function() {
                events.update_new_messages(client.handshake.user._id);
            });
        });
    });
};
