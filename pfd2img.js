const pdf = require('pdf-poppler');
const path = require("path");

module.exports = async (inputPdfPath,out_dir,out_prefix) => {

pdf.info(inputPdfPath)
.then(pdfinfo => {
    // console.log(pdfinfo);
});

  let opts = {
    format: 'jpeg',
    out_dir: "./"+out_dir+"/",
    out_prefix: out_prefix+'',
    page: null
}

// pdf.convert(inputPdfPath, opts)
//     .then(res => {
//         console.log('Successfully converted');
//     })
//     .catch(error => {
//         console.error(error);
//     })
    try {
         await pdf.convert(inputPdfPath, opts)

        // console.log('PDF successfully converted to text:');
        return true; // Optionally return the extracted text for further processing
      } catch (error) {
        console.error('Error converting PDF:', error);
        throw error; // Re-throw the error for potential handling at a higher level
      }

    
};