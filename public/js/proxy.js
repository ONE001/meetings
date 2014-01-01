app.proxy = function(ws, callback) {
    var s = io.connect(ws),
        queue = (function() {
            var _requests = [];

            return {
                add: function() { return _requests.push(arguments); },
                shift: function() { return _requests.shift(); },
            };
        }()),
        that = this
    ;

    this.on = function(event, callback) {
        return s.on(event, callback);
    };

    this.emit = function(event, data) {
        if (!s.socket.connected) {
            return queue.add.apply(this, arguments);
        }
        return s.emit(event, data);
    };

    s.on("connect", function () {
        console.info('connection established');

        var req;

        while(req = queue.shift()) {
            that.emit.apply(that, req);
        }

        if (typeof callback === "function") {
            callback.call(this, this);
        }
    });

    return app.proxy = this;
};
