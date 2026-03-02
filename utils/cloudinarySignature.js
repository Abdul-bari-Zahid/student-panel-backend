const crypto = require('crypto');

// Cloudinary signature must be SHA1 of the parameter string + API secret.
// Parameter string should be in alphabetical order (here: folder then timestamp).
exports.generateSignature = (folder, timestamp) => {
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  const stringToSign = `folder=${folder}&timestamp=${timestamp}`;
  return crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex');
};
