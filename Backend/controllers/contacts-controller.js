const mongoose = require("mongoose");
const Users = require("../models/users-model");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

//Add new emergency contact
const addContact = async (req, res, next) => {
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
		return next(new HttpError("Something went wrong!Please try again"), 500);
	}
	if (!user) {
		return next(new HttpError("Could Not find user for the provided id", 404));
	}

	const { name, contactnum } = req.body;

	let existingContact = null;
	existingContact = await Users.findOne({
		$and: [
			{ _id: userId },
			{
				Contacts: { $elemMatch: { contact: contactnum } },
			},
		],
	});
	if (existingContact) {
		return next(new HttpError("Contact already exists.", 422));
	}

	try {
		if (user.Contacts.length >= 3) {
			return next(new HttpError("Contacts limit exceeded", 422));
		}
		await user.Contacts.push({ contact: contactnum, name: name });
		await user.save();
	} catch (err) {
		const error = new HttpError(
			"Adding contacts Failed.Please Try Again.",
			500
		);
		return next(error);
	}
	res.status(200).json({ Users: user.Contacts });
};

//get all user contacts
const getContacts = async (req, res, next) => {
	const user = req.params.uid;
	console.log(user);
	let userfound;
	try {
		userfound = await Users.findById(user);
	} catch {
		return next(
			new HttpError("Could Not Fetch Details.Please Try Again.", 500)
		);
	}
	res.status(200).json({ Users: userfound.Contacts });
};

//Delete emergency contact
const deleteContact = async (req, res, next) => {
	const userId = req.params.uid;
	const contactId = req.params.cid;
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
		await user.Contacts.pull(contactId);
		await user.save({ session: sess });
		sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			"Deleting contact Failed.Please Try Again.",
			500
		);
		return next(error);
	}
	res.status(200).json({ Contact: "deleted" });
};

exports.addContact = addContact;
exports.deleteContact = deleteContact;
exports.getContacts = getContacts;
