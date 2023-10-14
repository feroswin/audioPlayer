
let interval
let audioObj

$("#input-file").on("change", function () {

    $("audio").remove()
    $("#btn-autoplay").removeClass("active")
    clearInterval(interval)

    const urlMusic = URL.createObjectURL($(this)[0].files[0])

    audioObj = new Audio(urlMusic)

    document.body.append(audioObj)

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


    const source = audioCtx.createMediaElementSource(audioObj)

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    const canvas = document.getElementById("oscilloscope");
    const canvasCtx = canvas.getContext("2d");

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

// Connect the source to be analysed
    source.connect(analyser);
    source.connect(audioCtx.destination)

// console.log(audioObj.duration)

    audioObj.addEventListener("loadedmetadata", () => {
        console.log(audioObj.duration)
        $("#duration").text(getNormalTime(audioObj.duration))
    })

// audioObj.currentTime = 200

    function getCurrentTime() {
        const currentTime = audioObj.currentTime;
        console.log('Текущее время воспроизведения: ' + Math.round(currentTime) + ' секунд');
        $("#current-time").text(getNormalTime(currentTime))
        console.log(((audioObj.currentTime / audioObj.duration) * 100).toFixed(1))
        $("#line").val(((audioObj.currentTime / audioObj.duration) * 100))
    }


    function getNormalTime(rawSec) {
        const prepareSeconds = Math.round(rawSec)
        const minutes = Math.floor(prepareSeconds / 60).toString().padStart(2, 0)
        const seconds = (prepareSeconds % 60).toString().padStart(2,0)
        console.log(minutes, seconds)
        return `${minutes} : ${seconds}`

    }



    $("#btn-play").on("click", function () {
        if ($(this).attr("data-active") === "false") {
            audioObj.play()
            $(this).attr("data-active", "true")
            draw();
            interval = setInterval(getCurrentTime, 1000)
        }
        else {
            audioObj.pause()
            $(this).attr("data-active", "false")
            clearInterval(interval)
        }
    })

    $("#line").on("change", function () {
        console.log((audioObj.duration * $(this).val()) / 100)
        audioObj.currentTime = (audioObj.duration * $(this).val()) / 100
    })

    $("#btn-autoplay").on("click", function () {
        $(this).toggleClass("active")
        if ($("audio").attr("loop")) {
            $("audio")[0].removeAttribute("loop")
        }
        else {
            $("audio")[0].setAttribute("loop", "")
        }

    })


    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(197,197,197)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(132,149,215)";

        canvasCtx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
})




