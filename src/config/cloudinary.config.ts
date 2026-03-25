import {v2 as cloudinary } from 'cloudinary';

import env from './env';

cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const cloudinaryUpload = cloudinary;