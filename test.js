var constraints = {
    audio: false,
    video: { width: 640, height: 480 }
};
navigator.mediaDevices.getUserMedia(constraints)
    .then(success)
    .catch(error);

function success(stream) {
    var video = document.getElementById('video');
    video.srcObject = stream;
    video.style.transform = 'scale(-1, 1)';
}

function error(error) {
    console.log(error);
}

var video = document.getElementById('video');

var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = 640;
canvas.height = 480;
var captureWidth = 640;
var captureHeight = 480;
var captureContext = canvas.getContext('2d', { willReadFrequently: true });

// prep diff canvas
var diffCanvas = document.createElement('canvas');
document.body.appendChild(canvas);
diffCanvas.width = 64;
diffCanvas.height = 48;
var diffWidth = 64;
var diffHeight = 48;
var diffContext = diffCanvas.getContext('2d');

var pixelDiffThreshold = 130;
var isReadyToDiff = false;

canvas.style.transform = 'scale(-1, 1)'

setInterval(capture, 300);


function capture() {
    captureContext.drawImage(video, 0, 0, 640, 480);
    var captureImageData = captureContext.getImageData(0, 0, captureWidth, captureHeight);


    if (isReadyToDiff) {
        diffContext.globalCompositeOperation = 'difference';
        diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
        var diffImageData = diffContext.getImageData(0, 0, diffWidth, diffHeight);

        // console.log('drawn');

        var rgba = diffImageData.data;

        var score = 0;

        for (var i = 0; i < rgba.length; i += 4) {
            var pixelDiff = rgba[i] * 0.3 + rgba[i + 1] * 0.6 + rgba[i + 2] * 0.1;
            var normalized = Math.min(255, pixelDiff * (255 / pixelDiffThreshold));
            rgba[i] = 0;
            rgba[i + 1] = normalized;
            rgba[i + 2] = 0;

            if (pixelDiff >= pixelDiffThreshold) {
                score++;
            } 
        }
    }

    if (score > 20) {
        console.log('movement detected');
    }

    // draw current capture normally over diff, ready for next time
    diffContext.globalCompositeOperation = 'source-over';
    diffContext.drawImage(video, 0, 0, diffWidth, diffHeight);
    isReadyToDiff = true;
}
