(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

    app.directive('events', function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: "/templates/events.html",
            link: function($scope, element) {
                $scope.invitations = [];
                $scope.unread_chats = [];

                app.proxy.on("invitations", function(invitations) { $scope.$apply(function(s) {
                    s.invitations = invitations;
                }); });

                dfd.resolve();
            }, // link
        };
    });

}());
