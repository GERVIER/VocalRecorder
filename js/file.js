//Global Variable
var objectUrl;
var switchViewButton = document.getElementById('switchViewButton');
var letStartButton = document.getElementById('start_button');
var bool =1;
var file = document.getElementById('filetype');
var snackbar = $("#snackbar");
var audioFile;
var canSendData = false;

//Variable needed for server comunication
var result = null;
var msg = null;
var ws = null;
var isServerOnline = null;
var serverConnextionRetry = null;
var actualisationOn = null
var peopleIdList = sessionStorage.getItem("idList");
var seconds;
var bitRate;
var fileSize;
peopleIdList = JSON.parse(peopleIdList);


$(document).ready(function(){
    console.log(peopleIdList);
    result = [0, 0, 0, 0, 0];
    clearInterval(serverConnextionRetry);
    setTimeout(connectToServer, 1000);

});

$("#audio").on("canplaythrough", function(e){
    seconds = e.currentTarget.duration;
    var duration = moment.duration(seconds, "seconds");
    
    var time = "";
    var hours = duration.hours();
    if (hours > 0) { time = hours + ":" ; }
    
    time = time + duration.minutes() + ":" + duration.seconds();
    $("#duration").text(time);
    canSendData = true;
    bitRate = fileSize/seconds;
    //URL.revokeObjectURL(objectUrl);
});

$("#file").change(function(e){
    canSendData = false;
    console.log("File Charged");
    audioFile = e.currentTarget.files[0];
    $("#filename").text(audioFile.name);
    $("#filetype").text(audioFile.type);
    $("#filesize").text(audioFile.size);
    fileSize = audioFile.size;
    
    objectUrl = URL.createObjectURL(audioFile);
    $("#audio").prop("src", objectUrl);
});

$('#start_button').on('click', function(e){
    if(!file.innerHTML==""){
        e.preventDefault();
        if ($(this).hasClass('btn-danger')) {
            $(this).text(' Let\'s start ').removeClass('btn-danger').addClass("btn-success");
        } else {
            $(this).text('stop').addClass('btn-danger').removeClass("btn-success");
        }
    }else {
       $('#alertNoFile').modal('show');
    }
});

$('.stop_button').on('click', function(e) {
    e.preventDefault();
    alert('stopping!');
});

//File Reader to send the file to the server
var reader = new FileReader();

reader.onload = function(fileReaded){
    console.log(fileReaded.target);
    if(isServerOnline)
        ws.send(new Float32Array(fileReaded.target.result));
};

reader.onloadstart=function(f){
    snackbar.addClass("show");
};

reader.onloadend=function(f){
    snackbar.removeClass("show");
};

var startingByte = 0;

function sendAudioData () {
    jouer = $("#audio").get(0).currentTime;
    console.log(bitRate);
    console.log(seconds);
    startingByte = jouer*bitRate;
    console.log("Start : " + startingByte + "..." + " End : " + startingByte+2048);

    var blob = audioFile.slice(startingByte, startingByte+2048)
    reader.readAsArrayBuffer(blob);
}

function snackbarFunction() {
    if(letStartButton.innerHTML == " Let's start " && file.innerHTML!=""){
        if(canSendData){
            actualisationOn = setInterval(updateStatut, 1000);
            $("#audio").get(0).play();
            sendAudioDataInterval = setInterval(sendAudioData, 100);
        }
    }else{
        clearInterval(actualisationOn);
        clearInterval(sendAudioDataInterval);
        $("#audio").get(0).load();
    }
}

