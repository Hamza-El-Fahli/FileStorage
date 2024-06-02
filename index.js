// This server defines routes and handlers for managing PDF files and their converted images in the My Educraft App server.
// It includes routes for uploading PDF files, retrieving links to images for a chapter, viewing individual images, and downloading PDF files.


const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 7676;
const Next_server = '192.168.1.12'
const {deleteFolderRecursive,saveFile} = require("./lib")
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
                    // console.log('Deleting execisting folder\'s content ....')
                    await deleteFolderRecursive(filePath.split('.pdf')[0]);

                    return;
                }
                // console.log('Folder created successfully');
            });
            // File exists, so delete it
            fs.unlink(filePath, async (unlinkErr) => {
                if (unlinkErr) {
                    // console.error('Error deleting file:', unlinkErr);
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



app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); 

// Get links to images for particular Chapter
app.get("/view/:folderName", (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, "resources", folderName);

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(404).json({ error: "Folder not found" });
        }

        // Response is json array , each item is link to an image
        const imageUrls = files.map(fileName => `http://${Next_server}:${PORT}/image/${folderName}/${fileName.split('.jpg')[0]}`);


        res.json({ imageUrls });
    });
});


// View one image by defining its chapter and its number
app.get("/image/:folderName/:imageName", (req, res) => {
    const folderName = req.params.folderName;
    const imageName = req.params.imageName+'.jpg';
    const imagePath = path.join(__dirname, "resources", folderName, imageName);
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            return res.status(404).json({ error: "Image not found" });
        }
        // Get Content type to specify it in the responce header 
        const contentType = getImageContentType(imagePath);
        res.set('Content-Type', contentType);
        res.send(data);
    });
});

 // Defines image tyoe to help browser visualising it 
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

            default:
            return 'application/octet-stream'; 
    }
}



// Get the PDF file
app.get("/resources/:fileName", (req, res) => {
    const fileName = req.params.fileName+".pdf";
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



