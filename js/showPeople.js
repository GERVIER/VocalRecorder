
/**
 * Show the people information 
 * @param {*} id 
 */
function showPeopleInfo(id){
    console.log("Click on : " + id);
    $("#peopleInfo").empty();
    $.ajax({
        url : 'accessFunction.php', 
        type : 'POST', 
        data : {fonction : 'getAPeople', id : id}, 
        dataType : 'text',
        success : function (result, statut){
            $(result).appendTo("#peopleInfo");
        },
        error : function (resultat, statut, erreur){
            console.log(resultat);
        },
    });
}