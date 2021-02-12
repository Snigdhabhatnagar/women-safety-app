//This file consist of functions to control the backend routes action
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Users = require("../models/users-model");
const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
var NodeGeocoder = require("node-geocoder");
var geocoder = NodeGeocoder({
	provider: "opencage",
	apiKey: "a0357ccb779a46c89403ffa385f183e6",
});
const Hapi = require("@hapi/hapi");

const axios = require("axios");
const speech = require("@google-cloud/speech");
const ffmpeg = require("fluent-ffmpeg");
const client = new speech.SpeechClient();

//get all existing user data
const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await Users.find({}, "-Password");
	} catch {
		return next(
			new HttpError("Could Not Fetch Details.Please Try Again.", 500)
		);
	}
	res
		.status(200)
		.json({ Users: users.map((users) => users.toObject({ getters: true })) });
};

//Signing up a user
const signup = async (req, res, next) => {
	console.log("hit sign up");
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { First_name, Last_name, Password, Mobile_number } = req.body;
	let existingUser;
	try {
		existingUser = await Users.findOne({ Mobile_number: Mobile_number });
	} catch (err) {
		return next(new HttpError("Something went wrong!Please try again"), 500);
	}

	if (existingUser) {
		return next(new HttpError("User already exist.Please try instead", 401));
	}
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(Password, 12);
	} catch (err) {
		const error = new HttpError(
			"Could not hash password, please try again.",
			500
		);
		return next(error);
	}

	const createdUser = new Users({
		First_name,
		Last_name,
		Password: hashedPassword,
		Mobile_number,
	});

	try {
		await createdUser.save();
	} catch (err) {
		return next(
			new HttpError(
				"Creating request for the user Failed.Please Try again.",
				500
			)
		);
	}

	let token;
	try {
		token = jwt.sign(
			{ userId: createdUser.id, mobile_number: createdUser.Mobile_number },
			"women_safety_app_private_key",
			{ expiresIn: "1h" }
		);
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(error);
	}

	res.status(201).json({
		userId: createdUser.id,
		number: createdUser.Mobile_number,
		token: token,
		name: createdUser.First_name,
	});
};

//Logging in a user
const login = async (req, res, next) => {
	const { Mobile_number, Password } = req.body;
	let existingUser;
	try {
		existingUser = await Users.findOne({ Mobile_number: Mobile_number });
	} catch (error) {
		return next(new HttpError("Something went wrong!Please Try Again", 500));
	}

	if (!existingUser) {
		return next(
			new HttpError(
				"Could not identify user, credentials seem to be wrong.",
				401
			)
		);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(Password, existingUser.Password);
	} catch (err) {
		const error = new HttpError(
			"Could not log you in, please check your credentials and try again.",
			500
		);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError(
			"Invalid credentials, could not log you in.",
			401
		);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{ userId: existingUser.id, mobile_number: existingUser.Mobile_number },
			"women_safety_app_private_key",
			{ expiresIn: "1h" }
		);
	} catch (err) {
		const error = new HttpError(
			"Logging in failed, please try again later.",
			500
		);
		return next(error);
	}

	res.json({
		userId: existingUser.id,
		number: existingUser.Mobile_number,
		token: token,
		name: existingUser.First_name,
	});
};

const getUserDetailsById = async (req, res, next) => {
	const userId = req.params.uid;

	let userDetail;
	try {
		userDetail = await Users.findById(userId);
	} catch (err) {
		const error = new HttpError("Couldn't find user.", 500);
		return next(error);
	}

	res.status(200).json({
		First_name: userDetail.First_name,
		Last_name: userDetail.Last_name,
		Mobile_number: userDetail.Mobile_number,
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUserDetailsById = getUserDetailsById;
