(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

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
                    element.find("textarea").val('').focus();
                    element.find(".messages").scrollTop(element.find(".messages").prop("scrollHeight"));
                });

                $scope.open_chat = function(friend) {
                    $scope.chat = true;
                    app.proxy.emit("open_chat", friend);
                };

                $scope.send_message = function(message) {
                    app.proxy.emit("new_message", message);
                };

                dfd.resolve();
            }, // link
        };
    });

}());
