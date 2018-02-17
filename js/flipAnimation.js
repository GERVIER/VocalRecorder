function isChrome() {
    var isChromium = window.chrome,
      winNav = window.navigator,
      vendorName = winNav.vendor,
      isOpera = winNav.userAgent.indexOf("OPR") > -1,
      isIEedge = winNav.userAgent.indexOf("Edge") > -1,
      isIOSChrome = winNav.userAgent.match("CriOS");
  
    if (isIOSChrome) {
      return true;
    } else if (
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    } else { 
      return false;
    }
}

var isChrome = isChrome();
var bool = 1;
$(document).ready(function(){

    if(isChrome)
        $('.back').addClass("hidden");
});

$("#card").flip({
    axis: 'y',
    trigger: 'click',
    forceWidth: false,
    forceHeight: false
    }).find('.front, .back').css({
        'width': '100%',
        'height': '100%'
        });

$("#card").on('flip:done',     
    function(){
        changeText();
    });

$("#switchViewButton").click(function(){
        $("#card").flip('toggle');
    });

function changeText(){
    if(bool=== 0)
    {
        switchViewButton.innerHTML = "Graph view <i class=\"fas fa-sync-alt\" aria-hidden=\"true\">";
        if(isChrome)
            $('.back').addClass("hidden");
        bool=1;
    }
    else
    {
        switchViewButton.innerHTML = "Carousel view <i class=\"fas fa-sync-alt\" aria-hidden=\"true\">";
        if(isChrome)
            $('.back').removeClass("hidden");
        bool = 0;
    }
}