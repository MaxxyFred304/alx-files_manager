const dbClient = require('../utils/db');
const sha1 = require('sha1');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exists in the database
    const userExists = await dbClient
      .client
      .db()
      .collection('users')
      .findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'Already exists' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Create the new user
    const newUser = {
      email,
      password: hashedPassword,
    };

    // Insert the new user into the 'users' collection
    const result = await dbClient
      .client
      .db()
      .collection('users')
      .insertOne(newUser);

    // Return the newly created user with only 'email' and 'id'
    const createdUser = {
      email: result.ops[0].email,
      id: result.ops[0]._id,
    };

    return res.status(201).json(createdUser);
  }
}

module.exports = UsersController;
