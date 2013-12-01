var crypto = require('crypto'),
	mongoose = require('lib/mongoose'),
	Schema = mongoose.Schema;

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

exports.User = mongoose.model('User', schema);