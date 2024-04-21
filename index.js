const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 7676;


const upload = multer();

// Handle POST requests to upload a file

app.post("/upload", upload.single("PDFFile"), async (req, res) => {
    const file = req.file.buffer;
    const Chapter_id = req.body.Chapter_id;
    const filePath = `resources/${Chapter_id}.pdf`;

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
            // File exists, so delete it
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                    res.status(500).json({ error: 'Failed to replace file' });
                    return;
                }
                // File deleted, proceed with saving new file
                saveFile(filePath, file, res);
            });
        } else {
            // File does not exist, proceed with saving new file
            saveFile(filePath, file, res);
        }
    });
});

function saveFile(filePath, file, res) {
    fs.writeFile(filePath, file, function (err) {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ error: 'Failed to save file' });
            return;
        }
        console.log('File saved!');
        res.json({ path: filePath });
    });
}





app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Assuming your Pug files are in a 'views' directory

// Define the route to serve the PDF file for viewing
app.get("/view/:fileName", (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, "resources", fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: "File not found" });
        }

        // Render the Pug template with the PDF file path
        
        res.render('pdfViewer', { pdfPath: `/resources/${fileName}` });
    });
});


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
