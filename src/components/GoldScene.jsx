import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export default function GoldScene({ paused = false }) {
  const host = useRef(null);
  const pausedRef = useRef(paused);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const element = host.current;
    let renderer;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      if (!context) {
        setUnavailable(true);
        return undefined;
      }
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setUnavailable(true);
      return undefined;
    }
    setUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.7, 9.6);
    camera.lookAt(0, 0.2, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentMap = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    const group = new THREE.Group();
    scene.add(group);
    group.rotation.set(-0.12, -0.48, 0.08);
    const gold = new THREE.MeshStandardMaterial({
      color: 0xcca657,
      metalness: 1,
      roughness: 0.23,
    });
    const edge = new THREE.MeshStandardMaterial({
      color: 0xf6e4aa,
      metalness: 0.8,
      roughness: 0.28,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x3b4036,
      metalness: 0.9,
      roughness: 0.3,
    });
    const geometries = [];
    const barGeometry = new RoundedBoxGeometry(0.8, 2.55, 0.8, 5, 0.08);
    const wickGeometry = new THREE.CylinderGeometry(0.026, 0.026, 3.7, 12);
    geometries.push(barGeometry, wickGeometry);
    const heights = [1.4, 2.25, 3.0];
    [-1.1, 0, 1.1].forEach((x, i) => {
      const bar = new THREE.Mesh(barGeometry, i === 0 ? dark : gold);
      bar.scale.y = heights[i] / 2.55;
      bar.position.set(x, (heights[i] - 2.25) * 0.35, 0);
      bar.rotation.y = Math.PI / 10;
      const wick = new THREE.Mesh(wickGeometry, i === 0 ? dark : edge);
      wick.scale.y = heights[i] / 2.55;
      wick.position.copy(bar.position);
      group.add(wick, bar);
    });
    const orbitGeometry = new THREE.TorusGeometry(2.5, 0.012, 8, 120);
    geometries.push(orbitGeometry);
    const orbit = new THREE.Mesh(orbitGeometry, edge);
    orbit.rotation.set(1.05, 0.15, -0.3);
    group.add(orbit);
    const satelliteGeometry = new THREE.IcosahedronGeometry(0.11, 1);
    geometries.push(satelliteGeometry);
    const satellite = new THREE.Mesh(satelliteGeometry, gold);
    group.add(satellite);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x252517, 3));
    const key = new THREE.DirectionalLight(0xffe6a7, 5);
    key.position.set(-3, 5, 4);
    const rim = new THREE.DirectionalLight(0xd4ff9a, 3);
    rim.position.set(4, 1, -2);
    scene.add(key, rim);
    const pointer = { x: 0, y: 0 };
    const move = (event) => {
      const rect = element.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
    };
    const leave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resize.observe(element);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(element);
    let frame;
    let time = 0;
    let lastRender = 0;
    const animate = (timestamp) => {
      frame = requestAnimationFrame(animate);
      if (!visible || document.hidden || timestamp - lastRender < 32) return;
      lastRender = timestamp;
      if (!preference.matches && !pausedRef.current) {
        time += 0.012;
        group.rotation.y += (-0.48 + pointer.x * 0.4 - group.rotation.y) * 0.04;
        group.rotation.x +=
          (-0.12 + pointer.y * 0.15 - group.rotation.x) * 0.04;
        group.position.y = Math.sin(time) * 0.09;
        satellite.position.set(
          Math.cos(time * 0.45) * 2.5,
          Math.sin(time * 0.45) * 1.35,
          Math.sin(time * 0.45) * 2.1,
        );
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    const contextLost = (event) => {
      event.preventDefault();
      setUnavailable(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      geometries.forEach((geometry) => geometry.dispose());
      [gold, edge, dark].forEach((material) => material.dispose());
      environmentMap.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      className={`gold-scene ${unavailable ? "scene-fallback" : ""} ${paused ? "scene-paused" : ""}`}
      ref={host}
      aria-hidden="true"
      onPointerMove={(event) => {
        if (
          !unavailable ||
          paused ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--tilt-y",
          `${((event.clientX - rect.left) / rect.width - 0.5) * 16}deg`,
        );
        event.currentTarget.style.setProperty(
          "--tilt-x",
          `${((event.clientY - rect.top) / rect.height - 0.5) * -8}deg`,
        );
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--tilt-y", "0deg");
        event.currentTarget.style.setProperty("--tilt-x", "0deg");
      }}
    >
      {unavailable && (
        <div className="fallback-bars">
          <span />
          <span />
          <span />
          <i />
        </div>
      )}
    </div>
  );
}
