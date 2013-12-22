app.proxy = function(ws, callback) {
    var s = io.connect(ws);

    this.on = function(event, callback) {
        s.on(event, callback);
        return this;
    };

    this.emit = function(event, data) {
        s.emit(event, data);
        return this;
    };

    if (typeof callback === "function") {
        callback.call(this, this);
    }

    return app.proxy = this;
};
