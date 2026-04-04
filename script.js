// Ensure the DOM is fully loaded before attaching events
document.addEventListener('DOMContentLoaded', () => {
    
    // HTML Elements
    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvasElement');
    const startBtn = document.getElementById('startBtn');
    const captureBtn = document.getElementById('captureBtn');
    const statusMessage = document.getElementById('statusMessage');
    const scanOverlay = document.getElementById('scanOverlay');

    // 1. Start the Webcam
    startBtn.addEventListener('click', async () => {
        try {
            statusMessage.innerText = "Requesting camera access...";
            
            // Request video stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            
            // Toggle UI Buttons
            startBtn.classList.add('hidden');
            captureBtn.classList.remove('hidden');
            scanOverlay.classList.remove('hidden'); // Show the cool CSS laser animation
            
            statusMessage.innerText = "Camera active. Ready to capture.";
            statusMessage.className = "mt-4 text-green-600 font-medium";
            
        } catch (err) {
            statusMessage.innerText = "Error accessing camera: " + err.message;
            statusMessage.className = "mt-4 text-red-600 font-medium";
            console.error("Camera Error:", err);
        }
    });

    // 2. Capture Image and Send to Python Backend
    captureBtn.addEventListener('click', () => {
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
