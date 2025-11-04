const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const uploadFileToFirebase = async (file) => {
  if (!file) {
    return null;
  }

  const fileName = `${uuidv4()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (error) => reject(error));

    blobStream.on('finish', async () => {
      try {
        // Make the file public
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { uploadFileToFirebase };