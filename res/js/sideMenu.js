var open = false;

function toggleNav() {
    if (open) {
        document.getElementById("sidenav").style.width = "0px";   
    } else {
        document.getElementById("sidenav").style.width = "300px";
    }
    open = !open;
}