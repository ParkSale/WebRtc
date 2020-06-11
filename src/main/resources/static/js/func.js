/*소켓관련 부분 시작*/
var conn = new WebSocket('ws://localhost:8080/socket');
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");;
var peerConnection;
conn.onopen = function() {
    console.log("Connected to the signaling server");
    initialize();
};

conn.onmessage = function(msg) {
    var content = JSON.parse(msg.data);
    var data = content.data;
    switch (content.event) {
        // when somebody wants to call us
        case "offer":
            handleOffer(data);
            break;
        case "answer":
            handleAnswer(data);
            break;
        // when a remote peer sends an ice candidate to us
        case "candidate":
            handleCandidate(data);
            break;
        default:
            break;
    }
};

function send(message) {
    conn.send(JSON.stringify(message));
}

function createOffer() {
    peerConnection.createOffer(function(offer) {
        send({
            event : "offer",
            data : offer
        });
        peerConnection.setLocalDescription(offer);
    }, function(error) {
        alert("Error creating an offer");
    });
}

function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // create and send an answer to an offer
    peerConnection.createAnswer(function(answer) {
        peerConnection.setLocalDescription(answer);
        send({
            event : "answer",
            data : answer
        });
    }, function(error) {
        alert("Error creating an answer");
    });

};

function handleCandidate(candidate) {
    peerConnection.addIceCandidate(candidate);
};

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("connection established successfully!!");
};

/*소켓관련 부분 끝*/

function initialize() {
    //여기엔 NAT관련 STUN이나 TURN?이 들어가야 함
    var configuration = null;

    peerConnection = new RTCPeerConnection(configuration);


    const constraints = {
        video : true,
        audio : true
    };

    navigator.mediaDevices.getUserMedia(constraints).
    then(function(stream){
        localVideo.srcObject = stream;
        peerConnection.addStream(stream);
        createOffer();
    })
        .catch(function(error){
            console.log(error);
        })

    peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
            send({
                event : "candidate",
                data : event.candidate
            });
        }
    };

    peerConnection.onaddstream = function(event) {
        remoteVideo.srcObject = event.stream;
    };
}

