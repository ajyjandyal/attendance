let labeledDescriptors=[];
let attendance=new Set();
let stream=null;
let running=false;

function showSection(id){
    ["dashboard","scanner","students","export"].forEach(sec=>{
        document.getElementById(sec).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

async function loadModels(){
    document.getElementById("status").innerText="Loading models...";

    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/attendance/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/attendance/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/attendance/models'),
    ]);

    document.getElementById("status").innerText="Models Loaded";
    await loadFaces();
}

async function loadFaces(){
    const labels=["ajay","tejas"];

    for(let label of labels){
        const img=await faceapi.fetchImage(`faces/${label}.jpg`);
        const detection=await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        labeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(label,[detection.descriptor])
        );
    }
}

async function startCamera(){
    await loadModels();

    const video=document.getElementById("video");

    stream=await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject=stream;

    running=true;
    document.getElementById("status").innerText="Camera Running";

    video.onplay=()=>{
        const canvas=faceapi.createCanvasFromMedia(video);
        document.querySelector('.camera-box').append(canvas);

        const size={width:640,height:480};
        faceapi.matchDimensions(canvas,size);

        const matcher=new faceapi.FaceMatcher(labeledDescriptors);

        setInterval(async ()=>{
            if(!running) return;

            const detections=await faceapi.detectAllFaces(
                video,new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptors();

            const resized=faceapi.resizeResults(detections,size);
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);

            resized.forEach(d=>{
                const result=matcher.findBestMatch(d.descriptor);
                const confidence=((1-result.distance)*100).toFixed(1);

                new faceapi.draw.DrawBox(d.detection.box,{
                    label:`${result.label} (${confidence}%)`
                }).draw(canvas);

                if(result.label!=="unknown"){
                    markAttendance(result.label);
                }
            });

        },100);
    };
}

function stopCamera(){
    running=false;
    if(stream) stream.getTracks().forEach(t=>t.stop());
}

function captureNow(){
    alert("Captured");
}

function markAttendance(name){
    if(!attendance.has(name)){
        attendance.add(name);

        const log=document.createElement("div");
        log.innerText=`${name} - ${new Date().toLocaleTimeString()}`;
        document.getElementById("logs").prepend(log);

        document.getElementById("presentCount").innerText=attendance.size;
    }
}

function exportData(){
    let data="Name,Time\n";
    attendance.forEach(name=>{
        data+=name+","+new Date().toLocaleTimeString()+"\n";
    });

    const blob=new Blob([data]);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="attendance.csv";
    a.click();
}    captureBtn.addEventListener('click', () => {
        // Set canvas dimensions to match the actual video feed
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame onto the canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas image to a Base64 encoded string
        const imageData = canvas.toDataURL('image/jpeg');

        statusMessage.innerText = "Saving image...";
        statusMessage.className = "mt-4 text-gray-600 font-medium";

        // Send the Base64 string to the Flask '/save_image' route
        fetch('/save_image', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ image: imageData })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                statusMessage.innerText = "Success! Saved as: " + data.filename;
                statusMessage.className = "mt-4 text-blue-600 font-bold";
                
                // Optional: Flash the screen to indicate a photo was taken
                scanOverlay.classList.add('bg-white/50');
                setTimeout(() => scanOverlay.classList.remove('bg-white/50'), 150);
            } else {
                throw new Error(data.error || "Unknown server error");
            }
        })
        .catch(error => {
            statusMessage.innerText = "Error saving image.";
            statusMessage.className = "mt-4 text-red-600 font-bold";
            console.error("Fetch Error:", error);
        });
    });

});
