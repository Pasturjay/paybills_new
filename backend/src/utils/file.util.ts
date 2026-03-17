import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Saves a base64 string as an image file and returns the relative path.
 * @param base64String The complete base64 string (e.g. data:image/png;base64,iVBORw0KGgo...)
 * @param folder The target subfolder inside the uploads directory.
 * @returns The relative URI of the saved file (e.g. /uploads/giftcards/uuid.png)
 */
export const saveBase64Image = (base64String: string, folder: string): string => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    const mimeType = matches[1];
    const extension = mimeType.split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');

    const fileName = `${uuidv4()}.${extension}`;
    const uploadDir = path.join(__dirname, '../../uploads', folder);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${folder}/${fileName}`;
};
