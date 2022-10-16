const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const User = require('../models/user');
const Message = require('../models/message');
/** GET / - get list of users.
 * 
r
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
	const users = await User.all();
	return res.json({ users });
});
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', async (req, res, next) => {
	const { username } = req.params;
	const user = await User.get(username);
	return res.json({ user });
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
module.exports = router;
