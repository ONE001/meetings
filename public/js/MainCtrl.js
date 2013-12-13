app.controller("MainCtrl", ["$scope", function($scope) {
    this.init = function() {
	console.info("init main controller");

        app.socket.on("user", function(data) {
            console.log(data);
        });
    };

    this.navbar = function() {
        console.log(123);
    };

    this.logout = function(action) {
        $("<form method='post' action='" + action + "'>").submit();
        return false;
    };

    return $scope.MainCtrl = this;
}]);
