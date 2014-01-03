module.exports = function(io, client, events) {
    var Chat = require('models/chat').Chat,
        User = require('models/user').User,
        config = require('config'),
        _chat
    ;

    function update_messages_in(room) {
        if (!_chat || !room) return;

        Chat.findOne({_id: _chat._id}).populate({ path: "messages.from", select: "username login"}).exec(function(err, chat) {
            var messages = [];
            if (chat) messages = chat.messages;
            io.sockets.in(room).emit("messages", messages);
        });
    }

    // ------------------------------------------------------------

    client.on("open_chat", function(c) {
        var callback = function() {
            var room = config.get("socket:key_for_private_rooms") + _chat._id;
            client.join(room);
            update_messages_in(room);
        }

        if (typeof c === "string") {
            Chat.findOne({_id: c}, function(err, chat) {
                if (chat) {
                    _chat = chat;
                    callback();
                }
            });
        } else {

            Chat.findOne(
                {participants: {
                    $all: [c._id, client.handshake.user._id],
                    $size: 2,
                }}, function(err, chat) {
                    if (chat) {
                        _chat = chat;
                        callback();
                    } else {
                        var chat = new Chat();

                        User.find({$or: [{_id: client.handshake.user._id}, {_id: c._id}]}, function(err, users) {
                            if (users.length !== 2) {
                                return;
                            }

                            if (!chat.name) chat.name = ''

                            users.forEach(function(user) {
                                chat.name += ' ' + user.name;
                                chat.participants.addToSet(user);
                            });

                            chat.save();
                            _chat = chat;
                            callback();
                        });
                    }
                }
            )

        }
    });

    client.on("close_chat", function(friend) {
        var room = config.get("socket:key_for_private_rooms") + _chat._id;

        client.leave(room);
    });

    client.on("new_message", function(message) {
        if (!_chat._id) return;

        Chat.findOne({_id: _chat._id}, function(err, chat) {
            if (!chat.not_read) chat.not_read = [];

            chat.not_read.addToSet.apply(chat.not_read, chat.participants);

            setTimeout(function() {
                Chat.findOne({_id: _chat._id}, function(err, chat) {
                    chat.not_read.forEach(function(user_id) {
                        events.update_new_messages(user_id);
                    });
                });
            }, 1000);

            chat.messages.push({
                body: message,
                from: client.handshake.user,
            });
            chat.save(function() {
                update_messages_in(config.get("socket:key_for_private_rooms") + _chat._id);
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
