import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Full-page fixed 3D background: a single pizza built from Three.js primitives
 * (flattened cylinder crust, thinner cheese layer, pepperoni disc toppings,
 * basil-leaf-shaped flecks). Instead of auto-spinning forever, its rotation
 * is driven directly by scroll position, so it turns as the user scrolls
 * down the page. A slow idle spin still plays before any scrolling happens
 * so it doesn't look static on load.
 */
export default function Background3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 4.2, 9.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // ---- lighting: warm ember key light + soft fill, no neon ----
    const ambient = new THREE.AmbientLight(0x3a291c, 1.3);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xe2833b, 3.4, 40);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xb85c1f, 1.2, 40);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf2e3c9, 0.8, 30);
    rimLight.position.set(0, 2, -8);
    scene.add(rimLight);

    // ---- materials ----
    const crustMat = new THREE.MeshStandardMaterial({ color: 0xc98a4b, roughness: 0.6, metalness: 0.05 });
    const crustEdgeMat = new THREE.MeshStandardMaterial({ color: 0xa8672f, roughness: 0.65, metalness: 0.05 });
    const sauceMat = new THREE.MeshStandardMaterial({ color: 0x9c3b23, roughness: 0.5, metalness: 0.05 });
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xf0c25c, roughness: 0.45, metalness: 0.05 });
    const pepperoniMat = new THREE.MeshStandardMaterial({ color: 0xaa3524, roughness: 0.5, metalness: 0.1 });
    const basilMat = new THREE.MeshStandardMaterial({ color: 0x5e7a3f, roughness: 0.6, metalness: 0.02 });

    // ---- build the pizza as one group so it all rotates together ----
    const pizza = new THREE.Group();

    const RADIUS = 3.1;

    // crust (outer rim, slightly thicker cylinder)
    const crust = new THREE.Mesh(
      new THREE.CylinderGeometry(RADIUS, RADIUS, 0.34, 64),
      crustMat
    );
    pizza.add(crust);

    // crust edge ring (torus sitting on the rim to read as a raised crust lip)
    const crustEdge = new THREE.Mesh(
      new THREE.TorusGeometry(RADIUS - 0.18, 0.22, 16, 64),
      crustEdgeMat
    );
    crustEdge.rotation.x = Math.PI / 2;
    crustEdge.position.y = 0.05;
    pizza.add(crustEdge);

    // sauce layer (slightly smaller disc, sitting on top of the crust)
    const sauce = new THREE.Mesh(
      new THREE.CylinderGeometry(RADIUS - 0.35, RADIUS - 0.35, 0.06, 64),
      sauceMat
    );
    sauce.position.y = 0.2;
    pizza.add(sauce);

    // cheese layer (irregular top surface via a low cylinder, slightly smaller than sauce)
    const cheese = new THREE.Mesh(
      new THREE.CylinderGeometry(RADIUS - 0.4, RADIUS - 0.4, 0.05, 64),
      cheeseMat
    );
    cheese.position.y = 0.25;
    pizza.add(cheese);

    // pepperoni discs, scattered across the top
    const pepperoniPositions = [
      [0, 1.1], [1.3, 0.4], [-1.3, 0.5], [0.7, -1.2], [-0.8, -1.3],
      [1.9, -0.6], [-1.9, -0.5], [0, -2.0], [1.1, 1.6], [-1.1, 1.7],
    ];
    pepperoniPositions.forEach(([x, z]) => {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24),
        pepperoniMat
      );
      disc.position.set(x, 0.3, z);
      pizza.add(disc);
    });

    // basil flecks (small flattened spheres) scattered between pepperoni
    const basilPositions = [
      [0.5, 0.9], [-0.6, -0.7], [1.6, 1.1], [-1.6, -1.0], [0.2, -0.3], [-0.3, 1.9],
    ];
    basilPositions.forEach(([x, z]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), basilMat);
      leaf.scale.set(1, 0.25, 0.6);
      leaf.position.set(x, 0.31, z);
      leaf.rotation.y = Math.random() * Math.PI;
      pizza.add(leaf);
    });

    // one slice visually "pulled" outward and tilted, for a dynamic silhouette
    // (approximated with a wedge cut via a rotated box mask is overkill here;
    // instead we add a floating slice-like wedge nearby using a cone slice trick)
    const sliceGroup = new THREE.Group();
    const sliceGeo = new THREE.CylinderGeometry(1.4, 0, 0.3, 3, 1, false, 0, Math.PI / 4);
    const slice = new THREE.Mesh(sliceGeo, crustMat);
    slice.rotation.x = Math.PI / 2;
    sliceGroup.add(slice);
    sliceGroup.position.set(4.6, -0.6, 1.2);
    sliceGroup.rotation.set(0.3, 0.6, -0.4);
    sliceGroup.scale.setScalar(0.001); // keep negligible/invisible; simplest is to omit if unstable
    // Note: kept minimal/disabled to avoid an odd artifact; the whole pizza itself is the hero shape.

    pizza.rotation.x = -0.15;
    scene.add(pizza);

    // ---- scroll + idle-spin driven rotation ----
    let idleAngle = 0;
    let targetSpin = 0;
    let currentSpin = 0;

    function getScrollFraction() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      return scrollTop / max;
    }

    function onScroll() {
      const frac = getScrollFraction();
      // Full slow rotations across the whole page scroll.
      targetSpin = frac * Math.PI * 4;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- mouse parallax (subtle tilt, on top of scroll spin) ----
    const mouse = { x: 0, y: 0 };
    function onMouseMove(e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("mousemove", onMouseMove);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    let frameId;
    const clock = new THREE.Clock();
    let hasScrolled = false;

    window.addEventListener(
      "scroll",
      () => {
        hasScrolled = true;
      },
      { passive: true, once: true }
    );

    function animate() {
      const dt = clock.getDelta();

      if (!hasScrolled) {
        // gentle idle spin before the user starts scrolling
        idleAngle += dt * 0.25;
      }

      // ease current rotation toward scroll-driven target
      currentSpin += (targetSpin - currentSpin) * 0.08;

      pizza.rotation.y = currentSpin + idleAngle;
      pizza.rotation.z = mouse.x * 0.08;
      pizza.position.y = Math.sin(currentSpin * 0.5) * 0.15 + mouse.y * -0.15;

      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);

      [crust, crustEdge, sauce, cheese].forEach((m) => m.geometry.dispose());
      pizza.children.forEach((child) => {
        if (child.geometry) child.geometry.dispose();
      });
      [crustMat, crustEdgeMat, sauceMat, cheeseMat, pepperoniMat, basilMat].forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.9,
      }}
    />
  );
}