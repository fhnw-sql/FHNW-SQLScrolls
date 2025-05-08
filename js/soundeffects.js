function toggleMute() {
    var isMuted = sessionStorage.getItem("mute") == "true" ? true : false;

    //toogle mute button icon and text
    var symbol = document.getElementById("mute-symbol");
    var textMute = document.getElementById("mute-text");
    var textUnmute = document.getElementById("unmute-text");

    if (isMuted) {
        symbol.classList.remove("fa-volume-mute");
        symbol.classList.add("fa-volume-up");
        textUnmute.classList.remove("hidden");
        textMute.classList.add("hidden");
    } else {
        symbol.classList.remove("fa-volume-up");
        symbol.classList.add("fa-volume-mute");
        textMute.classList.remove("hidden");
        textUnmute.classList.add("hidden");
    }

    //update mute state
    sessionStorage.setItem("mute", !isMuted);
    const elems = document.getElementsByTagName("audio");
    for (const el of elems) {
        el.muted = !isMuted;
    }
}

function playSoundById(id) {
    // this is a hack to fix the delay in safari - see https://stackoverflow.com/a/54119854
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    var audio = document.getElementById(id);
    if (audio) {
        audio.play();
    }
}
