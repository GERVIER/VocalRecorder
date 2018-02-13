var ip = "192.168.1.15";
var port = "8888";

function connectToServer(){
    console.log("Trying to connect to the server...");
    ws = new WebSocket("ws://"+ip+":"+port+"/client/ws/speech");
    isServerOnline = false;

    ws.onopen = function(){
        isServerOnline = true;
        isWorkerAvailable = false;
        clearInterval(serverConnextionRetry);
        console.log("Server Online");
        $("#circleStatut").css("color", "green");
        $("#textStatut").html("Online");
        ws.send("ID LIST : " + JSON.stringify(peopleIdList)+"\n");
    };

    ws.onmessage = function (event) {
        msg = JSON.parse(event.data);
        console.log(event.data);
        if(!isWorkerAvailable){
            if(msg.status == 9){
                serverConnextionRetry = setInterval(connectToServer, 5000);
            }
            else{
                isWorkerAvailable = true;
            }
        }

        console.log(msg.result);
        result = msg.result;
    };

    ws.onerror = function(event){
        if(serverConnextionRetry == null)
            serverConnextionRetry = setInterval(connectToServer, 5000);
        $("#circleStatut").css("color", "red");
        $("#textStatut").html("Offline");
    }

    ws.onclose = function(event){
        $("#circleStatut").css("color", "red");
        $("#textStatut").html("Offline");
        serverConnextionRetry = setInterval(connectToServer, 5000);
    }
}

function updateStatut(){
    var maxi = Math.max(...result);
    var pos = result.indexOf(maxi);
    //console.log("Carousel Updated");
    //console.log("Max : " + maxi + " at pos : " + pos);
    if(maxi != 0)
        $("#carousel").data("carousel").goTo(pos);
}
