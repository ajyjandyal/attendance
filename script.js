let stream = null;
let attendance = new Set();

// NAVIGATION
function showSection(id){
    ["dashboard","scanner","students","export"].forEach(sec=>{
        document.getElementById(sec).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

// CAMERA START
async function startCamera(){
    const video = document.getElementById("video");

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        document.getElementById("status").innerText = "Camera Running";

    } catch (err) {
        alert("Camera permission denied or not working");
        console.error(err);
    }
}

// CAMERA STOP
function stopCamera(){
    if(stream){
        stream.getTracks().forEach(track => track.stop());
    }
    document.getElementById("status").innerText = "Stopped";
}

// CAPTURE (SIMULATED ATTENDANCE)
function captureNow(){
    const name = "Student " + (attendance.size + 1);

    if(!attendance.has(name)){
        attendance.add(name);

        const log = document.createElement("div");
        log.innerText = `${name} marked at ${new Date().toLocaleTimeString()}`;
        document.getElementById("logs").prepend(log);

        document.getElementById("presentCount").innerText = attendance.size;
    }

    document.getElementById("status").innerText = "Captured";
}

// EXPORT CSV
function exportData(){
    let data = "Name,Time\n";
    attendance.forEach(name=>{
        data += name + "," + new Date().toLocaleTimeString() + "\n";
    });

    const blob = new Blob([data]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attendance.csv";
    a.click();
}
