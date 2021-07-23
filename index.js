const express = require('express')
const socket = require('socket.io')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const app = express()

const port = 4000
var server = app.listen(process.env.PORT || port, function () {
  console.log('Server started at port', port)
})
app.get('/', (req, res) => {
  res.render('index')
})

app.use(express.static('public'))
app.set('view engine', 'ejs')

var io = socket(server)

io.on('connection', function (socket) {
  console.log('User connected:', socket.id)

  socket.on('join', function (roomName) {
    var rooms = io.sockets.adapter.rooms
    var user
    console.log(rooms)
    var room = rooms.get(roomName)

    if (room == undefined) {
      socket.join(roomName)
      socket.emit('created')
      console.log('Room Created by')
    } else if (room.size == 1) {
      socket.join(roomName)
      console.log('Room Joined')
      socket.emit('joined')
    } else {
      console.log('Room is full now')
      socket.emit('full ')
    }
  })
  socket.on('ready', function (roomName) {
    console.log('haha to you 2')
    // socket.to(roomName).emit("nice game", "let's play a game");
    // socket.broadcast.emit("broadcast", "hello friends!");
    socket.broadcast.to(roomName).emit('ready')
    console.log('READY')
  })

  socket.on('candidate', function (candidate, roomName) {
    console.log('------------------------------')
    console.log(candidate)
    console.log('candidate:', candidate)
    socket.broadcast.to(roomName).emit('candidate', candidate)
  })
  socket.on('offer', function (offer, roomName) {
    console.log('offer:', offer)
    socket.broadcast.to(roomName).emit('offer', offer)
  })
  socket.on('answer', function (answer, roomName) {
    console.log('answer:', answer)
    socket.broadcast.to(roomName).emit('answer', answer)
  })
})
