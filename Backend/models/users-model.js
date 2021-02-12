const mongoose = require("mongoose");
const uniquevalidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	First_name: { type: String, required: true },
	Last_name: { type: String },
	Password: { type: String, required: true, minlength: 6 },
	Mobile_number: { type: Number, required: true, unique: true },
	Contacts: [
		{
			name: { type: String },
			contact: { type: Number },
		},
	],
	hotWords: [],
});
userSchema.plugin(uniquevalidator);
module.exports = mongoose.model("User", userSchema);
