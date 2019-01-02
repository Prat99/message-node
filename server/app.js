const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
var multer = require('multer')
var upload = multer();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
// serve static images 
app.use('/images', express.static(path.join(__dirname, 'images')));
// Multer Configs
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'images')
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
   }
});

const fileFilter = (req, file, cb) => {
   // The function should call `cb` with a boolean
   // to indicate if the file should be accepted
   // To reject this file pass `false`, like so:
   if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg', file.mimetype === 'image/jpeg') {
      cb(null, true)
   } else {
      cb(null, false)
   }
}

app.use(
   multer({ storage: storage, fileFilter: fileFilter }).single('image')
 );

app.use((req, res, next) => {
   // these headers help to communicate servers on diff domain.
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
   // this header helps to allow set header from client side and their type.
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   next();
});



app.use('/post', routes);
// console.log('process', process.env.user);
// console.log('process', process.env.userId);


/*** General error handling approach */
// this will be executes whenever an error is thrown or passed to next()
app.use((error, req, res, next) => {
   console.error(error);
   const status = error.statusCode || 500;
   const message = error.message;
   res.status(status).json(
      {
         message: message
      }
   );
});


app.listen(3002, (req, res) => {
   console.log('server is running on port 3002');
});


