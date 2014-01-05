app.cache = window.sessionStorage || {};

app.directive("ngShiftEnter", function () {
    return function($scope, element, attrs) {
        element.bind("keydown", function (event) {
            if(event.which === 13 && event.shiftKey) {
                $scope.$apply(function () {
                    $scope[attrs.ngShiftEnter](element.val());
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

app
    .filter('newlines', function() {
        return function(text) {
            return text.replace(/\n/g, '<br/>');
        }
    })
    .filter('noHTML', function() {
        return function(text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
        }
    })
    .filter('links', function() {
        var
            //URLs starting with http://, https://, or ftp://
            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
            //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
            //Change email addresses to mailto:: links.
            replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
        ;

        return function(text) {
            return text
                .replace(replacePattern1, '<a href="$1" target="_blank">$1</a>')
                .replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>')
                .replace(replacePattern3, '<a href="mailto:$1">$1</a>')
            ;
        };
    })
;

app.controller("MainCtrl", ["$scope", function($scope) {
    $scope.current_user = null;

    this.init = function() {
        $.when.apply(this, app.promises).done(function() {
            console.info("init main controller");
            app.proxy.ready();
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
        $("<form method='post' action='" + action + "'>").appendTo("body").submit();
        app.cache.clear();
        return false;
    };

    return $scope.MainCtrl = this;
}]);
