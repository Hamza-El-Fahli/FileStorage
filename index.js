const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const PORT = 7676;


const upload = multer();

// Handle POST requests to upload a file

app.post("/upload", upload.single("PDFFile"), async (req, res) => {
    const file = req.file.buffer;
    const Chapter_id = req.body.Chapter_id;
    const filePath = `resources/${Chapter_id}.pdf`;
console.log('file uploaded')

    fs.access(filePath, fs.constants.F_OK,async (err) => {
        if (!err) {
            // File exists, so delete it
            fs.unlink(filePath,async (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                    res.status(500).json({ error: 'Failed to replace file' });
                    return;
                }

                await fs.mkdir('resources/'+Chapter_id,async (err) => {
                    if (err) {
                        //   console.error('Error creating folder:', err);
                        console.log('Deleting execisting folder\'s content ....')
                      await  deleteFolderRecursive(filePath.split('.pdf')[0]);
            
                      return;
                    }
                    console.log('Folder created successfully');
                  });
                // File deleted, proceed with saving new file
                saveFile(filePath, file, Chapter_id, res);
            });
        } else {
            // File does not exist, proceed with saving new file
            saveFile(filePath, file,Chapter_id, res);
        }
    });
});

async function saveFile(filePath, file,Chapter_id, res) {
    const data = await convertPdfToImg(file)
    
      
   for(let i=0 ; i<data.length ; i++){
     fs.writeFile(`resources/${Chapter_id}/${i}.png`, data[i].content, function (err) {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ error: 'Failed to save file' });
            return;
        }
    })
    console.log(`resources/${Chapter_id}/${i}.png`)
}
fs.writeFile(`${filePath}`, file, function (err) {
    if (err) {
        console.error('Error saving file:', err);
        res.status(500).json({ error: 'Failed to save file' });
        return;
    }
    console.log('File saved!');
})
    res.json({ path: filePath });
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





const pdfToPng = require('pdf-to-png-converter').pdfToPng;

convertPdfToImg = async (buffer) => {
    const pngPage = await pdfToPng(buffer, {
        disableFontFace: false,
        useSystemFonts: false,
        // pagesToProcess: [1],
        viewportScale: 2.0
    });
    return  pngPage;
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
