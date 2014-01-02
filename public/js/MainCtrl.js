app.directive("ngEnter", function () {
    return function($scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13 && event.shiftKey) {
                $scope.$apply(function () {
                    $scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.directive("ngTooltip", function() {
    return function($scope, element, attrs) {
        element.attr("data-toogle", "tooltip");
        element.attr("data-placement", "bottom");

        attrs.$observe("ngTooltip", function() {
            element.attr("data-original-title", attrs["ngTooltip"]);
        });

        element.tooltip();
    };
});

app.controller("MainCtrl", ["$scope", function($scope) {
    $scope.current_user = null;

    this.init = function() {
        $.when.apply(this, app.promises).done(function() {
            console.info("init main controller");
            app.proxy.emit("ready");
        });
    };

    this.navbar = function() {
        app.proxy.on("user", function(user) {
            console.info("current_user - ", user);
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
