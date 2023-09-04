const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async getMe(req, res) {
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

    // Retrieve the user object from the database
    const user = await dbClient
      .client
      .db()
      .collection('users')
      .findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user object with 'email' and 'id' only
    return res.status(200).json({ email: user.email, id: user._id });
  }
}

module.exports = UsersController;
