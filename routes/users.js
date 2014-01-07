module.exports = function(io, client, events) {
    var User = require('models/user').User,
        Friends = require('models/friends').Friends,
        async = require('async'),
        Chat = require('models/chat').Chat
    ;

    // user
    function update() {
        User.findById(client.handshake.user)
            .populate('friends')
            .exec(function(err, user) {
                client.emit('user', user);

                if (user.friends) {
                    Friends.approvedById(user.friends._id, function(approved) {
                        var res = [];
                        approved.forEach(function(a) {
                            var current = {f: a}
                            current.online = io.sockets.clients(events.room(a.friend._id)).length;
                            res.push(current);
                        });
                        client.emit('friends', res);
                    });
                }
            })
        ;
    }

    update();

    // =========================================================

    client.on('need_update', update);

    client.on('find_people', function(str) {
        User
            .aggregate(
                { $match: { login: str } },
                { $project: {_id: 1, login: 1} }
            )
            .exec(function() {
                client.emit('found_people', arguments[1]);
            });
    });

    // =========================================================

    client.on('add-to-friends', function(user_id) {
        if (client.handshake.user._id === user_id) return;

        // received
        User.findOne({ _id: user_id })
            .populate('friends')
            .exec(function(err, user1) {
                user1.friends.received_invitations.push(client.handshake.user);
                user1.friends.save(function() {
                    events.update_invitations(user1._id);
                });

                // sent
                User.findOne({ _id: client.handshake.user._id })
                    .populate("friends")
                    .exec(function(err, user2) {
                        user2.friends.sent_invitations.push(user1);
                        user2.friends.save();
                        update();
                        client.emit('added-to-friends', true);
                    });
            });
    });

    // =========================================================

    client.on('remove-from-friends', function(user_id) {
        async.waterfall([
            function(callback) {
                User.findById(user_id)
                    .populate('friends')
                    .exec(function(err, user1) {
                        callback(err, user1);
                    });
            },
            function(user1, callback) {
                User.findById(client.handshake.user._id)
                    .populate('friends')
                    .exec(function(err, user2) {
                        callback(err, user1, user2);
                    });
            },
            function(user1, user2, callback) {
                user1.friends.approved.forEach(function(f) {
                    if (user2._id.toHexString() == f.friend.toHexString())
                        user1.friends.approved.remove(f);
                });
                user1.friends.sent_invitations.remove(user2);
                user1.friends.received_invitations.remove(user2);

                user2.friends.approved.forEach(function(f) {
                    if (f.friend.toHexString() == user1._id.toHexString())
                        user2.friends.approved.remove(f);
                });
                user2.friends.sent_invitations.remove(user1);
                user2.friends.received_invitations.remove(user1);

                user1.friends.save(function(err) {
                    if (err) callback(err);
                    events.update_invitations(user1._id);
                    Friends.approvedById(user1.friends._id, function(approved) {
                        events.send(user1._id, "friends", approved);
                    });
                    user2.friends.save(function(err) {
                        if (err) callback(err);
                        events.update_invitations(user2._id);
                        Friends.approvedById(user2.friends._id, function(approved) {
                            events.send(user2._id, "friends", approved);
                        });
                        callback(null, user1, user2);
                    });
                });
            }
        ], function(err, user1, user2) {
            update();
            client.emit('removed-from-friends', true);
        });
    });

    // =========================================================

    client.on('approve-to-friends', function(user_id) {
        async.waterfall([
            function(callback) {
                User.findById(user_id)
                    .populate('friends')
                    .exec(function(err, user1) {
                        callback(err, user1);
                    });
            },
            function(user1, callback) {
                User.findById(client.handshake.user._id)
                    .populate('friends')
                    .exec(function(err, user2) {
                        callback(err, user1, user2);
                    });
            },
            function(user1, user2, callback) {
                var chat = new Chat({name: ''});

                [user1, user2].forEach(function(user) {
                    chat.name += user.name + ' ';
                    chat.participants.addToSet(user);
                });

                chat.name.trim();
                chat.save(function(err, chat) {
                    user1.friends.approved.push({friend: user2, chat: chat});
                    user1.friends.sent_invitations.remove(user2);
                    user1.friends.received_invitations.remove(user2);
                    user2.friends.approved.push({friend: user1, chat: chat});
                    user2.friends.sent_invitations.remove(user1);
                    user2.friends.received_invitations.remove(user1);

                    user1.friends.save(function(err) {
                        if (err) callback(err);
                        events.update_invitations(user1._id);
                        Friends.approvedById(user1.friends._id, function(approved) {
                            events.send(user1._id, "friends", approved);
                        });
                        user2.friends.save(function(err) {
                            if (err) callback(err);
                            events.update_invitations(user2._id);
                            Friends.approvedById(user2.friends._id, function(approved) {
                                events.send(user2._id, "friends", approved);
                            });
                            callback(null, user1, user2);
                        });
                    });
                });

            }
        ], function(err) {
            update();
            client.emit('approved-to-friends', true);
        });
    });
};
