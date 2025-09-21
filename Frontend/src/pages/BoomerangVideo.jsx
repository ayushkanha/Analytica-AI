import React, { useState, useRef, useEffect } from 'react';
import featuresectionVideo from '../assets/featuresection1.mp4';
const BoomerangVideo = () => {
  const videoRef = useRef(null);
  const animationFrameRef = useRef(null); 
  const [playbackDirection, setPlaybackDirection] = useState('forward');

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const handleVideoEnd = () => setPlaybackDirection('reverse');
    videoElement.addEventListener('ended', handleVideoEnd);
    return () => videoElement.removeEventListener('ended', handleVideoEnd);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rewind = () => {
      if (videoElement.currentTime <= 0) {
        cancelAnimationFrame(animationFrameRef.current);
        setPlaybackDirection('forward');
      } else {
        videoElement.currentTime -= 1 / 60; 
        animationFrameRef.current = requestAnimationFrame(rewind);
      }
    };

    if (playbackDirection === 'forward') {
      cancelAnimationFrame(animationFrameRef.current);
      videoElement.play();
    } else {
      animationFrameRef.current = requestAnimationFrame(rewind);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [playbackDirection]);

  return (
    <div className="absolute inset-0 z-0">
      <video
        ref={videoRef}
        className="w-full h-full object-cover z-0 pt-20"
        src={featuresectionVideo} 
        autoPlay
        loop={false}
        muted
        playsInline
      ></video>
    </div>
  );
};
export default BoomerangVideo;