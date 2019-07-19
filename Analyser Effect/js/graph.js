let audioContext;

// nodes
let micNode;         // MediaStreamSource node for using microphone audio
let scriptNode;      // ScriptProcessor node for getting raw audio data 

// canvas and context
let canvas;
let context;

let analyser = new Analyser({
    fftSize: 1024
});

let isRunning = false; // if media stream is running

window.onload = function () {

    // set canvas and context
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    context = canvas.getContext("2d");
};


// initialize audio context and nodes
function init() {

    // stop
    if (audioContext != undefined) {

        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;

        audioContext.close();
        audioContext = undefined;

        document.getElementById("button").style.backgroundColor = "rgb(224, 52, 52)";
        return;
    }

    audioContext = new AudioContext();

    // ask user for microphone permission
    if (navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {

            // create media stream node
            micNode = audioContext.createMediaStreamSource(stream);

            // create script processor node
            scriptNode = audioContext.createScriptProcessor(analyser.fftSize, 1, 1);
            scriptNode.onaudioprocess = process;
            scriptNode.connect(audioContext.destination);
            micNode.connect(scriptNode);

            document.getElementById("button").style.backgroundColor = "rgb(128, 255, 78)";

        }).catch(function (err) {
            throw 'Error capturing audio.';
        });
    }
};



let buffer = null;
let animationFrameId;
function process(e) {
    buffer = e.inputBuffer.getChannelData(0); // mono - 1 channel 

    if (animationFrameId == undefined) {
        animationFrameId = requestAnimationFrame(update);  // request graph update
    }
}


// update graphs
function update() {

    // get the byte data
    let frequencyData = analyser.getByteFrequencyData(buffer);
    let fftSize = analyser.fftSize;
    let radius = canvas.height * 0.4;  // 40% of canvas height

    // rotate and draw 
    context.fillStyle = "white";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    for (let i = 0; i < frequencyData.length; i++) {
        let value = frequencyData[i] * 0.5;
        context.fillRect(0, -radius, 1, -value);
        context.rotate(2 * Math.PI / 180);
    }
    context.restore();

    animationFrameId = requestAnimationFrame(update); // request graph update
}