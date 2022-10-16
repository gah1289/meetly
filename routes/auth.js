/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const User = require('../models/user');

router.get('/', (req, res, next) => {
	res.send('APP IS WORKING!!!');
});

router.post('/register', async (req, res, next) => {
	try {
		const { username, password, first_name, last_name, phone } = req.body;
		let newUser = await User.register({ username, password, first_name, last_name, phone });
		return res.json(newUser);
	} catch (e) {
		console.log(e);
		if (e.code === '23505') {
			return next(new ExpressError('Username taken. Please pick another!', 400));
		}
		return next(e);
	}
});

router.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (User.authenticate(username, password)) {
			User.updateLoginTimestamp(username);
			const token = jwt.sign({ username }, SECRET_KEY);
			return res.json({ message: `Logged in!`, token });
		}
		throw new ExpressError('Invalid username/password', 400);
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
