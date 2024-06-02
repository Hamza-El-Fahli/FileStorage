// This file defines helper functions for managing files in the My Educraft App server.
// It includes functions for recursively deleting image files in a folder and for saving a PDF file and converting it to images.
const fs = require("fs");
const { exec } = require('child_process');
const path = require("path");

// Recursively deletes image files in a folder
async function deleteFolderRecursive(resourcesFolderPath, callback) {
    fs.readdir(resourcesFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading resources folder:', err);
            return res.status(500).json({ error: 'Failed to read resources folder' });
        }

        // Filter out image files (png, jpg, jpeg)
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        });

        // Delete each image file
        imageFiles.forEach(imageFile => {
            const imagePath = path.join(resourcesFolderPath, imageFile);
            fs.unlink(imagePath, err => {
                if (err) {
                    console.error(`Error deleting image ${imageFile}:`, err);
                } else {
                    console.log(`Image ${imageFile} deleted successfully`);
                }
            });
        });
    });

    console.log('Existing folder deleted successfully');
}

// Saves a PDF file and converts it to images
async function saveFile(filePath, file, Chapter_id, res) {
    // Save the PDF file
    fs.writeFileSync(filePath, file);
    console.log('PDF file saved! ');

    // Convert the PDF to images using a Python script
    exec(`python3 pdf2img.py '${filePath}' '${Chapter_id}'`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error converting PDF to images: ${error.message}`);
            return res.status(500).json({ error: 'Failed to convert PDF to images' });
        }
        if (stderr) {
            console.error(`Conversion stderr: ${stderr}`);
            return res.status(500).json({ error: 'Failed to convert PDF to images' });
        }

        console.log(`Conversion stdout: ${stdout}`);
        res.json({ message: 'PDF converted to images successfully' });
    });
}

module.exports = { deleteFolderRecursive, saveFile };
