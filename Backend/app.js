const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/user-routes");
const contactRoutes = require("./routes/contact-routes");
const hotWordRoutes = require("./routes/hotword-routes");

const HttpError = require("./models/http-error");
const Hapi = require("@hapi/hapi");
const fs = require("fs");
const axios = require("axios");
const speech = require("@google-cloud/speech");
const ffmpeg = require("fluent-ffmpeg");
const client = new speech.SpeechClient();

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
	next();
});

app.use("/api/users", usersRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/hotword", hotWordRoutes);

app.use((req, res, next) => {
	const error = new HttpError("Could not find this route.", 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
	.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
	.then(() => {
		const server = app.listen(process.env.PORT || 5001);
	})
	.catch((err) => console.log(err));
