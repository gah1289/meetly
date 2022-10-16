/** User class for message.ly */
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const db = require('../db');
const jwt = require('jsonwebtoken');
/** User of the site. */

class User {
	/** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

	constructor(username, password, first_name, last_name, phone) {
		this.username = username;
		this.password = password;
		this.first_name = first_name;
		this.last_name = last_name;
		this.phone = phone;
	}

	static async register({ username, password, first_name, last_name, phone }) {
		if (!username || !password) {
			throw new ExpressError('Username and password required', 400);
		}
		if (!first_name || !last_name) {
			throw new ExpressError('First and last name required', 400);
		}
		if (!phone) {
			throw new ExpressError('Phone number required', 400);
		}

		// hash password
		const join_at = new Date();
		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		// save to db
		const results = await db.query(
			`
    INSERT INTO users (username, password, first_name, last_name, phone, join_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
			[
				username,
				hashedPassword,
				first_name,
				last_name,
				phone,
				join_at
			]
		);
		return results.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		if (!username || !password) {
			throw new ExpressError('Username and password required', 400);
		}
		const user = await db.query(
			`SELECT username, password
     FROM users
     WHERE username = $1`,
			[
				username
			]
		);
		if (!user) {
			throw new ExpressError('Invalid username/password', 400);
		}

		await bcrypt.compare(password, user.rows[0].password);
		return true;
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		const currDate = new Date();
		console.log(currDate);
		console.log(username);
		await db.query(`UPDATE users SET  last_login_at = $2 WHERE username=$1`, [
			username,
			currDate
		]);
	}

	/** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const results = await db.query(
			`
    SELECT * FROM users `
		);
		const users = results.rows.map((r) => new User(r.username, r.first_name, r.last_name, r.phone));

		// making data from pg table into js instances
		return users;
	}

	/** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

	static async get(username) {
		const results = await db.query(
			`
  SELECT * FROM users WHERE username=$1`,
			[
				username
			]
		);
		const r = results.rows[0];
		const user = new User(r.username, r.first_name, r.last_name, r.phone, r.join_at, r.login_at);

		// making data from pg table into js instances
		return user;
	}

	/** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesFrom(username) {}

	/** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesTo(username) {}
}

module.exports = User;
