const express = require('express')
 const app = express()
 const mongoose = require('mongoose');
 var multer  = require('multer')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const bodyParser = require('body-parser');
const config = require(`./config`).get(process.env.NODE_ENV);

const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')


mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE)

const { User } = require('./model/user')
const { File }= require('./model/file')

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/',(req,res)=>{
  res.render('dashboard')
})

app.get('/room', (req, res) => {
res.redirect(`/room/${uuidV4()}`)
})


app.get('/room/:rooms', (req, res) => {
res.render('room', { roomId: req.params.rooms})

})


app.post('/join',(req,res)=>{
  res.redirect(`/room/${req.body.roomId}`)
})

app.get('/register',(req,res)=>{
  res.render('register')
})
app.get('/login',(req,res)=>{
  res.render('login')
})

app.post('/api/register',(req,res)=>{
  const user = new User(req.body);

  user.save((err,doc)=>{
      if(err) return res.json({
          success:false
      });
      res.status(200).json({
          success:true,
          user:doc
      })

  })
})



io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})



server.listen(process.env.PORT||3030)
























// // SET STORAGE
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })
 
// var upload = multer({ storage: storage })

// app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//   const file = req.file
//   if (!file) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//   }
// })

// //Uploading multiple files
// app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
//   const files = req.files
//   if (!files) {
//     const error = new Error('Please choose files')
//     error.httpStatusCode = 400
//     return next(error)
//   }
 
//     res.send(files)
  
// })
