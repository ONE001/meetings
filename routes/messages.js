module.exports = function(io, client, events) {
    var Chat = require('models/chat').Chat,
        User = require('models/user').User,
        config = require('config'),
        async = require('async'),
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
        update_messages = function(only_last) {
            if (!_chat) return;

            async.waterfall([
                function(callback) {
                    Chat.findOne({_id: _chat._id})
                        .populate({
                            path: "messages.from",
                            select: "username login",
                        })
                        .populate({
                            path: "participants",
                            select: "username login",
                        })
                        .exec(callback)
                    ;
                },
                function(chat, callback) {
                    var messages = [], participants = [];

                    if (chat) {
                        messages = chat.messages;
                        participants = chat.participants;
                    }

                    if (only_last) {
                        io.sockets
                            .in(current_room())
                            .emit("received_message", {
                                msg: messages[messages.length - 1],
                                chat: {
                                    _id: _chat._id,
                                    name: _chat.name,
                                },
                            })
                        ;
                    } else {
                        io.sockets
                            .in(current_room())
                            .emit("messages", {
                                messages: messages,
                                participants: participants
                            })
                        ;
                    }
                }
            ]);

        },
        open_chat = function(c) {
            Chat.findOne({
                _id: c._id,
                participants: {
                    $in: [client.handshake.user._id],
                },
            }, function(err, chat) {
                if (chat) {
                    leave_room();
                    _chat = chat;
                    join_room();
                    update_messages();
                    client.emit("opened_chat", c);
                }
            });
        }
    ;

    // ------------------------------------------------------------

    client.on("open_chat", open_chat);
    client.on("update_messages", update_messages);

    client.on("close_chat", function() {
        var room = config.get("socket:key_for_private_rooms") + _chat._id;
        client.leave(room);
    });

    client.on("new_message", function(message) {
        if (!_chat._id) return;

        Chat.findOne({_id: _chat._id}, function(err, chat) {
            chat.participants.forEach(function(participant) {
                if (participant._id !== client.handshake.user._id) {
                    chat.not_read.addToSet(participant);
                }
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

            chat.save(function(err, chat) {
                update_messages(true);
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

    client.on('add_to_chat', function(d) {
        async.waterfall([
            function(callback) {
                Chat.findOne({
                    _id: d.chat_id,
                    $where: 'this.participants.length > 2',
                }, callback);
            },
            function(chat, callback) {
                User.findOne({_id: d.person_id}, function(err, user) {
                    callback(err, chat, user);
                });
            },
        ], function(err, chat, user) {
            if (!user) return;

            if (chat) {
                chat.participants.addToSet(user);

                chat.save(function() {
                    Chat.findOne({_id: chat._id})
                        .populate('participants')
                        .exec(function(err, chat) {
                            chat.name = '';
                            chat.participants.forEach(function(u) {
                                chat.name += u.name + ' ';
                            });
                            chat.name.trim();
                            chat.save(function() {
                                events.notify_friends();
                                open_chat(chat);
                            });

                        });
                });
            } else {
                Chat.findOne({_id: _chat.id})
                    .populate('participants')
                    .exec(function(err, c) {
                        chat = new Chat({ name: '' });

                        c.participants.forEach(function(u) {
                            chat.name += u.name + ' ';
                            chat.participants.addToSet(u);
                        });

                        chat.name += user.name
                        chat.participants.addToSet(user);

                        chat.save(function(err, chat) {
                            events.notify_friends();
                            open_chat(chat);
                        });
                    });
            }
        });
    });

    client.on('phone', function (message) {
	client.broadcast.to(current_room()).emit('phone', message);
    });
};
