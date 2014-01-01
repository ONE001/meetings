module.exports = function(client) {
    var User = require('models/user').User,
        Friends = require('models/friends').Friends,
        async = require('async')
    ;

    // user
    function update_current_user() {
        User.findById(client.handshake.user)
            .populate('friends')
            .exec(function(err, user) {
                client.emit('user', user);

                Friends
                    .findOne({_id: user.friends._id})
                    .populate({
                        path: 'approved',
                        select: 'username login'
                    })
                    .exec(function(err, friends) {
                        client.emit('friends', friends.approved);
                    });
            });
    }

    update_current_user();

    // =========================================================

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

        function invitation(user, callback) {
            if (!user.friends) {
                var friends = new Friends({ user: user._id });

                friends.save(function() {
                    user.friends = friends;
                    user.save(function() { callback(friends); });
                });
            } else
                callback(user.friends);
        }

        // received
        User.findOne({ _id: user_id })
            .populate('friends')
            .exec(function(err, user1) {
                invitation(user1, function(friends) {
                    friends.received_invitations.push(client.handshake.user);
                    friends.save();
                });

                // sent
                User.findOne({ _id: client.handshake.user._id })
                    .populate("friends")
                    .exec(function(err, user2) {
                        invitation(user2, function(friends) {
                            friends.sent_invitations.push(user1);
                            friends.save();
                            update_current_user();
                            client.emit('added-to-friends', true);
                        });
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
                user1.friends.approved.remove(user2);
                user1.friends.sent_invitations.remove(user2);
                user1.friends.received_invitations.remove(user2);
                user2.friends.approved.remove(user1);
                user2.friends.sent_invitations.remove(user1);
                user2.friends.received_invitations.remove(user1);

                user1.friends.save(function(err) {
                    if (err) callback(err);
                    user2.friends.save(function(err) {
                        if (err) callback(err);
                        callback(null, user1, user2);
                    });
                });
            }
        ], function(err, user1, user2) {
            update_current_user();
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
                user1.friends.approved.push(user2);
                user1.friends.sent_invitations.remove(user2);
                user1.friends.received_invitations.remove(user2);
                user2.friends.approved.push(user1);
                user2.friends.sent_invitations.remove(user1);
                user2.friends.received_invitations.remove(user1);

                user1.friends.save(function(err) {
                    if (err) callback(err);
                    user2.friends.save(function(err) {
                        if (err) callback(err);
                        callback(null, user1, user2);
                    });
                });
            }
        ], function(err) {
            update_current_user();
            client.emit('approved-to-friends', true);
        });
    });
};
