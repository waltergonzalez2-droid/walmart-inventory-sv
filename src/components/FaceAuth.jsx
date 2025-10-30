import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceAuth({ onAuthSuccess }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Cargando modelos de reconocimiento facial...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/public/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/public/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/public/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/public/models')
        ]);
        console.log('✅ Modelos cargados correctamente');
        setModelsLoaded(true);
      } catch (err) {
        console.error('❌ Error al cargar modelos:', err);
        setError('Error al cargar modelos de reconocimiento facial: ' + err.message);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const startVideo = async () => {
      try {
        console.log('🎥 Solicitando acceso a la cámara...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        console.log('✅ Cámara activada correctamente');
        videoRef.current.srcObject = stream;
        setStream(stream);
      } catch (err) {
        console.error('❌ Error al acceder a la cámara:', err);
        setError('Error al acceder a la cámara: ' + err.message);
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  useEffect(() => {
    if (!modelsLoaded || !stream) return;

    const detectFaces = async () => {
      const detectionTimer = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        // Ajustar el canvas al tamaño del video
        const displaySize = { 
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        // Dibujar detecciones
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Dibujar cuadro de detección y landmarks
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

        // Si se detecta un rostro correctamente, autenticar
        if (detections.length === 1 && detections[0].detection.score > 0.5) {
          clearInterval(detectionTimer);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          onAuthSuccess();
        }
      }, 100);

      return () => clearInterval(detectionTimer);
    };

    detectFaces();
  }, [modelsLoaded, stream, onAuthSuccess]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-900">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-center p-4">
          <div>
            <p className="font-semibold mb-2">{error}</p>
            <p className="text-sm text-slate-400">Por favor, asegúrese de que su cámara esté conectada y permitida</p>
          </div>
        </div>
      ) : !modelsLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-slate-400">Cargando modelos de reconocimiento facial...</p>
          </div>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full"
          />
        </>
      )}
    </div>
  );
}
