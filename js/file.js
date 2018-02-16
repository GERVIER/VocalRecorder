var objectUrl;
var switchViewButton = document.getElementById('switchViewButton');

var letStartButton = document.getElementById('start_button');
var bool =1;

var file = document.getElementById('filetype');

$("#audio").on("canplaythrough", function(e){
    var seconds = e.currentTarget.duration;
    var duration = moment.duration(seconds, "seconds");
    
    var time = "";
    var hours = duration.hours();
    if (hours > 0) { time = hours + ":" ; }
    
    time = time + duration.minutes() + ":" + duration.seconds();
    $("#duration").text(time);
    
    URL.revokeObjectURL(objectUrl);
});

$("#file").change(function(e){
    console.log("File Charged");
    var file = e.currentTarget.files[0];
   
    $("#filename").text(file.name);
    $("#filetype").text(file.type);
    $("#filesize").text(file.size);
    
    objectUrl = URL.createObjectURL(file);
    $("#audio").prop("src", objectUrl);
});

$('#start_button').on('click', function(e){

    if(!file.innerHTML==""){
        e.preventDefault();
        if ($(this).hasClass('btn-danger')) {
            $(this).text(' Let\'s start ').removeClass('btn-danger').addClass("btn-success");
        } else {
            $(this).text('stop').addClass('btn-danger').removeClass("btn-success");
        }
    }else {
       $('#alertNoFile').modal('show');
    }
    
});

$('.stop_button').on('click', function(e) {
    e.preventDefault();
    alert('stopping!');
});


function snackbarFunction() {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar")

    if(letStartButton.innerHTML == " Let's start " && file.innerHTML!=""){
        // Add the "show" class to DIV
        x.className = "show";
        // TODO Adapter le temps de la snackbar au temp de communication avec le serveur !!! remove the show class from DIV
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1000);
    }
}

$("#card").flip({
    axis: 'y',
    trigger: 'click',
forceWidth: false,
forceHeight: false
  }).find('.front, .back').css({
'width': '100%',
'height': '100%'
});

$("#switchViewButton").click(function(){
    $("#card").flip('toggle');
  });
  
function changeText() {
    if(bool=== 0)
    {
        switchViewButton.innerHTML = "Graph view <i class=\"fas fa-sync-alt\" aria-hidden=\"true\">";
        bool=1;
    }
    else
    {
        switchViewButton.innerHTML = "Carousel view <i class=\"fas fa-sync-alt\" aria-hidden=\"true\">";
        bool = 0;
    }
}