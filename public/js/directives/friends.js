app.directive('friends', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: "/templates/friends.html",
        link: function($scope, element) {
            app.proxy.on("friends", function(friends) {
                $scope.$apply(function(s) {
                    s.friends = friends;
                });
            });

            $scope.open_chat = function(friend) {
                console.log(friend);
            };

            $scope.remove_from_friends = function(friend) {
                app.proxy.emit("remove-from-friends", friend._id);
            };

        }, // link
    };
});
