const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { ObjectId } = require('mongodb');

class FilesController {
  static async putPublish(req, res) {
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

    // Convert ID to ObjectId for MongoDB query
    const fileId = ObjectId(id);

    // Find and update the file document
    const updatedFile = await dbClient
      .client
      .db()
      .collection('files')
      .findOneAndUpdate(
        { _id: fileId, userId },
        { $set: { isPublic: true } },
        { returnOriginal: false }
      );

    if (!updatedFile.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(updatedFile.value);
  }

  static async putUnpublish(req, res) {
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

    // Convert ID to ObjectId for MongoDB query
    const fileId = ObjectId(id);

    // Find and update the file document
    const updatedFile = await dbClient
      .client
      .db()
      .collection('files')
      .findOneAndUpdate(
        { _id: fileId, userId },
        { $set: { isPublic: false } },
        { returnOriginal: false }
      );

    if (!updatedFile.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(updatedFile.value);
  }
}

module.exports = FilesController;
