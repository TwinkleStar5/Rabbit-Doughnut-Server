const multer = require("multer"); //handle file uploads

const storage = multer.diskStorage({
  //multer.diskStorage => how Multer should handle the storage of uploaded files on the server's disk.
  //Formats the filename before storing the uploaded file.
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
    //file.originalname => This property is part of the file object provided by Multer. It contains the original name of the uploaded file on the user's device.
  },
  //The destination function is a callback that takes three parameters: cb: A callback function to signal the completion of the operation.
  destination: (req, res, cb) => {
    //The cb function is invoked to notify Multer about the destination directory.
    //null: This indicates that there is no error during the operation. "./public": This is the path to the directory where the uploaded files will be stored.
    cb(null, "./public");
  },
});
//asynchronous operation => Callbacks are commonly used in scenarios where an operation takes time to complete, such as reading a file, making a network request, or handling events.
//cb function is a way of signaling the completion of an asynchronous operation and handling the result or any potential errors.
const upload = multer({ storage }); // telling Multer how and where to save files.
//{ storage } => same as { storage: storage }. "Use the storage variable as the value for the storage property in the object passed to multer."

const singleFileUpload = upload.single("image");
//upload.single("image") => used as middleware in the route.
// It specifies that the route expects a single file upload with the field name "image." The single method means it will process only one file. If you want to handle multiple files, you would use upload.array('images', 3) (where 'images' is the field name and 3 is the maximum number of files).
//After the middleware processes the file upload, the req object will have a file property containing information about the uploaded file.
module.exports = singleFileUpload;
