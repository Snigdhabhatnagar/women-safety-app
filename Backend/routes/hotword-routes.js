const express = require("express");
const { check } = require("express-validator");

const hotWordController = require("../controllers/hotword-controller");

const router = express.Router();

router.post(
	"/add-hotword/:uid",
	// [check("hotword").not().isEmpty()],
	hotWordController.addHotword
);
router.delete("/delete-hotword/:uid/:hid", hotWordController.deleteHotword);
router.get("/get-hotword/:uid", hotWordController.getHotword);

module.exports = router;
