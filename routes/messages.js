const router = require('./auth');
const ExpressError = require('../expressError');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const User = require('../models/user');
const Message = require('../models/message');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async (req, res, next) => {
	const id = req.params.id;
	const message = await Message.get(id);
	return res.json({ message });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', async (req, res, next) => {
	const { from_username, to_username, body } = req.body;

	const message = await Message.create({ from_username, to_username, body });
	return res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

// router.post('/:id/read', async (req, res, next) => {
// 	const id = req.params.id;
// 	const message = await Message.get(id);
// 	return res.json({ message });
// });
module.exports = router;
