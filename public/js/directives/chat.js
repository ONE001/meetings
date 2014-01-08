(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

    app.directive('chat', function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: "/templates/chat.html",
            link: function($scope, element) {
                $scope.participants_status = function() {
                    if (!$scope.chat) return;

                    if ($scope.chat.participants && $scope.friends)
                        $scope.chat.participants.forEach(function(participant) {
                            $scope.friends.forEach(function(f) {
                                if (!f.f || !f.f.friend) return;
                                if (f.f.friend._id === participant._id || $scope.current_user._id === participant._id)
                                    participant.online = f.online;
                            });
                        });
                };

                app.proxy.on("messages", function(chat) {
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
                    app.proxy.emit("open_chat", c);
                };

                app.proxy.on("opened_chat", function(chat) {
                    $scope.$apply(function() {
                        app.cache["chat"] = JSON.stringify(chat);
                        $scope.chat = chat;
                        app.proxy.emit("need_update");
                    });
                });

                $scope.send_message = function(message) {
                    app.proxy.emit("new_message", message);
                    element.find("textarea").val('').focus();
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
