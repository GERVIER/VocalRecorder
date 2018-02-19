var ip = "192.168.1.22";
var port = "8888";

function connectToServer(){
    result = [0, 0, 0, 0, 0];

    console.log("Trying to connect to the server...");
    ws = new WebSocket("ws://"+ip+":"+port+"/client/ws/speech");
    isServerOnline = false;

    ws.onopen = function(){
        isServerOnline = true;
        isWorkerAvailable = false;
        clearInterval(serverConnextionRetry);
        serverConnextionRetry = null;
        console.log("Server Online");
        $("#circleStatut").css("color", "green");
        $("#textStatut").html("Online");
        var peopleIdList2 = sessionStorage.getItem("idList");
        peopleIdList2 = JSON.parse(peopleIdList2);

        ws.send("ID LIST : " + peopleIdList2 + "\n");
    };

    ws.onmessage = function (event) {
        msg = JSON.parse(event.data);
        //console.log(event.data);
        if(!isWorkerAvailable){
            if(msg.status == 9){
                serverConnextionRetry = setInterval(connectToServer, 5000);
            }
            else{
                isWorkerAvailable = true;
            }
        }

        //console.log(msg.result);
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
        if(serverConnextionRetry == null)
            serverConnextionRetry = setInterval(connectToServer, 5000);
    }

}

