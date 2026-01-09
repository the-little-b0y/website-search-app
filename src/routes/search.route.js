const express = require("express");
const { searchWebsite } = require("../controllers/search.controller");

const router = express.Router();

router.post("/", searchWebsite);

module.exports = router;
