app.controller("MainCtrl", ["$scope", function($scope) {
    $scope.current_user = null;

    this.init = function() {
	console.info("init main controller");
    };

    this.navbar = function() {
        app.proxy.on("user", function(user) {
            console.log("current_user", user);
            $scope.$apply(function(s) {
                if (!user.friends) {
                    user.friends = {};
                }
                s.current_user = user;
            });
        });
    };

    // **********************************************************

    this.logout = function(action) {
        $("<form method='post' action='" + action + "'>").submit();
        return false;
    };

    return $scope.MainCtrl = this;
}]);
