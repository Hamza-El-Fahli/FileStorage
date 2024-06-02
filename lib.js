const fs = require("fs");
const { exec } = require('child_process');
const path = require("path");

async function deleteFolderRecursive(resourcesFolderPath, callback) {
    fs.readdir(resourcesFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading resources folder:', err);
            return res.status(500).json({ error: 'Failed to read resources folder' });
        }


        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        });


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

    console.log('existing folder deleted successfully')
}


async function saveFile(filePath, file, Chapter_id, res) {
  

 fs.writeFileSync(filePath, file);
    console.log('PDF file saved!   '+Chapter_id);


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







module.exports = {deleteFolderRecursive, saveFile}