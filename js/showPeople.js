var peopleIdList = new Array(0);
/**
 * Show the people information 
 * @param {*} id 
 */
function showPeopleInfo(id){
    console.log("Click on : " + id);
    //$("#peopleInfo").empty();
    $.ajax({
        url : 'accessFunction.php', 
        type : 'POST', 
        data : {fonction : 'getAPeople', id : id}, 
        dataType : 'text',
        success : function (result, statut){
            //$(result).appendTo("#peopleInfo");
            $("#peopleInfo").html(result);
            $("#addPeopleToListButton").attr('onclick', 'addPeopleToFinalList('+ id +')')
        },
        error : function (resultat, statut, erreur){
            console.log(resultat);
        },
    });
}

/**
 * Add a people to the destination list
 * @param {*} id 
 */
function addPeopleToFinalList(id){
    if(id == -1){
        console.log("");
    }else{
        image = $("#peopleImage").attr('src');
        console.log("Add people id " + id + " picture " + image);
        console.log();
        if(peopleIdList.indexOf(id) == -1){
            peopleIdList.push(id);
        }
        console.log("New List : ");
        updatePeopleList();
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