const { v2 } = require('cloudinary');
require('dotenv').config();

v2.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || 'doadarfy6').trim(),
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

(async function () {
    try {
        if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('Cloudinary API key or secret is not set in environment variables.');
        }
        const results = await v2.uploader.upload('./images/12.png');
        console.log(results);
    } catch (error) {
        console.error('Upload error:', error);
    }
})();
