control=true;
flashing=false;

function clignote()
{
  document.images[1].src="res/img/record/red.svg";
  window.setTimeout("clignote2();",500);
}

function clignote2()
{
  if (control!=false)
  {
  document.images[1].src="res/img/record/black.svg";
  window.setTimeout("clignote();",500);
  }
}

function stopit()
{
control=false;
flashing=false;
document.images[1].src="res/img/record/black.svg";
chronoStop();
document.getElementById("waves").style.display = "none";
}

function doit()
{
control=true;
flashing=true;
clignote();
chronoStart();
document.getElementById("waves").style.display = "block";

}

function isFlashing()
{ 
  if(flashing==false){
    doit();
  }else {
    stopit(); 
  }



}