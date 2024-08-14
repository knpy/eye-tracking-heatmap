import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Camera, Upload, BarChart } from 'lucide-react';
import simpleheat from 'simpleheat';

const EyeTrackingHeatmapTool = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);
  const [isTracking, setIsTracking] = useState(false);
  const [eyePositions, setEyePositions] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const canvasRef = useRef(null);
  const heatInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const IMAGE_WIDTH = 400;
  const IMAGE_HEIGHT = 400;

  useEffect(() => {
    if (canvasRef.current && !heatInstanceRef.current) {
      heatInstanceRef.current = simpleheat(canvasRef.current);
      heatInstanceRef.current.radius(20, 30);
    }
  }, []);

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        // この部分は実際のアイトラッキングロジックに置き換える必要があります
        const newPosition = {
          x: Math.random() * IMAGE_WIDTH,
          y: Math.random() * IMAGE_HEIGHT,
        };
        setEyePositions(prevPositions => [...prevPositions, newPosition]);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  useEffect(() => {
    if (heatInstanceRef.current && showHeatmap) {
      const data = eyePositions.map(pos => [pos.x, pos.y, 1]);
      heatInstanceRef.current.data(data).max(eyePositions.length);
      drawHeatmap();
    }
  }, [eyePositions, heatmapOpacity, showHeatmap]);

  const drawHeatmap = () => {
    if (heatInstanceRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      heatInstanceRef.current.draw(heatmapOpacity);
    }
  };

  const toggleTracking = async () => {
    if (!isTracking) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    setIsTracking(!isTracking);
    if (!isTracking) {
      setEyePositions([]);
      setShowHeatmap(false);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      value: URL.createObjectURL(file),
      label: file.name
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
    if (newImages.length > 0 && !selectedImage) {
      setSelectedImage(newImages[0].value);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const analyzeHeatmap = () => {
    setShowHeatmap(true);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Eye Tracking Heatmap Tool</h1>
      
      <div className="mb-4 flex items-center space-x-4">
        <Select value={selectedImage} onValueChange={setSelectedImage}>
          <SelectTrigger>
            <SelectValue placeholder="Select an image" />
          </SelectTrigger>
          <SelectContent>
            {images.map((image) => (
              <SelectItem key={image.value} value={image.value}>
                {image.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={triggerFileInput}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button onClick={toggleTracking} disabled={!selectedImage}>
          <Camera className="mr-2 h-4 w-4" />
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>
        <Button onClick={analyzeHeatmap} disabled={!selectedImage || isTracking || eyePositions.length === 0}>
          <BarChart className="mr-2 h-4 w-4" />
          Analyze
        </Button>
      </div>

      <div className="flex">
        <div className="relative w-1/2 h-[400px] border border-gray-300">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Selected image"
              className="w-full h-full object-cover"
            />
          )}
          <canvas
            ref={canvasRef}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className="absolute top-0 left-0 w-full h-full"
          />
          {isTracking && selectedImage && eyePositions.length > 0 && (
            <div
              className="absolute w-4 h-4 bg-red-500 rounded-full"
              style={{
                left: `${(eyePositions[eyePositions.length - 1].x / IMAGE_WIDTH) * 100}%`,
                top: `${(eyePositions[eyePositions.length - 1].y / IMAGE_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
        <div className="w-1/2 h-[400px] border border-gray-300 ml-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="opacity" className="block mb-2">Heatmap Opacity:</label>
        <input
          type="range"
          id="opacity"
          min="0"
          max="1"
          step="0.1"
          value={heatmapOpacity}
          onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <p>Eye Positions Recorded: {eyePositions.length}</p>
      </div>
    </div>
  );
};

export default EyeTrackingHeatmapTool;