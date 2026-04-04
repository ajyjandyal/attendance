from flask import Flask, Response
import cv2
import face_recognition
import numpy as np
import os

app = Flask(__name__)

video_capture = cv2.VideoCapture(0)

known_face_encodings = []
known_face_names = []

# Load known faces
for file in os.listdir("known_faces"):
    image = face_recognition.load_image_file(f"known_faces/{file}")
    encodings = face_recognition.face_encodings(image)
    
    if len(encodings) > 0:
        known_face_encodings.append(encodings[0])
        known_face_names.append(file.split(".")[0])

def generate_frames():
    while True:
        success, frame = video_capture.read()
        if not success:
            break

        rgb_frame = frame[:, :, ::-1]

        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"

            if True in matches:
                match_index = matches.index(True)
                name = known_face_names[match_index]

            # Draw box
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, name, (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)
