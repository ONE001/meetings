(function() {
    app.directive('additionToChat', function() {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                var participants = $(".participants");

                element.on("dragstart", function(e) {
                    participants.addClass("dragstart");
                    e.dataTransfer.setData('friend_id', attrs.additionToChat);
                    $scope.$apply(function() {
                        $scope.addition = true;
                    });
                });

                element.on("dragend", function() {
                    participants.removeClass("dragstart").removeClass("dragover");
                    $scope.$apply(function() {
                        $scope.addition = false;
                    });
                });
            }, // link
        };
    });

}());
