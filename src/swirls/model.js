import * as THREE from 'three';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useLoader, useThree, useFrame } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import lerp from 'lerp';

function useEquirectangolarEnv(url) {
  const env = useLoader(RGBELoader, url);
  const { gl } = useThree();
  const envCube = useMemo(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    const envMap = pmremGenerator.fromEquirectangular(env).texture;
    pmremGenerator.dispose();

    return envMap;
  }, [env, gl]);

  return envCube;
}

// Transform value from one range to another
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

export default function Model({ video, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useLoader(GLTFLoader, '/3d/swirls.gltf');

  // Env Map for reflections
  const envMap = useEquirectangolarEnv('/3d/venice_sunset_1k.hdr');

  // Animation
  const actions = useRef();
  const [mixer] = useState(() => new THREE.AnimationMixer());
  useEffect(() => {
    actions.current = {
      animation_0: mixer.clipAction(animations[0], group.current),
    };
    actions.current.animation_0.setLoop(THREE.LoopOnce);
    actions.current.animation_0.clampWhenFinished = true;
    actions.current.animation_0.time = 0;
    actions.current.animation_0.play();
    mixer.update(0);
    return () => animations.forEach(clip => mixer.uncacheClip(clip));
  }, []);

  // Bind scroll to animation
  useEffect(() => {
    const handleScroll = () => {
      if (actions.current) {
        actions.current.animation_0.time = lerp(
          actions.current.animation_0.time,
          map(window.scrollY, 0, document.body.getBoundingClientRect().height - window.innerHeight, 0, actions.current.animation_0.getClip().duration),
          0.1,
        );
        mixer.update(0);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Set the Camera
  const camRef = useRef();
  const { setDefaultCamera } = useThree();
  React.useEffect(() => {
    setDefaultCamera(camRef.current);
  }, []);
  useFrame(() => camRef.current.updateMatrixWorld());
  const sharedVideo = React.useMemo(() => new THREE.VideoTexture(video.current), [video.current]);

  return (
    <group ref={group} dispose={null}>
      <scene name="Scene" {...props}>
        <perspectiveCamera
          ref={camRef}
          {...nodes.Camera_NEW}
          onUpdate={self => self.updateProjectionMatrix()}
        />
        <mesh
          geometry={nodes.Tube1.geometry}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
          position={[-2.42, 2.76, -0.41]}
        >
          <meshStandardMaterial
            {...materials.Litur}
            metalness={0.2}
            envMap={envMap}
            envMapIntensity={0.4}
            attach="material"
            map={sharedVideo}
          />
        </mesh>
        <mesh
          geometry={nodes.Tube.geometry}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
          position={[-2.42, 2.76, -0.41]}
        >
          <meshStandardMaterial
            {...materials.Litur}
            metalness={0.2}
            envMap={envMap}
            envMapIntensity={0.4}
            attach="material"
            map={sharedVideo}
          />
        </mesh>
      </scene>
    </group>
  );
}
