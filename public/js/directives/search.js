app.directive('search', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: "/templates/search.html",
        link: function($scope, element) {
            var button = element.find("button"),
                input = element.find("input")
            ;

            function find_people() {
                input.popover("destroy");
                if (input.val().length > 0) {
                    app.proxy.emit("find_people", input.val());
                }
            }

            input.on("keyup", function(event) {
                if (event.keyCode === 13) {
                    find_people();
                }
            });

            button.on("click", find_people);

            // add to friends
            element.on("click", ".add-to-friends", function() {
                app.proxy.emit("add-to-friends", $(this).parent("div[data-id]").data("id"));
            });

            // remove from friends
            element.on("click", ".remove-from-friends", function() {
                app.proxy.emit("remove-from-friends", $(this).parent("div[data-id]").data("id"));
            });

            element.on("click", ".approve-to-friends", function() {
                app.proxy.emit("approve-to-friends", $(this).parent("div[data-id]").data("id"));
            });

            app.proxy.on("added-to-friends", function(data) {
                if (data) find_people();
            });
            app.proxy.on("removed-from-friends", function(data) {
                if (data) find_people();
            });
            app.proxy.on("approved-to-friends", function(data) {
                if (data) find_people();
            });

            app.proxy.on("found_people", function(people) {
                $scope.$apply(function(s) {
                    var content = "",
                        friends = s.current_user.friends
                    ;

                    $.each(people, function() {
                        if (s.current_user._id === this._id)
                            return;

                        content += "<div data-id='" + this._id + "'>";
                        content += this.login;

                        // approved friends by both
                        if (friends.approved && $.inArray(this._id, friends.approved) !== -1) {
                            content += "&nbsp;<span class='remove-from-friends glyphicon glyphicon-minus'></span>";
                        // sent_invitations
                        } else if (friends.sent_invitations && $.inArray(this._id, friends.sent_invitations) !== -1) {
                            content += "&nbsp;<span class='remove-from-friends glyphicon glyphicon-minus'></span>";
                        // received_invitations
                        } else if (friends.received_invitations && $.inArray(this._id, friends.received_invitations) !== -1) {
                            content += "&nbsp;<span class='approve-to-friends glyphicon glyphicon-ok-sign'></span>";
                            content += "&nbsp;<span class='remove-from-friends glyphicon glyphicon-minus'></span>";
                        // send invitation
                        } else {
                            content += "&nbsp;<span class='add-to-friends glyphicon glyphicon-plus'></span>";
                        }

                        content += "</div>";
                    });

                    input.data("content", content);

                    input.popover("show");
                    $(document).click(function(event) {
                        if (!$(event.target).parents(".search-people").length)
                            input.popover("destroy");
                    });
                });
            }); // found_people

        }, // link

    };
});
