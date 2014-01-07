module.exports = function(io, client, events) {
    var Chat = require('models/chat').Chat,
        User = require('models/user').User,
        config = require('config'),
        _chat,
        current_room = function() {
            return config.get("socket:key_for_private_rooms") + _chat._id;
        },
        join_room = function() {
            if (!_chat) return;
            client.join(current_room());
        },
        leave_room = function() {
            if (!_chat) return;
            client.leave(current_room());
        },
        update_messages = function() {
            if (!_chat) return;

            Chat.findOne({_id: _chat._id})
                .populate({
                    path: "messages.from",
                    select: "username login",
                })
                .exec(function(err, chat) {
                    var messages = [];
                    if (chat) messages = chat.messages;
                    io.sockets.in(current_room()).emit("messages", messages);
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

    client.on('read', function() {
        Chat.findOne({_id: _chat._id}, function(err, chat) {
            chat.not_read.remove(client.handshake.user);
            chat.save(function() {
                events.update_new_messages(client.handshake.user._id);
            });
        });
    });

    client.on('phone', function (message) {
	client.broadcast.to(current_room()).emit('phone', message);
    });
};
