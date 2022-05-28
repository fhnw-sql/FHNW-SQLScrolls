function toggleMute(){
    var isMuted = sessionStorage.getItem("mute") == "true"? true : false;

    //toogle mute button icon
    var element = document.getElementById("mute-button");
    if(isMuted){
        element.classList.remove("fa-volume-mute");
        element.classList.add("fa-volume-up");
    } else {
        element.classList.remove("fa-volume-up");
        element.classList.add("fa-volume-mute");
    }

    //update mute state
    sessionStorage.setItem("mute", !isMuted);
    const elems = document.getElementsByTagName("audio");
    for (const el of elems) {
       el.muted = !isMuted;
    }
}

function playSoundById(id) {
    var audio = document.getElementById(id);
    audio.play();
}
