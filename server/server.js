const express = require('express')
 const app = express()
 const mongoose = require('mongoose');
 const cookieParser = require('cookie-parser');
//  var multer  = require('multer')
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

const { User } = require('./model/user');

// const { File }= require('./model/file')
const { auth } = require('./middleware/auth');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(express.static('public'))


app.get('/',(req,res)=>{
  res.render('dashboard')
})

app.get('/room',auth,(req, res) => {
 
    res.redirect(`/room/${uuidV4()}`)
    
})


app.get('/room/:rooms', (req, res) => {
res.render('room', { roomId: req.params.rooms})

})


app.post('/join',auth,(req,res)=>{
  res.redirect(`/room/${req.body.roomId}`)
})

app.get('/register',(req,res)=>{
  res.render('register')
})

app.get('/login',(req,res)=>{
  res.render('login')
})

app.post('/register',(req,res)=>{
   const user = new User({
     email:req.body.email,
     password : req.body.password,
     confirmpassword:req.body.confirmpassword,
     firstname : req.body.firstname,
     lastname:req.body.lastname
   })
   
 user.save((err,doc)=>{
      if(err) return res.json({
          success:false
      });
      res.redirect(`/login`)

  })
})

app.post('/login',(req,res)=>{
 
  
  User.findOne({'email':req.body.email},(err,user)=>{
    
  if(!user) return res.json({isAuth:false,message:'Auth failed , email not found' })
  
  user.comparePassword(req.body.password,(err,isMatch)=>{
      if(!isMatch) return res.json({
          isAuth:false,
          message:'wrong password'
      });
  user.generateToken((err,user)=>{
      if(err) return res.status(400).send(err);
      res.cookie('auth',user.token).json({
        isAuth:true,
        id:user._id,
        email:user.email
    })
  })
})
})
})

app.get('/logout',auth,(req,res)=>{


 req.user.deleteToken(req.token,(err,user)=>{
     if(err) return res.status(400).send(err);
     res.redirect('/')
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
