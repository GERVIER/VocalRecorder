$(document).ready(function (){
    $.event.addProp('dataTransfer');
    getAllLanguage()
    requestData();
    requestPagination();

    $("#finalPeopleList").bind("dragover", function(e){
        e.preventDefault();
    });
    $("#finalPeopleList").bind("drop", function(e){
        var id = e.dataTransfer.getData('text/plain');
        console.log(id);      
        addPeopleToFinalList(id);
        showPeopleInfo(id);
    });

});

var currentPage = 1;
var first = 0;
var numberPerColumn = 6;
var order = "asc";
var language = "all";
/**
 * 
 */
function requestPagination(){
    $("#pageList").empty();
    $.ajax({
        url : 'accessFunction.php', 
        type : 'POST', 
        data : {fonction : 'getPeopleCount', language : language}, 
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
 * 
 */
function requestData(){
    console.log("Left first : " + first);

    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getPeopleAsList', first: first, numberPerColumn : numberPerColumn, order : order, language : language},
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
        data: {fonction: 'getPeopleAsList', first: (first+numberPerColumn), numberPerColumn : numberPerColumn, order : order, language :language},
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
        $("#logoAlphaOrder").prop("class", "fa fa-sort-alpha-asc");
    }
    else{
        order = 'asc';
        $("#logoAlphaOrder").prop("class", "fa fa-sort-alpha-desc");
    }
    
    requestData();
    
    console.log("Changed to : " + order);
}

function changeLanguage(newLanguage){
    console.log("Changed language to :" + newLanguage);
    language = newLanguage;
    requestData();
    requestPagination();
}
/**
 * 
 */
function getAllLanguage(){
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getAllLanguage'},
        dataType : 'html',
        success : function (codeHTML, statut){
            console.log("Current page : " + currentPage);
            $("#listLanguage").html(codeHTML);
        },
    });
}
