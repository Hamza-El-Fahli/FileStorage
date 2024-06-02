import sys
from pdf2image import convert_from_path
if len(sys.argv) != 3:
    print("Usage: python script.py <pdf_file_path>")
    sys.exit(1)

pdf_file_path = sys.argv[1]
chapter_id = sys.argv[2]
images = convert_from_path(pdf_file_path)
for i in range(len(images)):
    images[i].save('resources/'+str(chapter_id)+'/'+ str(i+1) +'.jpg', 'JPEG')
print("PDF converted to images successfully.")
