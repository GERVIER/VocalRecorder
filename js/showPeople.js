var peopleIdList;

$(document).ready(function(){
    peopleIdList = sessionStorage.getItem("idList");
    peopleIdList = JSON.parse(peopleIdList);

    if(peopleIdList != null){
        updatePeopleList();
    }else{
        peopleIdList = new Array(0);
    }
});



/**
 * Show the people information 
 * @param {*} id 
 */
function showPeopleInfo(id){
    console.log("Click on : " + id);
    $.ajax({
        url : 'accessFunction.php', 
        type : 'POST', 
        data : {fonction : 'getAPeople', id : id}, 
        dataType : 'text',
        success : function (result, statut){
            $("#peopleInfo").html(result);
            $("#addPeopleToListButton").attr('onclick', 'addPeopleToFinalList('+ id +')')
        },
        error : function (resultat, statut, erreur){
            console.log(resultat);
        },
    });
}

/**
 * Drag&Drop data transfert 
 * @param {int} e 
 * @param {*} id 
 */
function dragPeople(e, id){
    e.dataTransfer.setData('text/plain', id);
}

/**
 * Add a people to the destination list
 * @param {*} id 
 */
function addPeopleToFinalList(id){
    if(id == -1){
        console.log("");
    }else{
        if(peopleIdList.length < 5){
            if(typeof(id) == "string")
            id = parseInt(id);

            image = $("#peopleImage").attr('src');
            console.log("Add people id " + id + " picture " + image);
            console.log();
            if(peopleIdList.indexOf(id) == -1){
                peopleIdList.push(id);
            }
            console.log("New List : ");
            updatePeopleList();
        }else{
            alert("Maximun size of people list reached ;(")
        }

    }
}


/**
 * Remove of people of the list
 * @param {*} id 
 */
function removePeople(id){
    var pos = -1;
    for(i=0; i<peopleIdList.length; i++){
        if(peopleIdList[i] == id){
            pos = i;
            break;
        }
    }
    if(pos != -1){
        peopleIdList.splice(i, 1);
        console.log("New List : ");
        updatePeopleList();
    }
    console.log("Not found");
}

/**
 * Update the view of people to use with the vocal recognition
 */
function updatePeopleList(){
    for(i = 0; i<peopleIdList.length; i++){
        console.log("Id : " + peopleIdList[i]);
    }

    if(peopleIdList.length == 0){
        $("#finalPeopleList").html("<p>Add someone to the list, or drag it here !</p>");
    }else{
        $.ajax({
            url : 'accessFunction.php', 
            type : 'POST', 
            data : {fonction : 'getPeopleFinalList', id : peopleIdList}, 
            dataType : 'text',
            success : function (result, statut){
                $("#finalPeopleList").html(result);
                $('[data-toggle="tooltip"]').tooltip()
            },
            error : function (resultat, statut, erreur){
                console.log(resultat);
            },
        });
    }
}

function goToRecognition(){
    if(peopleIdList.length < 2){
        //TODO : Replace with a boostrap object
        alert("You need to add at least two people to the list");
    }
    else{
        sessionStorage.setItem("idList", JSON.stringify(peopleIdList));
        console.log("Data sended to the page");
        window.location.href = "file.html";
    }
}

