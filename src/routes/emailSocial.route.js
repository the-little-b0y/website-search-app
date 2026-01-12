const express = require("express");
const { emailSocialExtractor } = require("../controllers/emailSocial.controller");
const apiKeyAuth = require("../middlewares/apiKeyAuth");

const router = express.Router();

router.post("/", apiKeyAuth, emailSocialExtractor);

module.exports = router;
