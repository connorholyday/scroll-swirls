import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from 'react-three-fiber';
import Model from './model';
import video from './swirls-video-texture.mp4';

function Sketch() {
  const ref = useRef();
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <>
      <video
        crossOrigin="anonymous"
        ref={ref}
        src={video}
        muted
        autoPlay
        loop
        playsInline
        onPlay={() => setVideoLoaded(true)}
        style={{
          opacity: 0,
          pointerEvents: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          height: '1px',
          width: '1px',
        }}
      />
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 2019,
          transform: 'translateZ(0)',
        }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.6;
        }}
      >
        <ambientLight color="white" intensity={0.7} />
        {videoLoaded && (
          <Suspense fallback={null}>
            <Model video={ref} />
          </Suspense>
        )}
      </Canvas>
    </>
  );
}

export default Sketch;
