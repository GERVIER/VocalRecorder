$(document).ready(function (){
    requestData();
    requestPagination();
});

var currentPage = 1;
var first = 0;
var numberPerColumn = 6;
var functionToCall = 'getPeopleAsList';

/**
 * 
 */
function requestPagination(){
    $("#pageList").empty();
    $.ajax({
        url : 'accessFunction.php', 
        type : 'POST', 
        data : {fonction : 'getPeopleCount'}, 
        dataType : 'text',
        success : function (result, statut){
            console.log(" Number of people find : " + result);
            $(addPagination(numberPerColumn, result)).appendTo("#pageList");
        },
        error : function (resultat, statut, erreur){
            console.log(resultat);
        },
    });
}

/**
 * 
 */
function requestData(){
    $("#peopleListRight").empty();
    $("#peopleListLeft").empty();
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: functionToCall, first: first, numberPerColumn : numberPerColumn},
        dataType : 'html',
        success : function (codeHTML, statut){
            console.log("Current page : " + currentPage);
            $(codeHTML).appendTo("#peopleListLeft");
        },
    });

    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: functionToCall, first: (first+numberPerColumn), numberPerColumn : numberPerColumn},
        dataType : 'html',
        success : function (codeHTML, statut){
            $(codeHTML).appendTo("#peopleListRight");
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
    if(functionToCall == 'getPeopleAsList'){
        functionToCall = 'getPeopleAsListInversed';
        $("#logoAlphaOrder").prop("class", "fa fa-sort-alpha-asc");
    }
    else{
        functionToCall = 'getPeopleAsList';
        $("#logoAlphaOrder").prop("class", "fa fa-sort-alpha-desc");
    }
    
    requestData();
    
    console.log("Changed to : " + functionToCall);
}