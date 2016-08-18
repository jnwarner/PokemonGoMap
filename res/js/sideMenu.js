var open = false;

function toggleNav() {
    if (open) {
        document.getElementById("sidenav").style.width = "0";   
    } else {
        document.getElementById("sidenav").style.width = "300px";
    }
    open = !open;
}