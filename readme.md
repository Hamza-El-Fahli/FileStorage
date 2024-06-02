# My Educraft App Server

This server is designed to save PDF files for My Educraft App lessons. It converts PDF files to images for simplifying app interaction.

## File Structure

All files are saved in the `/resources` folder.

- Each PDF file is named after the chapter it belongs to. For example, a chapter with an ID of 15 will have a PDF named `15.pdf`.
- Images belonging to a specific chapter are stored under a folder named after the chapter ID.
- Each image is named after its page number. For example, for a chapter with an ID of 15 and 3 pages, the images would be named `1.jpg`, `2.jpg`, and `3.jpg` under the folder `/resources/15/`.

## Usage

- To save a PDF file for a lesson, place it in the `/resources` folder with the appropriate naming convention.
- Access the converted images for a chapter by navigating to the corresponding folder under `/resources`.

## Example

If you have a chapter with an ID of 15 and 3 pages, the file structure would look like this:

