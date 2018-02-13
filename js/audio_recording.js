//Based on Gérald Barré script disponible here : https://gist.github.com/meziantou/edb7217fddfbb70e899e        

//Global Variable
var result;
var msg;
var ws;
var isServerOnline;
var serverConnextionRetry = null;
var actualisationOn = null
var peopleIdList = sessionStorage.getItem("idList");
peopleIdList = JSON.parse(peopleIdList);

$(document).ready(function(){
    console.log(peopleIdList);
    
    connectToServer();
    result = [0, 0, 0, 0, 0];
});

//Variable
var startRecordingButton = document.getElementById("startRecordingButton");
var stopRecordingButton = document.getElementById("stopRecordingButton");
var playButton = document.getElementById("playButton");
var downloadButton = document.getElementById("downloadButton");
var audioChannel = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var mediaStream = null;
var sampleRate = 16000;
var context = null;
var blob = null;
var sendData = true;

function startRecording() {
    actualisationOn = setInterval(updateStatut, 1000);
    // Initialize recorder
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(
    {
        audio: true
    },
    function (e) {
        console.log("user consent");
        // creates the audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        // creates an audio node from the microphone incoming stream
        mediaStream = context.createMediaStreamSource(e);
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
        // bufferSize: the onaudioprocess event is called when the buffer is full
        var bufferSize = 1024;
        var numberOfInputChannels = 1;
        var numberOfOutputChannels = 1;
        if (context.createScriptProcessor) {
            recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
        } else {
            recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
        }
        recorder.onaudioprocess = function (e) {
            audioChannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
            recordingLength += bufferSize;

            //Data sending to the server
            if(isServerOnline && sendData){
                var rowData = new Float32Array(e.inputBuffer.getChannelData(0));
                
                ws.send(rowData);
                sendData = true;
            }
        }
        // we connect the recorder
        mediaStream.connect(recorder);
        recorder.connect(context.destination);
    },
                function (e) {
                    console.error(e);
                });
}

function stopRecording() {
    clearInterval(actualisationOn);
    // stop recording
    recorder.disconnect(context.destination);
    mediaStream.disconnect(recorder);

    console.log("Création du Wav");
    blob = createWavDataMonoChanel(audioChannel, recordingLength);
    console.log("Fichier Créer");

    
}

playButton.addEventListener("click", function () {
    if (blob == null) {
        return;
    }
    var url = window.URL.createObjectURL(blob);
    var audio = new Audio(url);
    audio.play();
});

downloadButton.addEventListener("click", function () {
    if (blob == null) {
        return;
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "sample.wav";
    a.click();
    window.URL.revokeObjectURL(url);
    console.log("Download Clicked");
});

/**
 * Flatten an array of array into one array
 * @param {*} channelBuffer : the array of buffer
 * @param {*} recordingLength : the size of the array
 */
function flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

/**
 * Write alternately two audio channel into one.
 * @param {*} leftChannel : the left channel
 * @param {*} rightChannel : the right channel
 */
function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);
    var inputIndex = 0;
    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

/**
 * Write a string into a byte view
 * @param {*} view 
 * @param {*} offset 
 * @param {*} string 
 */
function writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Function that create a stereo channel wav file. 
 * @param {*} leftDataChannel  
 * @param {*} rightDataChannel 
 * @param {*} recordingBufferLength : the size of the data recorded
 */
function createWavData(leftDataChannel, rightDataChannel, recordingBufferLength){
    // we flat the left and right channels down
    // Float32Array[] => Float32Array
    var leftBuffer = flattenArray(leftDataChannel, recordingLength);
    var rightBuffer = flattenArray(rightDataChannel, recordingLength);
    // we interleave both channels together
    // [left[0],right[0],left[1],right[1],...]
    var interleaved = interleave(leftBuffer, rightBuffer);
    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);
    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);
    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final blob
    return new Blob([view], { type: 'audio/wav' });
}

/**
 * Function that create mono channel wav file. 
 * @param {*} audioChannel : the row audio data to transform into a file
 * @param {*} recordingBufferLength : the size of the data recorded
 */
function createWavDataMonoChanel(audioChannel, recordingBufferLength){
    var dataBuffer = flattenArray(audioChannel, recordingBufferLength);
    var buffer = new ArrayBuffer(44 + dataBuffer.length*2);
    var view = new DataView(buffer);
    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + dataBuffer.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 1, true); // wChannels: stereo (2 channels)
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, dataBuffer.length * 2, true);

    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i < dataBuffer.length; i++) {
        view.setInt16(index, dataBuffer[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final blob
    return new Blob([view], { type: 'audio/wav' });

}