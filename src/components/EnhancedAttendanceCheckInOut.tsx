"use client";

import { useState, useEffect, useRef } from 'react';
import { Camera, Check, X, MapPin, Clock, AlertCircle, User } from 'lucide-react';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
}

interface EnhancedAttendanceCheckInOutProps {
  employeeId: string;
  employeeName: string;
  role: string;
  sites: string[];
  currentStatus: 'checked-in' | 'checked-out' | 'none';
  onStatusChange: () => void;
}

export default function EnhancedAttendanceCheckInOut({
  employeeId,
  employeeName,
  role,
  sites,
  currentStatus,
  onStatusChange
}: EnhancedAttendanceCheckInOutProps) {
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get current location with better accuracy
  const getCurrentLocation = async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser'));
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;

            // Get address using reverse geocoding (you can use any geocoding service)
            const address = await getAddressFromCoords(latitude, longitude);

            setLocation({
              latitude,
              longitude,
              address: address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              accuracy
            });

            resolve({
              latitude,
              longitude,
              address: address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              accuracy
            });
          } catch (error) {
            reject(error);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          setLocationLoading(false);
          let errorMessage = 'Could not get your location. Please enable location services.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  };

  // Get address from coordinates (mock implementation)
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    // In a real app, you would use a geocoding service like Google Maps API
    // For now, return a formatted coordinate string
    return `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Could not access camera. Please ensure camera permissions are granted.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture photo
  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error('Camera not ready'));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add timestamp and location overlay
      const timestamp = new Date().toLocaleString();
      const locationText = location ? location.address : 'Location pending...';

      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, canvas.height - 60, canvas.width, 60);

      context.fillStyle = 'white';
      context.font = '16px Arial';
      context.fillText(timestamp, 10, canvas.height - 35);
      context.fillText(locationText, 10, canvas.height - 15);

      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(imageDataUrl);
    });
  };

  // Handle check-in/check-out
  const handleCheckInOut = async () => {
    try {
      if (!selectedSite) {
        setMessage('Please select a site');
        setMessageType('error');
        return;
      }

      if (!capturedImage) {
        setMessage('Please capture a photo');
        setMessageType('error');
        return;
      }

      if (!location) {
        setMessage('Please enable location services');
        setMessageType('error');
        return;
      }

      setLoading(true);
      setMessage('');

      const action = currentStatus === 'checked-out' ? 'check-in' : 'check-out';

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          employeeId,
          employeeName,
          role,
          site: selectedSite,
          photoUrl: capturedImage,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            accuracy: location.accuracy
          },
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to process request');

      setMessage(`Successfully ${action === 'check-in' ? 'checked in' : 'checked out'}! Waiting for approval.`);
      setMessageType('success');

      // Reset form
      setCapturedImage(null);
      setSelectedSite('');
      stopCamera();

      onStatusChange();

    } catch (error: any) {
      console.error('Error:', error);
      setMessage(error.message || 'Something went wrong');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Get location on component mount
  useEffect(() => {
    getCurrentLocation().catch((error: any) => {
      console.error('Location error:', error);
      setMessage(error.message);
      setMessageType('error');
    });

    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Mark Attendance</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{employeeName}</span>
          <span className="text-gray-400">•</span>
          <span className="capitalize">{role}</span>
        </div>
      </div>

      {/* Site Selection */}
      <div className="mb-6">
        <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-2">
          Select Site
        </label>
        <select
          id="site"
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading || currentStatus === 'checked-in'}
        >
          <option value="">Select a site</option>
          {sites.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
      </div>

      {/* Location Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Current Location</span>
          {locationLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
          )}
        </div>
        {location ? (
          <div className="text-sm text-gray-600">
            <p>{location.address}</p>
            {location.accuracy && (
              <p className="text-xs text-gray-500 mt-1">
                Accuracy: ±{location.accuracy.toFixed(0)} meters
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Getting location...</p>
        )}
      </div>

      {/* Camera Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Capture Photo
          </label>
          {!cameraActive && (
            <button
              onClick={startCamera}
              className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              <Camera className="h-4 w-4" />
              <span>Open Camera</span>
            </button>
          )}
        </div>

        {cameraError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{cameraError}</p>
          </div>
        )}

        {cameraActive ? (
          <div className="space-y-3">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg border-2 border-gray-300"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  try {
                    const photo = await capturePhoto();
                    setCapturedImage(photo);
                    stopCamera();
                  } catch (error) {
                    setMessage('Failed to capture photo');
                    setMessageType('error');
                  }
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Camera className="h-4 w-4" />
                <span>Capture</span>
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg border-2 border-gray-300"
              />
              <button
                onClick={() => setCapturedImage(null)}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-green-600 text-center">Photo captured successfully</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Click "Open Camera" to capture photo</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCheckInOut}
          disabled={loading || (currentStatus !== 'checked-out' && !selectedSite) || !capturedImage || !location}
          className={`px-8 py-3 rounded-full text-white font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${currentStatus === 'checked-out'
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500 hover:bg-red-600'
            }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              {currentStatus === 'checked-out' ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Check In to {selectedSite || 'selected site'}</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5" />
                  <span>Check Out from {selectedSite || 'current site'}</span>
                </>
              )}
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          <div className="flex items-center space-x-2">
            {messageType === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Current Status */}
      {currentStatus === 'checked-in' && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              You are currently checked in at {selectedSite}. Don't forget to check out when you leave.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
