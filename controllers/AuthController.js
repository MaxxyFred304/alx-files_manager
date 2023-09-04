const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const uuidv4 = require('uuid/v4');
const sha1 = require('sha1');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is provided
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode the Base64 auth header
    const authData = Buffer.from(authHeader.slice('Basic '.length), 'base64')
      .toString()
      .split(':');

    const email = authData[0];
    const password = authData[1];

    // Check if the email and password are provided
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Hash the provided password
    const hashedPassword = sha1(password);

    // Find the user with the provided email and hashed password
    const user = await dbClient
      .client
      .db()
      .collection('users')
      .findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random token
    const token = uuidv4();

    // Store the user ID in Redis with the token as the key (valid for 24 hours)
    await redisClient.client.setex(`auth_${token}`, 24 * 60 * 60, user._id.toString());

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const { token } = req.headers;

    // Check if the token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token in Redis
    await redisClient.client.del(`auth_${token}`);

    return res.status(204).send();
  }
}

module.exports = AuthController;
