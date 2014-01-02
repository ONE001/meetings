(function() {
    var dfd = $.Deferred();

    app.promises.push(dfd);

    app.directive('events', function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: "/templates/events.html",
            link: function($scope, element) {
                $scope.amount_of_received_invitations = 0;
                $scope.amount_of_new_messages = 0;

                app.proxy.on("invitations", function(invitations) { $scope.$apply(function(s) {
                    s.invitations = invitations;
                    s.amount_of_received_invitations = s.invitations.length;
                }); });

                // not_read_messages

                dfd.resolve();
            }, // link
        };
    });

}());
