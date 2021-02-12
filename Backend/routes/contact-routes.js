const express = require("express");
const { check } = require("express-validator");

const contactsController = require("../controllers/contacts-controller");

const router = express.Router();

//router.use(checkAuth);
router.get("/getcontact/:uid", contactsController.getContacts);

router.post(
	"/addcontact/:uid",
	[
		check("name").not().isEmpty(),
		check("contactnum").not().isEmpty(),
		check("contactnum").isLength({ min: 10 }),
	],
	contactsController.addContact
);

router.delete("/deletecontact/:uid/:cid", contactsController.deleteContact);

module.exports = router;
