(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

    app.filter('candidates_to_chat', function() {
        return function(input, e) {
            var out = [];
            if (input && e && e.except && !$.isArray(e.except)) {
                $.each(input, function() {
                    if (this._id !== e.except._id) {
                        out.push(this);
                    }
                });
            }
            return out;
        }
    });

    app.directive('chat', function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: "/templates/chat.html",
            link: function($scope, element) {
                app.proxy.on("messages", function(messages) {
                    $scope.$apply(function(s) {
                        s.messages = messages;
                    });
                    element.find(".messages").scrollTop(element.find(".messages").prop("scrollHeight"));
                    app.proxy.emit("read");
                });

                $scope.open_chat = function(c) {
                    app.cache["chat"] = JSON.stringify(c);
                    $scope.chat = c;
                    app.proxy.emit("open_chat", c);
                };

                $scope.send_message = function(message) {
                    app.proxy.emit("new_message", message);
                    element.find("textarea").val('').focus();
                };

                $scope.expand_full_screen = function() {
                    $scope.full_screen = !$scope.full_screen;
                    app.cache["full_screen"] = $scope.full_screen;
                };

                // --------------------------------------------

                $scope.call = function(chat) {
                    chat = chat || $scope.chat;
                    $scope.open_chat(chat);
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
