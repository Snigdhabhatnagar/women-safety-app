const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Users = require("../models/users-model");

const HttpError = require("../models/http-error");
const addHotword = async (req, res, next) => {
	console.log(req.params.uid);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}
	const userId = req.params.uid;
	let user;
	try {
		user = await Users.findById(userId);
	} catch (err) {
		return next(new HttpError("Something went wrong! Please try again"), 500);
	}
	if (!user) {
		return next(new HttpError("Could Not find user for the provided id", 404));
	}
	const { word } = req.body;
	let existingWord = null;
	//console.log(user);
	existingWord = await Users.findOne({
		$and: [
			{ _id: userId },
			{
				hotWords: word,
			},
		],
	});
	if (existingWord) {
		return next(new HttpError("Word already exists.", 422));
	}
	//   console.log(user);
	try {
		await user.hotWords.push(word);
		await user.save();
	} catch (err) {
		console.log(err);
		const error = new HttpError(
			"Adding a Hot Word Failed. Please Try Again.",
			500
		);
		return next(error);
	}
	res.status(200).json({ hotWords: user.hotWords });
};

const getHotword = async (req, res, next) => {
	const user = req.params.uid;
	//console.log(user);
	let userfound;
	try {
		userfound = await Users.findById(user);
	} catch {
		return next(
			new HttpError("Could Not Fetch Details.Please Try Again.", 500)
		);
	}
	res.status(200).json({ hotWords: userfound.hotWords });
};

const deleteHotword = async (req, res, next) => {
	const userId = req.params.uid;
	const hotWordId = req.params.hid;
	let user;
	try {
		user = await Users.findById(userId);
	} catch (err) {
		return next(new HttpError("Something went wrong!Please try again"), 500);
	}
	if (!user) {
		return next(new HttpError("Could Not find user for the provided id", 404));
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await user.hotWords.pull(hotWordId);
		await user.save({ session: sess });
		sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			"Deleting contact Failed.Please Try Again.",
			500
		);
		return next(error);
	}
	res.status(200).json({ hotWord: "deleted" });
};

exports.addHotword = addHotword;
exports.deleteHotword = deleteHotword;
exports.getHotword = getHotword;
