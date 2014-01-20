(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

    app.directive('chat', function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: "/templates/chat.html",
            link: function($scope, element) {
                var tag = 0,
                    hidden,
                    visibilityChange,
                    nt = window.webkitNotifications || window.Notification || null
                ;

                if (typeof document.hidden !== "undefined") {
                    hidden = "hidden";
                    visibilityChange = "visibilitychange";
                } else if (typeof document.mozHidden !== "undefined") {
                    hidden = "mozHidden";
                    visibilityChange = "mozvisibilitychange";
                } else if (typeof document.msHidden !== "undefined") {
                    hidden = "msHidden";
                    visibilityChange = "msvisibilitychange";
                } else if (typeof document.webkitHidden !== "undefined") {
                    hidden = "webkitHidden";
                    visibilityChange = "webkitvisibilitychange";
                }

                $scope.participants_status = function() {
                    if (!$scope.chat || !$scope.chat.participants) return;

                    $scope.chat.participants.forEach(function(participant) {
                        if ($scope.current_user && participant._id === $scope.current_user._id) {
                            participant.online = 1;
                            return;
                        }

                        if ($scope.friends)
                            $scope.friends.forEach(function(f) {
                                if (!f.f || !f.f.friend) return;
                                if (f.f.friend._id === participant._id)
                                    participant.online = f.online;
                            });
                    });
                };

                app.proxy.on("messages", function(chat) {
                    console.info("updated messages");
                    if (!chat) return;

                    $scope.$apply(function(s) {
                        s.chat.messages = chat.messages;
                        s.chat.participants = chat.participants;
                        s.participants_status();
                    });

                    element.find(".messages").scrollTop(element.find(".messages").prop("scrollHeight"));
                    app.proxy.emit("read");
                });

                $scope.open_chat = function(c) {
                    if (!c || ($scope.chat && c._id === $scope.chat._id)) return;
                    app.proxy.emit("open_chat", c);
                    $scope.new_message_focus = false;
                };

                $scope.get_chat_and_open_by_friend_id = function(friend_id) {
                    if (!friend_id || friend_id === $scope.current_user._id) return;
                    app.proxy.emit("get_chat_by_friend_id", friend_id);
                };

                app.proxy.on("opened_chat", function(chat) {
                    console.info("openned chat");
                    $scope.$apply(function(s) {
                        app.cache["chat"] = JSON.stringify(chat);
                        s.chat = chat;
                        s.new_message_focus = true;
                        //app.proxy.emit("need_update");
                    });
                });

                app.proxy.on("got_chat", function(chat) {
                    $scope.open_chat(chat);
                });

                app.proxy.on("received_message", function(data) {
                    console.info("received message");
                    $scope.$apply(function(s) {
                        s.chat.messages.push(data.msg);
                    });

                    element.find(".messages").scrollTop(element.find(".messages").prop("scrollHeight"));
                    app.proxy.emit("read");

                    if (!nt || !document[hidden]) return false;

                    var notification = {
                        body: data.msg.body,
                        tag: tag,
                        icon: null,
                    };

                    tag += 1;

                    if (nt.createNotification)
                        notification = nt.createNotification(notification.icon, data.msg.from.login, notification.body);
                    else
                        notification = new nt(data.msg.from.login, notification);

                    notification.onclick = function() {
                        notification.close();
                        $(window).focus();
                        $scope.open_chat(data.chat);
                        return true;
                    };

                    if (notification.show) {
                        notification.show();
                        setTimeout(function() { notification.close(); }, 5000);
                    }
                });

                $scope.send_message = function() {
                    if ($scope.new_message === '') return;
                    app.proxy.emit("new_message", $scope.new_message);
                    $scope.new_message = '';
                    $scope.new_message_focus = true;
                };

                $scope.expand_full_screen = function() {
                    $scope.full_screen = !$scope.full_screen;
                    app.cache["full_screen"] = $scope.full_screen;
                };

                var participants = element.find(".participants");

                jQuery.event.props.push("dataTransfer");

                participants.on("dragenter", function() {
                    $(this).addClass("dragover");
                });

                participants.on("dragover", function(e) {
                    $(this).addClass("dragover");
                    if (e.preventDefault) e.preventDefault();
                });

                participants.on("dragleave", function() {
                    $(this).removeClass("dragover");
                });

                participants.on("drop", function(e) {
                    $scope.add_to_chat(e.dataTransfer.getData('text/plain'));
                    if (e.stopPropagation) e.stopPropagation();
                    participants.removeClass("dragstart").removeClass("dragover");
                    $scope.$apply(function() {
                        $scope.addition = false;
                    });
                    return false;
                });

                $scope.add_to_chat = function(friend_id) {
                    if (!friend_id) return;
                    app.proxy.emit("add_to_chat", {chat_id: $scope.chat._id, person_id: friend_id});
                };

                // --------------------------------------------

                if (app.cache["chat"]) {
                    $scope.open_chat(JSON.parse(app.cache["chat"]));
                }

                $scope.full_screen = (app.cache["full_screen"] == "true");
                dfd.resolve();
            }, // link
        };
    });
}());
