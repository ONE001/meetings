(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

    app.directive('friends', function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: "/templates/friends.html",
            link: function($scope, element) {
                app.proxy.on("friends", function(friends) {
                    $scope.$apply(function(s) {
                        s.friends = friends;
                        $scope.participants_status();
                    });
                });

                app.proxy.on("chats", function(chats) {
                    $scope.$apply(function(s) {
                        s.chats = chats;
                    });
                });

                $scope.approve_to_friends = function(friend) {
                    app.proxy.emit("approve-to-friends", friend._id);
                };

                $scope.remove_from_friends = function(friend) {
                    app.proxy.emit("remove-from-friends", friend._id);
                };

                dfd.resolve();

            }, // link
        };
    });

}())
