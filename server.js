const express = require('express')
 const app = express()
// const cors = require('cors')
//app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const bodyParser = require('body-parser');

const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);
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
const url=require('url')
const querystring = require('querystring');

app.post('/join',(req,res)=>{
  res.redirect(`/room/${req.body.roomId}`)
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
      socket.to(roomId).broadcast.disconnect('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3030)
