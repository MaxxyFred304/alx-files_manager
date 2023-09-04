const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const mime = require('mime-types');

class FilesController {
  static async getFile(req, res) {
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

    // Find the file document
    const file = await dbClient
      .client
      .db()
      .collection('files')
      .findOne({ _id: fileId });

    // Check if the file document exists
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Check if the file is public or the user is the owner
    if (!file.isPublic && file.userId !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Check if the file is a folder
    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    // Check if the file exists locally
    if (!fs.existsSync(file.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Determine the MIME type based on the file name
    const mimeType = mime.lookup(file.name);

    // Read and send the file content with the appropriate MIME type
    const fileContent = fs.readFileSync(file.localPath);
    res.setHeader('Content-Type', mimeType);
    res.send(fileContent);
  }
}

module.exports = FilesController;
