// worker.js
const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  // Fetch the file document from the database based on fileId and userId
  const fileDocument = await dbClient
    .client
    .db()
    .collection('files')
    .findOne({ _id: ObjectId(fileId), userId });

  if (!fileDocument) {
    throw new Error('File not found');
  }

  // Generate thumbnails with different sizes (500, 250, 100)
  const sizes = [500, 250, 100];
  const thumbnails = await Promise.all(
    sizes.map(async (size) => {
      const thumbnail = await imageThumbnail(fileDocument.localPath, { width: size });
      return { size, thumbnail };
    })
  );

  // Store the thumbnails with appropriate names
  const thumbnailFiles = thumbnails.map(({ size, thumbnail }) => {
    const thumbnailPath = fileDocument.localPath.replace(/(\.[\w\d_-]+)$/i, `_${size}$1`);
    fs.writeFileSync(thumbnailPath, thumbnail);
    return { size, path: thumbnailPath };
  });

  return thumbnailFiles;
});
