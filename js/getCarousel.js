$(document).ready(function (){
    $("#fileZone").addClass("showLeftMenuAnimation");


    peopleIdList = sessionStorage.getItem("idList");
    peopleIdList = JSON.parse(peopleIdList);

    if(peopleIdList != null ){
        $.ajax({
            url : 'accessFunction.php',
            type : 'POST',
            data: {fonction: 'getPeopleFinalList', id : peopleIdList},
            dataType : 'json',
            success : function (dataReceived, statut){

                var showcase = $("#carousel"), title = $('#item-title')

                showcase.css( 'visibility', 'hidden' )

                html = "";
                dataReceived.forEach(element => {
                    id = element['id'];
                    name = element['name'];
                    picture = element['picture'];
                    if(picture == "undefined"){
                        picture = "res/img/people/empty.jpg";
                    }

                    html += '   <div class="cloud9-item">'+
                                    '<div class="'+id+' peopleScore rounded-circle">0 %</div> '+
                                    '<img class="peopleCarouselImg rounded-circle" src="'+picture+'" alt="'+name+'" />'+                               
                                '</div>';
                });

                showcase.html(html);

                showcase.Cloud9Carousel( {
                    yOrigin: 42,
                    yRadius: 48,
                    buttonLeft: $("#nav > .left"),
                    buttonRight: $("#nav > .right"),
                    autoPlay: 1,
                    bringToFront: true,
                    onRendered: rendered,
                    onLoaded: function() {
                        showcase.css( 'visibility', 'visible' )
                        showcase.css( 'display', 'none' )
                        showcase.fadeIn( 1500 )
                    }
                } )
            
                function rendered(carousel) {
                    title.text(carousel.nearestItem().element.childNodes[1].alt)
                    // Fade in based on proximity of the item
                    var c = Math.cos((carousel.floatIndex() % 1) * 2 * Math.PI)
                    title.css('opacity', 0.5 + (0.5 * c))
                }
            
                //
                // Simulate physical button click effect
                //
                $('#nav > button').click( function( e ) {
                    var b = $(e.target).addClass( 'down' )
                    setTimeout( function() { b.removeClass( 'down' ) }, 80 )
                } )
            
                $(document).keydown( function( e ) {
                    //
                    // More codes: http://www.javascripter.net/faq/keycodes.htm
                    //
                    switch( e.keyCode ) {
                    /* left arrow */
                    case 37:
                        $('#nav > .left').click()
                        break
            
                    /* right arrow */
                    case 39:
                        $('#nav > .right').click()
                        
                    }
                } )
                
            },
        });
    }
});