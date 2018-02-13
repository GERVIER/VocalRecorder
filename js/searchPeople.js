var filterList;
var currentPage = 1;
var first = 0;
var numberPerColumn = 6;
var order = "asc";
var language = "all";
var role = "none";
var searchTerm = "";

$(document).ready(function (){
    $.event.addProp('dataTransfer');
    getAllLanguage();
    getAllRole();
    requestPagination();

    filterList = $("#filterList");

    $("#inputPeopleResearch").bind("keypress", function(e){
        if(e.keyCode == 13)
            searchPeople();
    });

    $("header").addClass("showHeaderAnimation");
    $("header").css("visibility", "visible");

    $("#peoplePreview").addClass("showRightAnimation");
    $("#peoplePreview").css("visibility", "visible");

    requestData();
});



/**
 * Show and/or reset the pagination with the actual parameters
 */
function requestPagination(){
    $("#pageList").empty();
    $.ajax({
        url : 'accessFunction.php', 
        type : 'POST', 
        data : {fonction : 'getPeopleCount', language : language, term : searchTerm}, 
        dataType : 'text',
        success : function (result, statut){
            $("#pageList").html(addPagination(numberPerColumn, result));
            console.log(" Number of people find : " + result);
        },
        error : function (resultat, statut, erreur){
            console.log(resultat);
        },
    });
}

function processData(dataFull){
    var html = "";
    var firstLetter = "NONE";
    for(var j = 0 ; j <dataFull.length; j++){
        peopleData = dataFull[j];
        
        peopleID = peopleData['id'];
        peopleName = peopleData['name'];
        peopleAge = peopleData['age'];
        peoplePicture = peopleData['picture'];
        peopleRole = peopleData['role'];
        peopleLanguage = peopleData['language'];
        if(peoplePicture == "undefined"){
            peoplePicture = "res/img/people/empty.jpg";
        }

        if(firstLetter != "NONE"){
            if(firstLetter != peopleName.substring(0, 1)){
                firstLetter = peopleName.substring(0, 1);
                html += "<h2>"+ firstLetter + "</h2>";
            }
        }
        else{
            firstLetter = peopleName.substring(0, 1);
            html += "<h2>"+ firstLetter + "</h2>";
        }

        
        html +="<!-- A People card -->"+             
                '<div class="row mx-1 mb-3 px-2 py-2 rounded peopleCard" onMouseOver="showButtonAdd(this)" onMouseLeave="hideButtonAdd(this)" onClick="showPeopleInfo('+peopleID+')" draggable="true" onDragStart="dragPeople(event, '+peopleID+')">'+
                    '<div class="col-auto p-0">'+
                        '<div class="d-flex flex-row h-100 peopleImage">'+
                            '<img src="'+peoplePicture+'" alt="'+peopleName+'" class="rounded-circle mw-100 mh-100 p-0 align-self-center"/>'+
                        '</div>'+
                    '</div>'+
                    '<div class="col d-flex flex-column justify-content-center pl-3">'+
                        '<p class="mb-0"><b>'+peopleName+'</b>, '+peopleAge+' y/o </p>'+
                        '<p class="mb-0">Language : '+peopleLanguage+'</p>'+
                        '<p class="mb-0">Role : '+peopleRole+'</p>'+
                    '</div>'+

                    '<div class="col-auto d-flex flex-column justify-content-center pl-3">'+
                        '<button class="btn btn-light btn-custom-flat hidden" onClick="addPeopleToFinalList('+peopleID+')"> <i class="fas fa-plus" aria-hidden="true"></i> </button>'+
                    '</div>'+
                '</div>'
        
    }
    return html;
}
/**
 * Show and/or reset the data using the actual parameters
 */
function requestData(){
    var animationEvent = whichAnimationEvent();

    console.log("Left first : " + first);
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getPeopleAsList', first: first, numberPerColumn : numberPerColumn, order : order, language : language, role : role, term : searchTerm},
        dataType : 'json',
        success : function (dataReceived, statut){
            console.log("Current page : " + currentPage);
            console.log();
            console.log(dataReceived);
            console.log();
            var listOfCardLeft = $("#peopleListLeft").find(".peopleCard");
            if(listOfCardLeft.length==0){
                $("#peopleListLeft").html(processData(dataReceived));
                $(".peopleCard").addClass("showCardAnimation");
            }
            else{
                $(".peopleCard").addClass("hideCardAnimation");
                $(".peopleCard").one(animationEvent, function(event){
                    $("#peopleListLeft").html(processData(dataReceived));
                    $(".peopleCard").addClass("showCardAnimation");
                })
            }

            console.log("Right first : " + (first+numberPerColumn));
            $.ajax({
                url : 'accessFunction.php',
                type : 'POST',
                data: {fonction: 'getPeopleAsList', first: (first+numberPerColumn), numberPerColumn : numberPerColumn, order : order, language :language, role : role, term : searchTerm},
                dataType : 'json',
                success : function (dataReceived, statut){
                    var listOfCardRight = $("#peopleListRight").find(".peopleCard");
                    if(listOfCardRight.length==0){
                        $("#peopleListRight").html(processData(dataReceived));
                        $(".peopleCard").addClass("showCardAnimation");
                    }
                    else{
                        $(".peopleCard").addClass("hideCardAnimation");
                        $(".peopleCard").one(animationEvent, function(event){
                            $("#peopleListRight").html(processData(dataReceived));
                            $(".peopleCard").addClass("showCardAnimation");
                        })
                    }
                },
            });

        },
    });

}

/**
 * Add a pagination that change dymanicaly corresponding to the actual page
 * @param {*} nbElementPerPage 
 * @param {*} nbeElement 
 */
function addPagination(nbElementPerPage, nbeElement){
    var nbPage = Math.ceil(nbeElement/(nbElementPerPage*2));

    var toReturn = '<li class="'+((currentPage==1)?"page-item disabled":"page-item")+'"><a class="page-link page-link-custom" href="#" onClick="changePage('+ (currentPage-1)+')"><i class="fa fa-chevron-left" aria-hidden="true"></i></a></li>';

    console.log("nb Page : " + nbPage);

    for(i = 0; i < nbPage; i++){
        toReturn += '<li class="'+(((i+1)==currentPage)?"page-item active active-custom":"page-item")+'"><a class="page-link page-link-custom" href="#" onClick="changePage('+ (i+1)+')">'+ (i+1) +'</a></li>';
    }

    toReturn += '<li class="'+((currentPage==nbPage)?"page-item disabled":"page-item")+'"><a class="page-link page-link-custom" href="#" onClick="changePage('+ (currentPage+1)+')"><i class="fa fa-chevron-right" aria-hidden="true"></i></a></li>';
    return toReturn
}

/**
 * This function allow the user to switch between the page
 * @param {*} page 
 */
function changePage(page){
    currentPage = page;
    first = (page-1) * (numberPerColumn*2);
    requestPagination();
    requestData();
}

/**
 * Altern between the asc alphabetical order and desc 
 */
function changeAlphaOrder(){
    if(order == 'asc'){
        order = 'desc';
        $("#logoAlphaOrder").prop("class", "fa fa-sort-alpha-up");
    }
    else{
        order = 'asc';
        $("#logoAlphaOrder").prop("class", "fa fa-sort-alpha-down");
    }
    
    requestData();
    
    console.log("Changed to : " + order);
}

/**
 * Change the language according to the parameters and update the view.
 * @param {*} newLanguage 
 */
function changeLanguage(newLanguage){
    $(".filterLanguage").remove();
    console.log("Changed language to :" + newLanguage);
    language = newLanguage;
    if(language != "all"){
        filterList.append("<span class=\"filterElement filterLanguage\" onClick=\"changeLanguage('all')\"> <i class=\"fas fa-minus-circle\"></i> Language : "+ language +" </span>")
    }
    requestData();
    requestPagination();
}

function changeRole(newRole){
    $(".filterRole").remove();
    console.log("Changed role to :" + newRole);
    role = newRole;
    if(role != "none"){
        filterList.append("<span class=\"filterElement filterRole\" onClick=\"changeRole('none')\"> <i class=\"fas fa-minus-circle\"></i> Role : "+ role +" </span>")
    }
    requestData();
    requestPagination();
}

/**
 * Request the serveur to get all the language in the people list.
 */
function getAllLanguage(){
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getAllLanguage'},
        dataType : 'json',
        success : function (dataReveived, statut){
            languageList = "";
            dataReveived.forEach(element => {
                languageList+= '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onClick="changeLanguage(\''+element['language']+'\')">'+element['language']+'</a>'
            });
            $("#listLanguage").html(languageList);
        },
    });
}

/**
 * Request the serveur to get all the role in the people list.
 */
function getAllRole(){
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getAllRole'},
        dataType : 'json',
        success : function (dataReveived, statut){
            roleList = ""
            dataReveived.forEach(element => {
                roleList+= '<a href="#" class="list-group-item list-group-item-action" data-dismiss="modal" onClick="changeRole(\''+element['role']+'\')">'+element['role']+'</a>';
            });
            $("#listRole").html(roleList);
        },
    });
}

//Search someone using the search bar
function searchPeople(){
    searchTerm = $("#inputPeopleResearch").val();
    console.log("Search Term : " + searchTerm);
    $(".filterTerm").remove();

    if(searchTerm != ""){
        filterList.append("<span class=\"filterElement filterTerm\" onClick=\"resetSearchFiedl()\"> <i class=\"fas fa-minus-circle\"></i> Search : "+ searchTerm +" </span>")
    }

    requestData();
    requestPagination();

}

function resetSearchFiedl(){
    $("#inputPeopleResearch").val("");
    searchPeople();
}

function showButtonAdd(obj){
    var btn = $(obj).find(".btn");
    btn.removeClass("hidden");
    btn.addClass("showButtonAddAnimation");
}

function hideButtonAdd(obj){
    var btn = $(obj).find(".btn");
    btn.addClass("hidden");
    btn.removeClass("showButtonAddAnimation");
}