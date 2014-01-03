app.proxy = function(ws, callback) {
    var s = io.connect(ws),
        queue = (function() {
            var _requests = [];

            return {
                add: function() { return _requests.push(arguments); },
                shift: function() { return _requests.shift(); },
            };
        }()),
        that = this,
        ready = false
    ;

    this.ready = function() {
        if (s.socket.connected) s.emit("ready");
        return ready = true;
    };

    this.on = function(event, callback) {
        return s.on(event, callback);
    };

    this.emit = function(event, data) {
        if (!s.socket.connected || !ready) {
            return queue.add.apply(this, arguments);
        }
        return s.emit(event, data);
    };

    s.on("ready", function() {
        console.info('system is ready');
        var req;

        while(req = queue.shift()) {
            that.emit.apply(that, req);
        }

        if (typeof callback === "function") {
            callback.call(this, this);
        }
        ready = true;
    });

    s.on("connect", function () {
        console.info('connection established');
        if (ready) s.emit("ready");
    });

    return app.proxy = this;
};
