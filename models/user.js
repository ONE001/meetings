var crypto = require('crypto'),
    mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema,
    async = require('async'),
    util = require('util'),
    Friends = require('models/friends').Friends
;

var schema = new Schema({
    login: {
	type: String,
	unique: true,
	required: true,
    },
    username: {
	type: String,
    },
    hashedPassword: {
	type: String,
	required: true,
    },
    salt: {
	type: String,
	required: true,
    },
    created_at: {
	type: Date,
        default: Date.now,
    },
    ip: {
	type: String,
    },
    friends: {
        type: Schema.Types.ObjectId,
        ref: 'Friends',
    },
});

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password) {
	this._plainPassword = password;
	this.salt = Math.random() + '';
	this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
	return this._plainPassword;
    });

schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.virtual('name')
    .get(function() {
        return this.username || this.login;
    });

schema.statics.authorize = function(login, password, callback) {
    var User = this;

    async.waterfall([
	function(callback) {
	    User.findOne({login: login}, callback);
	},
	function(user, callback) {
	    if (user) {
		if (user.checkPassword(password))
		    callback(null, user);
		else
		    callback(new AuthError("Password incorrect"));
	    } else {
		var user = new User({login: login, password: password});

		user.save(function(err) {
		    if (err) return callback(err);

                    var friends = new Friends({ user: user._id });
                    friends.save(function(err, friends) {
                        user.friends = friends;
                        user.save(callback);
                    });
		});
	    }
	}
    ], callback);

};

exports.User = mongoose.model('User', schema);

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);
    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = "AuthError";

exports.AuthError = AuthError;
