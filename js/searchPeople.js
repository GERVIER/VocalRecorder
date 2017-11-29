$(document).ready(function (){
    requestData();
});

function requestData(){
    var first = 0;
    var numberPerColumn = 6;
    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getPeopleAsList', first: first, numberPerColumn : numberPerColumn},
        dataType : 'html',
        success : function (codeHTML, statut){
            $(codeHTML).appendTo("#peopleListLeft");
        },

        error : function (resultat, statut, erreur){

        },

        complete : function(resultat, statut){
            
        }
    });

    $.ajax({
        url : 'accessFunction.php',
        type : 'POST',
        data: {fonction: 'getPeopleAsList', first: (first+numberPerColumn), numberPerColumn : numberPerColumn},
        dataType : 'html',
        success : function (codeHTML, statut){
            $(codeHTML).appendTo("#peopleListRight");
        },

        error : function (resultat, statut, erreur){

        },

        complete : function(resultat, statut){
            
        }
    });

}