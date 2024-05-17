const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const pfd2img = require("./pfd2img");
const app = express();
const PORT = 7676;


const upload = multer();

// Handle POST requests to upload a file

app.post("/upload", upload.single("PDFFile"), async (req, res) => {
    const file = req.file.buffer;
    const Chapter_id = req.body.Chapter_id;
    const filePath = `resources/${Chapter_id}.pdf`;
    console.log('file uploaded')

    fs.access(filePath, fs.constants.F_OK, async (err) => {
        if (!err) {
            // if folder exists then clean it
            fs.mkdir('resources/' + Chapter_id, async (err) => {
                if (err) {
                    //   console.error('Error creating folder:', err);
                    console.log('Deleting execisting folder\'s content ....')
                    await deleteFolderRecursive(filePath.split('.pdf')[0]);

                    return;
                }
                console.log('Folder created successfully');
            });
            // File exists, so delete it
            fs.unlink(filePath, async (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                    res.status(500).json({ error: 'Failed to replace file' });
                    return;
                }

            
                // File deleted, proceed with saving new file
                saveFile(filePath, file, Chapter_id, res);
            });
        } else {
            // File does not exist, proceed with saving new file
            saveFile(filePath, file, Chapter_id, res);
        }
    });
});

async function saveFile(filePath, file, Chapter_id, res) {
    //     const data = await convertPdfToImg(file)


    //    for(let i=0 ; i<data.length ; i++){
    //      fs.writeFile(`resources/${Chapter_id}/${i}.png`, data[i].content, function (err) {
    //         if (err) {
    //             console.error('Error saving file:', err);
    //             res.status(500).json({ error: 'Failed to save file' });
    //             return;
    //         }
    //     })
    //     console.log(`resources/${Chapter_id}/${i}.png`)
    // }

    fs.mkdir('resources/' + Chapter_id, async (err) => {
        if (err) {
            //   console.error('Error creating folder:', err);
            console.log('Deleting execisting folder\'s content ....')
            return;
        }
        console.log('Folder created successfully');
    });
    fs.writeFile(`${filePath}`, file, function (err) {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ error: 'Failed to save file' });
            return;
        }
        console.log('File saved!');
    })
    const result = await pfd2img(filePath, 'resources/'+Chapter_id, Chapter_id)
    if (result) console.log('images saved')
    res.json({ path: filePath });
}





app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Assuming your Pug files are in a 'views' directory

// Define the route to serve the PDF file for viewing
app.get("/view/:folderName", (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, "resources", folderName);

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(404).json({ error: "Folder not found" });
        }

        // Construct an array of image URLs
        const imageUrls = files.map(fileName => `/resources/${folderName}/${fileName}`);

        // Render the Pug template with the image URLs
        res.json({ imageUrls });
    });
});


// Define the route to serve the PDF file for viewing
app.get("/image/:folderName/:imageName", (req, res) => {
    const folderName = req.params.folderName;
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "resources", folderName, imageName);

    fs.readFile(imagePath, (err, data) => {
        if (err) {
            return res.status(404).json({ error: "Image not found" });
        }

        // Set content type based on image file extension
        const contentType = getImageContentType(imagePath);

        res.set('Content-Type', contentType);
        res.send(data);
    });
});

// Helper function to determine content type based on file extension
function getImageContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        // Add more cases as needed for other image formats
        default:
            return 'application/octet-stream'; // Default to binary data
    }
}



// Handle GET requests to download a file
app.get("/resources/:fileName", (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "resources", fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: "File not found" });
        }

        res.sendFile(filePath);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});





const pdfToPng = require('pdf-to-png-converter').pdfToPng;

convertPdfToImg = async (buffer) => {

    const pngPage = await pdfToPng(buffer, {
        disableFontFace: true,
        useSystemFonts: true,
        enableXfa: true, // Render Xfa forms if any. Default value is false.

        // pagesToProcess: [1],
        viewportScale: 2.0
    });
    return pngPage;
}

async function deleteFolderRecursive(resourcesFolderPath, callback) {
    fs.readdir(resourcesFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading resources folder:', err);
            return res.status(500).json({ error: 'Failed to read resources folder' });
        }

        // Filter only files with .png, .jpg, and .jpeg extensions
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

    console.log('existing folder deleted successfully')
}
