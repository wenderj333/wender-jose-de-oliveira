import * as THREE from 'three';

const container = document.getElementById('scene3d');

if (container) {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let renderer;
    let camera;
    let scene;
    let sceneGroup;
    let animationFrame;
    let previousTime = 0;
    let pointerTarget = { x: 0, y: 0 };
    let pointerCurrent = { x: 0, y: 0 };
    const animatedObjects = [];

    const damp = (current, target, smoothing, delta) => THREE.MathUtils.damp(current, target, smoothing, delta);

    const createMaterial = (color, opacity = 1, metalness = 0, roughness = 0.8) => new THREE.MeshStandardMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        metalness,
        roughness,
        depthWrite: opacity >= 1
    });

    const addBox = (width, height, depth, position, color, opacity = 1, rotation = null) => {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            createMaterial(color, opacity, 0.08, 0.72)
        );
        mesh.position.set(...position);
        if (rotation) mesh.rotation.set(...rotation);
        sceneGroup.add(mesh);
        return mesh;
    };

    const registerDampedDeskObject = (object, phase, amount = 0.014) => {
        animatedObjects.push({
            object,
            phase,
            amount,
            basePosition: object.position.clone(),
            baseRotation: object.rotation.clone()
        });
        return object;
    };

    const addScroll = (position, rotation, scale = 1) => {
        const group = new THREE.Group();
        const parchment = new THREE.Mesh(
            new THREE.BoxGeometry(1.45 * scale, 0.07 * scale, 0.9 * scale),
            createMaterial(0xd4af67, 0.2, 0.05, 0.92)
        );
        parchment.position.y = 0.08 * scale;
        group.add(parchment);

        const rodMaterial = createMaterial(0x855422, 0.6, 0.18, 0.58);
        const rodGeometry = new THREE.CylinderGeometry(0.095 * scale, 0.095 * scale, 1.1 * scale, 12);
        const rodTop = new THREE.Mesh(rodGeometry, rodMaterial);
        const rodBottom = new THREE.Mesh(rodGeometry, rodMaterial);
        rodTop.position.set(0, 0.16 * scale, -0.48 * scale);
        rodBottom.position.set(0, 0.16 * scale, 0.48 * scale);
        rodTop.rotation.x = Math.PI / 2;
        rodBottom.rotation.x = Math.PI / 2;
        group.add(rodTop, rodBottom);
        group.position.set(...position);
        group.rotation.set(...rotation);
        sceneGroup.add(group);
        registerDampedDeskObject(group, position[0] * 0.3, 0.018);
        return group;
    };

    const addPaper = (position, rotation, scale = 1) => {
        const group = new THREE.Group();
        const paper = new THREE.Mesh(
            new THREE.BoxGeometry(1.8 * scale, 0.045 * scale, 1.2 * scale),
            createMaterial(0xe1c47a, 0.15, 0.02, 0.98)
        );
        paper.position.y = 0.045 * scale;
        group.add(paper);

        const edge = createMaterial(0xb48a32, 0.22, 0.03, 0.9);
        const topLine = new THREE.Mesh(new THREE.BoxGeometry(1.35 * scale, 0.012 * scale, 0.018 * scale), edge);
        const bottomLine = topLine.clone();
        topLine.position.set(0, 0.075 * scale, -0.2 * scale);
        bottomLine.position.set(0, 0.075 * scale, 0.02 * scale);
        group.add(topLine, bottomLine);
        group.position.set(...position);
        group.rotation.set(...rotation);
        sceneGroup.add(group);
        registerDampedDeskObject(group, position[0] * 0.24 + 1.2, 0.012);
        return group;
    };

    const createDust = () => {
        const positions = [];
        const velocities = [];
        const phases = [];
        for (let index = 0; index < 110; index += 1) {
            positions.push(
                (Math.random() - 0.5) * 12.5,
                (Math.random() - 0.5) * 6.8,
                -1.4 + Math.random() * 2.6
            );
            velocities.push([
                0.018 + Math.random() * 0.035,
                0.008 + Math.random() * 0.018,
                (Math.random() - 0.5) * 0.006
            ]);
            phases.push(Math.random() * Math.PI * 2);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xf3d88b,
            size: 0.045,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const points = new THREE.Points(geometry, material);
        points.userData = { phases, velocities };
        sceneGroup.add(points);
        return points;
    };

    const addCandleGlow = position => {
        const holder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.24, 0.38, 12),
            createMaterial(0x6c431f, 0.5, 0.12, 0.66)
        );
        holder.position.set(...position);
        sceneGroup.add(holder);

        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 12, 8),
            new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0.72 })
        );
        flame.scale.set(0.72, 1.45, 0.72);
        flame.position.set(position[0], position[1] + 0.3, position[2]);
        sceneGroup.add(flame);
        animatedObjects.push({ object: flame, phase: position[0], flame: true });

        const light = new THREE.PointLight(0xffbd63, 0.55, 4.5, 2);
        light.position.set(position[0], position[1] + 0.33, position[2] + 0.05);
        scene.add(light);
        animatedObjects.push({ object: light, phase: position[0] * 1.7, light: true });
    };

    const handleResize = () => {
        if (!renderer || !camera) return;
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(width, height, false);
    };

    const handlePointerMove = event => {
        if (reducedMotionQuery.matches) return;
        pointerTarget = {
            x: (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2,
            y: (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2
        };
        const bounds = container.parentElement?.getBoundingClientRect();
        if (!bounds || !bounds.width || !bounds.height) return;
        const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        container.parentElement.style.setProperty('--ui-tilt-x', `${normalizedX * -1.6}deg`);
        container.parentElement.style.setProperty('--ui-tilt-y', `${normalizedY * 1.05}deg`);
    };

    const resetInterfaceTilt = () => {
        if (reducedMotionQuery.matches || !container.parentElement) return;
        container.parentElement.style.setProperty('--ui-tilt-x', '0deg');
        container.parentElement.style.setProperty('--ui-tilt-y', '0deg');
    };

    const animateDust = (dust, seconds, delta) => {
        const attribute = dust.geometry.getAttribute('position');
        const { phases, velocities } = dust.userData;
        for (let index = 0; index < phases.length; index += 1) {
            const offset = index * 3;
            const velocity = velocities[index];
            attribute.array[offset] += velocity[0] * delta;
            attribute.array[offset + 1] += (velocity[1] + Math.sin(seconds * 0.7 + phases[index]) * 0.012) * delta;
            attribute.array[offset + 2] += velocity[2] * delta;
            if (attribute.array[offset] > 6.4) attribute.array[offset] = -6.4;
            if (attribute.array[offset + 1] > 3.6) attribute.array[offset + 1] = -3.6;
            if (attribute.array[offset + 2] > 1.5) attribute.array[offset + 2] = -1.5;
            if (attribute.array[offset + 2] < -1.5) attribute.array[offset + 2] = 1.5;
        }
        attribute.needsUpdate = true;
    };

    const renderFrame = time => {
        if (!renderer || !scene || !camera) return;
        const seconds = time * 0.001;
        const delta = Math.min(0.05, Math.max(0.001, previousTime ? (time - previousTime) * 0.001 : 0.016));
        previousTime = time;
        const shouldAnimate = !reducedMotionQuery.matches;
        if (shouldAnimate) {
            pointerCurrent.x = damp(pointerCurrent.x, pointerTarget.x, 3.8, delta);
            pointerCurrent.y = damp(pointerCurrent.y, pointerTarget.y, 3.8, delta);
            sceneGroup.rotation.y = damp(sceneGroup.rotation.y, pointerCurrent.x * 0.022, 3.2, delta);
            sceneGroup.rotation.x = damp(sceneGroup.rotation.x, pointerCurrent.y * -0.015, 3.2, delta);

            animatedObjects.forEach(entry => {
                const { object, phase, flame, light, basePosition, baseRotation, amount = 0.014 } = entry;
                if (flame) {
                    object.rotation.z = Math.sin(seconds * 3.4 + phase) * 0.08;
                    object.scale.x = 0.72 + Math.sin(seconds * 4.2 + phase) * 0.06;
                } else if (light) {
                    object.intensity = 0.48 + Math.sin(seconds * 4 + phase) * 0.1;
                } else if (basePosition && baseRotation) {
                    const targetY = basePosition.y + Math.sin(seconds * 0.65 + phase) * amount;
                    const targetZ = basePosition.z + Math.cos(seconds * 0.42 + phase) * amount * 0.35;
                    object.position.y = damp(object.position.y, targetY, 4.6, delta);
                    object.position.z = damp(object.position.z, targetZ, 4.6, delta);
                    object.rotation.z = damp(object.rotation.z, baseRotation.z + Math.sin(seconds * 0.55 + phase) * amount * 0.8, 4.2, delta);
                    object.rotation.x = damp(object.rotation.x, baseRotation.x + Math.cos(seconds * 0.38 + phase) * amount * 0.24, 4.2, delta);
                }
            });

            const dust = sceneGroup.userData.dust;
            if (dust) animateDust(dust, seconds, delta);
        }
        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
            renderer.setClearColor(0x000000, 0);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.domElement.setAttribute('aria-hidden', 'true');
            container.appendChild(renderer.domElement);

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
            camera.position.set(0, 0.2, 11);
            camera.lookAt(0, 0, 0);

            scene.add(new THREE.AmbientLight(0xf5dfae, 1.1));
            const warmKey = new THREE.DirectionalLight(0xffd58b, 1.15);
            warmKey.position.set(-4, 5, 6);
            scene.add(warmKey);
            const coolFill = new THREE.DirectionalLight(0x789476, 0.28);
            coolFill.position.set(5, 1, 3);
            scene.add(coolFill);

            sceneGroup = new THREE.Group();
            scene.add(sceneGroup);

            const wood = 0x3a2111;
            const gold = 0xb48a32;
            addBox(0.32, 7.2, 0.32, [-5.55, 0, -1.6], wood, 0.44, [0, 0, -0.035]);
            addBox(0.32, 7.2, 0.32, [5.55, 0, -1.6], wood, 0.44, [0, 0, 0.035]);
            addBox(11.1, 0.28, 0.34, [0, 3.44, -1.6], wood, 0.42);
            addBox(11.1, 0.2, 0.3, [0, -3.46, -1.6], gold, 0.2);

            const sealGeometry = new THREE.TorusGeometry(0.45, 0.055, 10, 32);
            [-4.75, 4.75].forEach((x, index) => {
                const seal = new THREE.Mesh(
                    sealGeometry,
                    new THREE.MeshStandardMaterial({
                        color: index === 0 ? 0xd4af37 : 0x718b52,
                        metalness: 0.58,
                        roughness: 0.38,
                        transparent: true,
                        opacity: 0.5
                    })
                );
                seal.position.set(x, index === 0 ? 1.75 : -1.4, -0.1);
                seal.rotation.set(0.35, index === 0 ? -0.3 : 0.3, index === 0 ? -0.28 : 0.22);
                sceneGroup.add(seal);
                registerDampedDeskObject(seal, index * 2.1, 0.02);
            });

            addScroll([-4.15, -2.25, 0.35], [0.25, -0.35, -0.18], 0.9);
            addScroll([4.08, 2.25, 0.2], [-0.18, 0.32, 0.16], 0.84);
            addPaper([-1.85, 1.55, 0.15], [0.22, -0.2, -0.12], 0.9);
            addPaper([1.7, -1.55, 0.1], [-0.18, 0.26, 0.14], 0.78);
            addCandleGlow([-4.95, -2.75, 0.45]);
            addCandleGlow([4.9, 2.72, 0.35]);
            sceneGroup.userData.dust = createDust();

            handleResize();
            window.addEventListener('resize', handleResize, { passive: true });
            window.addEventListener('pointermove', handlePointerMove, { passive: true });
            window.addEventListener('pointerleave', resetInterfaceTilt, { passive: true });
            reducedMotionQuery.addEventListener?.('change', () => {
                if (reducedMotionQuery.matches) resetInterfaceTilt();
                handleResize();
            });
            container.classList.add('is-ready');
            animationFrame = window.requestAnimationFrame(renderFrame);
        } catch (error) {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            container.remove();
        }
    };

    start();
}
