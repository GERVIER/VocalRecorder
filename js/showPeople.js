var peopleIdList;
var counter = 0;
var messageBox;
var messageText;
$(document).ready(function(){
    messageBox = $("#boxMessage");
    messageText = $("#textMessage");

    messageBox.css("display", "none");
    peopleIdList = sessionStorage.getItem("idList");
    peopleIdList = JSON.parse(peopleIdList);

    if(peopleIdList == null)
        peopleIdList = new Array(0);
    peopleIdList.sort(function(a, b){return a-b});

    updatePeopleList();

    $("#finalPeopleList").bind({
        "dragover": function(e){
            e.preventDefault();
        },

        "drop": function(e){
            e.preventDefault();
            counter--;
            $("#finalPeopleList").removeClass("whenDragOver");
            var id = e.dataTransfer.getData('text/plain');
            console.log("ID DRAGGED : " + id + " of type : " + typeof(id));

            id = parseInt(id);
            
            if(!isNaN(id)){
                addPeopleToFinalList(id);
                showPeopleInfo(id);
            }
        },

        'dragenter': function(e) {
            counter++;
            $("#finalPeopleList").addClass("whenDragOver");
        }, 

        'dragleave': function(e) {
            counter--;
            if (counter === 0) { 
                $("#finalPeopleList").removeClass("whenDragOver");
            }
        }, 
    });


    
    
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
        dataType : 'json',
        success : function (dataReceived, statut){
            htmlToAdd = '   <!-- People main information  -->'+
                            '<div class="row mb-2">'+
                                '<div class="col-3 d-flex flex-column justify-content-center">'+
                                    '<img id="peopleImage" src="'+dataReceived['picture']+'" alt="'+dataReceived['name']+'" class="rounded-circle mw-100 mh-100 p-0 align-self-center"/>    '+              
                                '</div>'+
                                '<div class="col d-flex flex-column justify-content-center">'+
                                    '<h3 id="peopleName" class="text-center">'+dataReceived['name']+'</h3>'+
                                    '<p class="text-center mb-0">Speek '+dataReceived['language']+'</p>'+
                                    '<p class="text-center">'+dataReceived['age']+' years old</p>'+
                                '</div>'+
                                '<div class="col-3 d-flex flex-column justify-content-center">'+
                                '</div>'+
                            '</div>'+

                            '<!-- Addition information  -->'+
                            '<div class="row mx-1">'+
                                '<p class="mb-0">'+
                                    '<b>Role : </b> '+dataReceived['role']+'  <br />'+
                                    '<b>Other Information : </b> <br />'+
                                        '<span class="mx-4"> <b> Micro type :</b> '+dataReceived['microType']+'     <br /> </span>'+
                                        '<span class="mx-4"> <b> Studio :</b>     '+dataReceived['studio']+'         <br /> </span>'+
                                        '<span class="mx-4"> <b> Outdoor :</b>    '+dataReceived['outDoor']+'         <br /> </span>'+
                                '</p>'+
                            '</div>'
                
            $("#peopleInfo").html(htmlToAdd);
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
    e.dataTransfer.setData('text/plain', id + "");
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
            console.log("");
            if(peopleIdList.indexOf(id) == -1){
                peopleIdList.push(id);
            }
            peopleIdList.sort(function(a, b){return a-b});
            console.log("New List : ");
            updatePeopleList();
            sessionStorage.setItem("idList", JSON.stringify(peopleIdList));
            
            if(peopleIdList.length >= 2)
                if(messageBox.hasClass("boxInfoMessage"))
                    messageBox.fadeOut();
        }else{
            messageText.html(" <i class=\"fas fa-exclamation-triangle\"></i> Maximun size of people list reached ;(");
            messageBox.removeClass("boxInfoMessage");
            messageBox.addClass("boxErrorMessage");
            messageBox.fadeIn(200);
        }

    }
}


/**
 * Remove of people of the list
 * @param {*} id 
 */
function removePeople(ele, id){
    var divEle = ele.parentElement;
    $(divEle).tooltip('hide');
    var animationEvent = whichAnimationEvent();
    $(divEle).addClass("removingAnimation");
    console.log("Click on : " + divEle);

    var pos = -1;
    for(i=0; i<peopleIdList.length; i++){
        if(peopleIdList[i] == id){
            pos = i;
            break;
        }
    }
    peopleIdList.sort(function(a, b){return a-b});

    if(pos != -1){
        peopleIdList.splice(i, 1);
        console.log("New List : ");
        $(divEle).one(animationEvent,
            function(event) {
                updatePeopleList();
            });
        sessionStorage.setItem("idList", JSON.stringify(peopleIdList));
    }else{
        console.log("Not found");
    }
   
}

/**
 * Update the view of people to use with the vocal recognition
 */
function updatePeopleList(){
    console.log(peopleIdList)

    if(peopleIdList.length == 0){
        $("#finalPeopleList").html("<p id=\"textNoPeople\"> <i class=\"fas fa-archive\"></i> Add someone to the list, or drag it here !</p>");
    }else{
        $.ajax({
            url : 'accessFunction.php', 
            type : 'POST', 
            data : {fonction : 'getPeopleFinalList', id : peopleIdList}, 
            dataType : 'json',
            success : function (dataReceived, statut){
                $(".peopleFinalListImage").tooltip("hide");
                html = "";
                dataReceived.forEach(element => {
                    id = element['id'];
                    name = element['name'];
                    picture = element['picture'];
                    if(picture == "undefined"){
                        picture = "res/img/people/empty.jpg";
                    }

                    html += '   <div onMouseOver="showDeleteButton(this)" onMouseLeave="hideDeleteButton(this)"class=" mx-1 my-1 peopleFinalListImage" data-toggle="tooltip" data-html="true" title="'+name+'">'+
                                    '<div class="peopleFinalListDeleteBtn hidden" onclick="removePeople(this, '+id+')">'+
                                        '<p style="text-align: center; margin-top: 2px; padding-bottom: 0px;"> <i class="fas fa-trash" aria-hidden="true"></i> Remove </p>'+
                                    '</div>'+
                                    '<img src="'+picture+'" alt="'+name+'" class=" mw-100 mh-100 align-self-center"/>'+
                                '</div>'
                });

                $("#finalPeopleList").html(html);
                $('[data-toggle="tooltip"]').tooltip()
            },
            error : function (resultat, statut, erreur){
                console.log(resultat);
            },
        });
    }
}

/**
 * Switch to the recognition part of the app or show a message if not enought people
 * have been added to the list
 */
function goToRecognition(){
    if(peopleIdList.length < 2){
        messageText.html(" <i class=\"fas fa-info-circle\"></i> You need to add at least two people to the list");
        messageBox.removeClass("boxErrorMessage");
        messageBox.addClass("boxInfoMessage");
        messageBox.fadeIn(200);
    }
    else{
        sessionStorage.setItem("idList", JSON.stringify(peopleIdList));
        console.log("Data sended to the page");
        window.location.href = "file.html";
    }
}

/**
 * Used to get the animation event used by the browser.
 */
function whichAnimationEvent(){
    var t,
        el = document.createElement("fakeelement");
  
    var animations = {
      "animation"      : "animationend",
      "OAnimation"     : "oAnimationEnd",
      "MozAnimation"   : "animationend",
      "WebkitAnimation": "webkitAnimationEnd"
    }
  
    for (t in animations){
      if (el.style[t] !== undefined){
        return animations[t];
      }
    }
}

/**
 * Purge the list of people
 */
function eraseList(){
    $(".peopleFinalListImage").addClass("removingAnimation");
    animFollower = $(".peopleFinalListImage")[0];
    var animationEvent = whichAnimationEvent();
    $(animFollower).one(animationEvent, function(event){
        updatePeopleList();
    })
    peopleIdList = new Array(0);
    sessionStorage.setItem("idList", JSON.stringify(peopleIdList));
    if(messageBox.hasClass("boxErrorMessage"))
    messageBox.fadeOut();
}

function showDeleteButton(obj){
    deleteDiv = $(obj).find(".peopleFinalListDeleteBtn");
    deleteDiv.removeClass("hidden");
    deleteDiv.addClass("showDeleteDivAnimation");
}

function hideDeleteButton(obj){
    deleteDiv = $(obj).find(".peopleFinalListDeleteBtn");
    deleteDiv.addClass("hidden");
    deleteDiv.removeClass("showDeleteDivAnimation");
}