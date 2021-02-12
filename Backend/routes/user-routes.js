const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.get("/", usersController.getUsers);

router.get("/:uid", usersController.getUserDetailsById);

router.post(
	"/signup",
	[
		check("First_name").not().isEmpty(),
		check("Mobile_number").not().isEmpty(),
		check("Password").isLength({ min: 6 }),
	],
	usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;
