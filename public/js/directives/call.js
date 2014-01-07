(function() {
    app.directive('call', function() {
        return {
            restrict: 'A',
            link: function($scope, element) {
                var PeerConnection = window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection || window.PeerConnection,
                    IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate,
                    SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription,
                    pc
                ;

                navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                window.URL = window.URL || window.webkitURL;

                function gotStream(stream) {
                    element.append($("<video autoplay src='" + URL.createObjectURL(stream) + "'></video>"));

                    pc = new PeerConnection(null);
                    pc.addStream(stream);
                    pc.onicecandidate = function(event) {
                        if (event.candidate) {
                            app.proxy.emit("phone", {
                                type: "candidate",
                                label: event.candidate.sdpMLineIndex,
                                id: event.candidate.sdpMid,
                                candidate: event.candidate.candidate
                            });
                        }
                    };
                    pc.onaddstream = function(event) {
                        element.append($("<video autoplay src='" + URL.createObjectURL(event.stream) + "'></video>"));
                    };
                }

                function gotLocalDescription(description) {
                    pc.setLocalDescription(description);
                    app.proxy.emit("phone", description);
                }

                // Step 2. createOffer
                function createOffer() {
                    pc.createOffer(
                        gotLocalDescription,
                        function(error) { console.log(error) },
                        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
                    );
                }

                // Step 3. createAnswer
                function createAnswer() {
                    pc.createAnswer(
                        gotLocalDescription,
                        function(error) { console.log(error) },
                        { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
                    );
                }

                app.proxy.on("phone", function (message) {
                    if (message.type === 'offer') {
                        if (!pc) {
                            // Step 1. getUserMedia
                            navigator.getUserMedia(
                                { audio: true, video: true },
                                function(stream) {
                                    gotStream(stream);
                                    pc.setRemoteDescription(new SessionDescription(message));
                                    createAnswer();
                                },
                                function(error) { console.log(error) }
                            );
                        } else {
                            pc.setRemoteDescription(new SessionDescription(message));
                            createAnswer();
                        }
                    }
                    else if (message.type === 'answer') {
                        pc.setRemoteDescription(new SessionDescription(message));
                    }
                    else if (message.type === 'candidate') {
                        var candidate = new IceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
                        pc.addIceCandidate(candidate);
                    }
                });

                $scope.call = function(chat) {
                    if (!pc) {
                        // Step 1. getUserMedia
                        navigator.getUserMedia(
                            { audio: true, video: true },
                            function(stream) {
                                gotStream(stream);
                                createOffer();
                            },
                            function(error) { console.log(error) }
                        );
                    } else {
                        createOffer();
                    }

                    chat = chat || $scope.chat;
                    $scope.chat.calling = true;
                    $scope.open_chat(chat);
                };

                // --------------------------------------------
            }, // link
        };
    });

}());
