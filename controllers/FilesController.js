const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { ObjectId } = require('mongodb');

class FilesController {
  static async getShow(req, res) {
    const { token } = req.headers;
    const { id } = req.params;

    // Check if the token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the file document by ID and user
    const file = await dbClient
      .client
      .db()
      .collection('files')
      .findOne({ _id: ObjectId(id), userId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const { token } = req.headers;
    const { parentId = '0', page = 0 } = req.query;

    // Check if the token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Convert parentId to ObjectId for MongoDB query
    const parentIdObjectId = ObjectId(parentId);

    // Define the number of items per page
    const itemsPerPage = 20;

    // Calculate the skip value for pagination
    const skip = page * itemsPerPage;

    // Aggregate to fetch files with pagination
    const pipeline = [
      { $match: { parentId: parentIdObjectId, userId } },
      { $skip: skip },
      { $limit: itemsPerPage },
    ];

    const files = await dbClient
      .client
      .db()
      .collection('files')
      .aggregate(pipeline)
      .toArray();

    return res.status(200).json(files);
  }
}

module.exports = FilesController;
