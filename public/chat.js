var socket = io('/')
var divVideoChatLobby = document.getElementById('video-chat-lobby')
var divVideoChat = document.getElementById('video-chat-room')
var joinButton = document.getElementById('join')
var userVideo = document.getElementById('user-video')
var peerVideo = document.getElementById('peer-video')
var roomInput = document.getElementById('roomName')
var roomname = roomInput.value
var rtcPeerConnection
var userStream

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.ekiga.net' },
    {
      urls: 'turn:18.119.113.154:3478',
      username: 'zihad',
      credential: '1234',
    },
    // {urls: "stun:stun.ideasip.com"},
    // {urls: "stun:stun.iptel.org"},
    // {urls: "stun:stun.rixtelecom.se"},
    // {urls: "stun:stun.schlund.de"},
    // {urls: "stun:stunserver.org"},
    // {urls: "stun:stun.softjoys.com"},
    // {urls: "stun:stun.voiparound.com"},
    // {urls: "stun:stun.voipbuster.com"},
    // {urls: "stun:stun.voipstunt.com"}
  ],
}

userVideo.muted = 'muted'
// var roomDiv = document.getElementById("room-div")
// roomDiv.style="display:none"
var creator = false

joinButton.addEventListener('click', function () {
  console.log('Room Name:', roomInput.value)
  if (roomInput.value == '') {
    alert('Please enter a room name')
  } else {
    socket.emit('join', roomInput.value)
  }
})

socket.on('created', function () {
  creator = true
  navigator.getUserMedia(
    {
      audio: true,
      video: true,
      // { width: 1280, height: 720 }
    },
    function (stream) {
      divVideoChatLobby.style = 'display:none'
      // roomInput.value
      // roomDiv.style="visibility: visible"
      // console.log('room name',roomInput)
      console.log('got user media stream')
      userStream = stream
      userVideo.srcObject = stream
      userVideo.onloadedmetadata = function (e) {
        userVideo.play()
      }
    },
    function () {
      alert("Couldn't acces User Media")
    }
  )
})

socket.on('joined', function () {
  creator = false
  navigator.getUserMedia(
    {
      audio: true,
      video: true,
      // { width: 1280, height: 720 }
    },
    function (stream) {
      divVideoChatLobby.style = 'display:none'
      // roomInput.value
      // roomDiv.style="visibility: visible"
      // console.log('room name',roomInput)
      userStream = stream
      userVideo.srcObject = stream
      userVideo.onloadedmetadata = function (e) {
        userVideo.play()
      }
      socket.emit('ready', roomInput.value)
      console.log('haha to you')
    },
    function () {
      alert("Couldn't acces User Media")
    }
  )
})

socket.on('full', function () {
  alert('The room is full. You cannot join now')
})

socket.on('ready', function () {
  console.log('-------------------READY-----------------')
  console.log('haha to you 3')
  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction
    rtcPeerConnection.ontrack = OnTrackFunction
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream)
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream)
    rtcPeerConnection.createOffer(
      function (offer) {
        rtcPeerConnection.setLocalDescription(offer)
        socket.emit('offer', offer, roomInput.value)
      },
      function (error) {
        console.log(error)
      }
    )
  }
})

socket.on('candidate', function (candidate) {
  var icecandidate = new RTCIceCandidate({
    candidate: candidate.candidate,
    sdpMID: candidate.sdpMID,
    sdpMLineIndex: candidate.sdpMLineIndex,
  })
  console.log('INSIDE CANDIDATEEEEEEEEEEEEEEE')
  rtcPeerConnection.addIceCandidate(icecandidate)
})

// socket.on("candidate",function(candidate){

//     rtcPeerConnection.addIceCandidate(candidate)

// })

socket.on('offer', function (offer) {
  console.log('-------------------OFFER-----------------')

  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction
    rtcPeerConnection.ontrack = OnTrackFunction
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream)
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream)
    rtcPeerConnection.setRemoteDescription(offer)
    rtcPeerConnection.createAnswer(
      function (answer) {
        rtcPeerConnection.setLocalDescription(answer)
        socket.emit('answer', answer, roomInput.value)
      },
      function (error) {
        console.log(error)
      }
    )
  }
})

socket.on('answer', async function (answer) {
  rtcPeerConnection.setRemoteDescription(answer)
})

function OnIceCandidateFunction(event) {
  console.log('EVENT CANDIDATE', event.candidate)
  if (event.candidate) {
    // console.log('EVENT CANDIDATE',event.candidate)
    socket.emit('candidate', event.candidate, roomInput.value)
  }
}

function OnTrackFunction(event) {
  console.log('IN THE ONTRACKFUNC')
  peerVideo.srcObject = event.streams[0]
  console.log('EVENT STREAM 0', event.streams[0])
  peerVideo.onloadedmetadata = function (e) {
    peerVideo.play()
  }
}
