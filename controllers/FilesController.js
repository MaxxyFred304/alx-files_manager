const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FilesController {
  static async postUpload(req, res) {
    const { token } = req.headers;
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Check if the token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const userId = await redisClient.client.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check for missing name, type, or data
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check if parentId is set
    if (parentId !== 0) {
      const parentFile = await dbClient
        .client
        .db()
        .collection('files')
        .findOne({ _id: parentId });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Create a local path for storing the file
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const localPath = `${folderPath}/${uuidv4()}`;

    // Store the file locally
    if (type !== 'folder') {
      const fileDataBuffer = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, fileDataBuffer);
    }

    // Create the new file document
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath: type !== 'folder' ? localPath : undefined,
    };

    // Insert the new file into the 'files' collection
    const result = await dbClient
      .client
      .db()
      .collection('files')
      .insertOne(newFile);

    return res.status(201).json(result.ops[0]);
  }
}

module.exports = FilesController;
