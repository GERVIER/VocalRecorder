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
    getAllLanguage()
    getAllRole();
    requestData();
    requestPagination();

    filterList = $("#filterList");

    $("#inputPeopleResearch").bind("keypress", function(e){
        if(e.keyCode == 13)
            searchPeople();
    });
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

/**
 * Show and/or reset the data using the actual parameters
 */
function requestData(){
    console.log("Left first : " + first);
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getPeopleAsList', first: first, numberPerColumn : numberPerColumn, order : order, language : language, role : role, term : searchTerm},
        dataType : 'html',
        success : function (codeHTML, statut){
            console.log("Current page : " + currentPage);
            $("#peopleListLeft").html(codeHTML);
        },
    });

    console.log("Right first : " + (first+numberPerColumn));
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getPeopleAsList', first: (first+numberPerColumn), numberPerColumn : numberPerColumn, order : order, language :language, role : role, term : searchTerm},
        dataType : 'html',
        success : function (codeHTML, statut){
            $("#peopleListRight").html(codeHTML);
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

    var toReturn = '<li class="'+((currentPage==1)?"page-item disabled":"page-item")+'"><a class="page-link" href="#" onClick="changePage('+ (currentPage-1)+')"><i class="fa fa-chevron-left" aria-hidden="true"></i></a></li>';

    console.log("nb Page : " + nbPage);

    for(i = 0; i < nbPage; i++){
        toReturn += '<li class="'+(((i+1)==currentPage)?"page-item active":"page-item")+'"><a class="page-link" href="#" onClick="changePage('+ (i+1)+')">'+ (i+1) +'</a></li>';
    }

    toReturn += '<li class="'+((currentPage==nbPage)?"page-item disabled":"page-item")+'"><a class="page-link" href="#" onClick="changePage('+ (currentPage+1)+')"><i class="fa fa-chevron-right" aria-hidden="true"></i></a></li>';
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
        dataType : 'html',
        success : function (codeHTML, statut){
            $("#listLanguage").html(codeHTML);
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
        dataType : 'html',
        success : function (codeHTML, statut){
            $("#listRole").html(codeHTML);
        },
    });
}

//Search someone using the search bar
function searchPeople(){
    searchTerm = $("#inputPeopleResearch").val();
    console.log("Search Term : " + searchTerm);

    requestData();
    requestPagination();

}
