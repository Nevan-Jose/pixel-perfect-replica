import { memo, useRef, useEffect } from "react";
import * as THREE from "three";

const COIN_LOGOS: Record<string, string> = {
  "Pyth": "https://assets.coingecko.com/coins/images/31924/small/pyth.png",
  "kava": "https://assets.coingecko.com/coins/images/9761/small/kava.png",
  "maker": "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png",
  "celestia": "https://assets.coingecko.com/coins/images/31967/small/tia.png",
  "algo": "https://assets.coingecko.com/coins/images/4380/small/download.png",
  "flow": "https://assets.coingecko.com/coins/images/13446/small/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png",
  "gala": "https://assets.coingecko.com/coins/images/12493/small/GALA-COINGECKO.png",
  "sei": "https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png",
  "fantom": "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
  "Sui": "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  "metis": "https://assets.coingecko.com/coins/images/15595/small/metis.PNG",
  "okb": "https://assets.coingecko.com/coins/images/4463/small/WeChat_Image_20220118095654.png",
  "stellar": "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
  "dai": "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
  "icp": "https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png",
  "atom": "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  "uniswap": "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  "Dot": "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  "Starknet": "https://assets.coingecko.com/coins/images/26433/small/starknet.png",
  "gnosis": "https://assets.coingecko.com/coins/images/662/small/logo_square_simple_300px.png",
  "moonriver": "https://assets.coingecko.com/coins/images/17984/small/9285.png",
  "Linea": "https://assets.coingecko.com/coins/images/33005/small/linea-logo.png",
  "optimism": "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  "scroll": "https://assets.coingecko.com/coins/images/32392/small/scroll.png",
  "celo": "https://assets.coingecko.com/coins/images/11090/small/InjXBNx9_400x400.jpg",
  "core_dao": "https://assets.coingecko.com/coins/images/28938/small/file_589.jpg",
  "blast": "https://assets.coingecko.com/coins/images/35494/small/Blast.jpg",
  "telos": "https://assets.coingecko.com/coins/images/7588/small/tlos_stacked_wht_bg.png",
  "Jupiter": "https://assets.coingecko.com/coins/images/34188/small/jup.png",
  "arb_nova": "https://assets.coingecko.com/coins/images/25819/small/arb.png",
  "base": "https://assets.coingecko.com/coins/images/34776/small/base-network.png",
  "mantle": "https://assets.coingecko.com/coins/images/30980/small/token-logo.png",
  "arb": "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  "zk_sync": "https://assets.coingecko.com/coins/images/31049/small/token-logo.png",
  "Near": "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  "Avax": "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  "Link": "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  "trx(tron)": "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  "Ada_cardano": "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  "Toncoin": "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  "Xrp": "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  "Ethereum": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  "Matic": "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  "USDT": "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  "BTC": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  "Aptos": "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
  "BNB": "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  "USDC": "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  "Solana": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

const COIN_NAMES = [
  "Pyth","kava","maker","celestia","algo","flow","gala","sei",
  "fantom","Sui","metis","okb","stellar","dai","icp","atom",
  "uniswap","Dot","Starknet","gnosis","moonriver","Linea","optimism",
  "scroll","celo","core_dao","blast","telos","Jupiter","arb_nova",
  "base","mantle","arb","zk_sync","Near","Avax","Link","trx(tron)",
  "Ada_cardano","Toncoin","Xrp","Ethereum","Matic","USDT","BTC",
  "Aptos","BNB","USDC","Solana"
];

const RING_RADIUS = 430;
const COIN_COUNT = 15;

const EXIT_DURATION = 1.0;

// Easing functions
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Shared geometry instances (created once, reused across all coins)
let sharedGeoCache: {
  body: THREE.CylinderGeometry;
  rim: THREE.TorusGeometry;
  ridge: THREE.TorusGeometry;
  bevel: THREE.TorusGeometry;
  logo: THREE.CylinderGeometry;
} | null = null;

function getSharedGeometries(scale: number) {
  if (sharedGeoCache) return sharedGeoCache;
  const R = 52 * scale, H = 14 * scale;
  sharedGeoCache = {
    body: new THREE.CylinderGeometry(R, R, H, 64),
    rim: new THREE.TorusGeometry(R, 3 * scale, 6, 32),
    ridge: new THREE.TorusGeometry(R * 0.78, 1.5 * scale, 4, 32),
    bevel: new THREE.TorusGeometry(R, 1.2 * scale, 4, 32),
    logo: new THREE.CylinderGeometry(R * 0.58, R * 0.58, 3 * scale, 24),
  };
  return sharedGeoCache;
}

function buildCoin(name: string, scale: number, envMap: THREE.CubeTexture) {
  const group = new THREE.Group();
  const H = 14 * scale;
  const geo = getSharedGeometries(scale);

  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0xc8cdd2, metalness: 1.0, roughness: 0.03, envMapIntensity: 3.0, envMap,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xe8eaed, metalness: 1.0, roughness: 0.05, envMapIntensity: 3.0, envMap,
  });

  const body = new THREE.Mesh(geo.body, [edgeMat, faceMat, faceMat]);
  group.add(body);

  const rimMat = new THREE.MeshStandardMaterial({ color: 0xb0b5ba, metalness: 1.0, roughness: 0.02, envMapIntensity: 3.5, envMap });
  const rim = new THREE.Mesh(geo.rim, rimMat);
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const ridgeF = new THREE.Mesh(geo.ridge, rimMat);
  ridgeF.rotation.x = Math.PI / 2;
  ridgeF.position.y = H / 2 + 0.5 * scale;
  group.add(ridgeF);
  const ridgeB = new THREE.Mesh(geo.ridge, rimMat);
  ridgeB.rotation.x = Math.PI / 2;
  ridgeB.position.y = -(H / 2 + 0.5 * scale);
  group.add(ridgeB);

  const bevel = new THREE.Mesh(geo.bevel, rimMat);
  bevel.rotation.x = Math.PI / 2;
  group.add(bevel);

  // Logo discs
  const logoBaseMat = new THREE.MeshStandardMaterial({ color: 0xf0f2f4, metalness: 0.5, roughness: 0.2, envMapIntensity: 1.5, envMap });
  const sideEdge = new THREE.MeshStandardMaterial({ color: 0xd0d4d8, metalness: 1.0, roughness: 0.04, envMap });

  const logoF = new THREE.Mesh(geo.logo, [sideEdge, logoBaseMat, logoBaseMat]);
  logoF.position.y = H / 2 + 1.5 * scale;
  group.add(logoF);
  const logoB = new THREE.Mesh(geo.logo, [sideEdge, logoBaseMat, logoBaseMat]);
  logoB.position.y = -(H / 2 + 1.5 * scale);
  group.add(logoB);

  const logoUrl = COIN_LOGOS[name];
  if (logoUrl) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(logoUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const tm = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.1, roughness: 0.4, transparent: true });
      const texBack = tex.clone();
      texBack.needsUpdate = true;
      texBack.wrapS = THREE.RepeatWrapping;
      texBack.repeat.x = -1;
      texBack.offset.x = 1;
      const tmb = new THREE.MeshStandardMaterial({ map: texBack, metalness: 0.1, roughness: 0.4, transparent: true });
      (logoF as any).material = [sideEdge, tm, tm];
      (logoB as any).material = [sideEdge, tmb, tmb];
    });
  }

  return group;
}

const Scene3D = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.setClearColor(0xffffff, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(-120, 280, 820);
    camera.lookAt(200, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const kl = new THREE.DirectionalLight(0xffffff, 6);
    kl.position.set(200, 500, 500);
    scene.add(kl);
    const sl = new THREE.DirectionalLight(0xccddff, 1.8);
    sl.position.set(-400, 200, -200);
    scene.add(sl);
    const pt1 = new THREE.PointLight(0xffffff, 5, 3000);
    pt1.position.set(300, 400, 500);
    scene.add(pt1);

    // Env map
    const cubeRT = new THREE.WebGLCubeRenderTarget(128);
    const cubeCam = new THREE.CubeCamera(1, 2000, cubeRT);
    const envSc = new THREE.Scene();
    envSc.add(new THREE.AmbientLight(0xffffff, 5));
    const envLights: [number, number, number, number, number, number][] = [
      [0xffffff, 40, 800, 300, 300, 300],
      [0xaaccff, 20, 600, -300, -100, -200],
    ];
    envLights.forEach(([c, i, d, x, y, z]) => {
      const p = new THREE.PointLight(c, i, d);
      p.position.set(x, y, z);
      envSc.add(p);
    });
    envSc.add(cubeCam);
    cubeCam.update(renderer, envSc);
    scene.environment = cubeRT.texture;

    // Coin ring
    const ringGroup = new THREE.Group();
    ringGroup.rotation.x = 1.25;
    ringGroup.rotation.y = 0.4;
    ringGroup.rotation.z = 0.45;
    ringGroup.position.set(280, -80, -100);
    scene.add(ringGroup);

    const allCoins: { mesh: THREE.Group; angle: number }[] = [];
    for (let i = 0; i < COIN_COUNT; i++) {
      const name = COIN_NAMES[i % COIN_NAMES.length];
      const angle = (i / COIN_COUNT) * Math.PI * 2;
      const coin = buildCoin(name, 0.95, cubeRT.texture);
      coin.position.set(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS, 0);
      coin.rotation.x = Math.PI / 2;
      coin.rotation.z = angle + Math.PI / 2;
      ringGroup.add(coin);
      allCoins.push({ mesh: coin, angle });
    }

    // Particles
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 2500;
      pArr[i * 3 + 1] = (Math.random() - 0.5) * 2500;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 2500;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pArr, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xbbbbbb, size: 1.2, transparent: true, opacity: 0.4 })));

    const clock = new THREE.Clock();
    let animId: number;
    let speedMultiplier = 1;
    let targetSpeed = 1;
    let scrollBoost = 0;
    let scrollBoostTarget = 0;
    let hoverActive = false;

    // --- Exit state ---
    let flyoutActive = false;
    let flyoutStartTime = 0;
    let exitAngles: number[] = [];

    // --- Turbo spin + fade state ---
    let turboActive = false;
    let fadeActive = false;
    let fadeStartTime = 0;
    const FADE_DURATION = 0.8;

    const setAllMaterialsTransparent = (coin: THREE.Group, transparent: boolean, opacity = 1) => {
      coin.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.transparent = transparent;
              m.opacity = opacity;
              m.needsUpdate = true;
            }
          });
        }
      });
    };

    const resetToRing = () => {
      flyoutActive = false;
      turboActive = false;
      fadeActive = false;
      targetSpeed = 1;
      speedMultiplier = 1;
      scrollBoost = 0;
      scrollBoostTarget = 0;
      ringGroup.visible = true;
      ringGroup.position.y = -80;

      for (let i = 0; i < allCoins.length; i++) {
        const coinObj = allCoins[i];
        coinObj.mesh.visible = true;
        coinObj.mesh.scale.setScalar(1);
        const angle = (i / COIN_COUNT) * Math.PI * 2;
        coinObj.angle = angle;
        coinObj.mesh.position.set(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS, 0);
        coinObj.mesh.rotation.set(Math.PI / 2, 0, angle + Math.PI / 2);
        setAllMaterialsTransparent(coinObj.mesh, false, 1);
      }
    };

    const onConverge = () => {
      if (flyoutActive) return;
      flyoutActive = true;
      flyoutStartTime = clock.getElapsedTime();
      targetSpeed = 0.1;
      exitAngles = allCoins.map((c) => c.angle);
      allCoins.forEach((c) => setAllMaterialsTransparent(c.mesh, true));
    };

    const onSpeedBoost = () => { targetSpeed = 4; };
    const onHoverPause = () => {
      hoverActive = true;
      targetSpeed = 0;
      scrollBoostTarget = 0;
    };
    const onHoverResume = () => {
      hoverActive = false;
      if (!flyoutActive && !turboActive) targetSpeed = 1;
    };
    const onTurboSpin = () => {
      turboActive = true;
      hoverActive = false;
      targetSpeed = 20;
    };
    const onFadeOut = () => {
      fadeActive = true;
      fadeStartTime = clock.getElapsedTime();
      allCoins.forEach((c) => setAllMaterialsTransparent(c.mesh, true));
    };
    const onScrollIntensity = (event: Event) => {
      if (flyoutActive || hoverActive || turboActive) return;
      const detail = (event as CustomEvent<{ intensity?: number }>).detail;
      const intensity = Math.max(0, Math.min(1, Number(detail?.intensity ?? 0)));
      scrollBoostTarget = Math.max(scrollBoostTarget, intensity * 4.2);
    };
    const onScroll = () => {
      if (flyoutActive || hoverActive || turboActive) return;
      scrollBoostTarget = Math.max(scrollBoostTarget, 2.2);
    };

    window.addEventListener("scene-converge", onConverge);
    window.addEventListener("scene-reset", resetToRing);
    window.addEventListener("scene-speed-boost", onSpeedBoost);
    window.addEventListener("scene-hover-pause", onHoverPause);
    window.addEventListener("scene-hover-resume", onHoverResume);
    window.addEventListener("scene-turbo-spin", onTurboSpin);
    window.addEventListener("scene-fade-out", onFadeOut);
    window.addEventListener("scene-scroll-intensity", onScrollIntensity as EventListener);
    window.addEventListener("scroll", onScroll, { passive: true });

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Spin coins
      if (!flyoutActive && !hoverActive && !turboActive) {
        scrollBoost += (scrollBoostTarget - scrollBoost) * 0.12;
        scrollBoostTarget *= 0.9;
      } else {
        scrollBoost *= 0.85;
      }

      const effectiveTargetSpeed = hoverActive
        ? 0
        : turboActive
          ? 20
          : flyoutActive
            ? targetSpeed
            : targetSpeed + scrollBoost;

      speedMultiplier += (effectiveTargetSpeed - speedMultiplier) * (turboActive ? 0.15 : flyoutActive ? 0.08 : 0.06);
      for (let i = 0; i < allCoins.length; i++) {
        const coinObj = allCoins[i];
        if (coinObj.mesh.parent === ringGroup) {
          coinObj.angle += 0.006 * speedMultiplier;
          const a = coinObj.angle;
          coinObj.mesh.position.set(Math.cos(a) * RING_RADIUS, Math.sin(a) * RING_RADIUS, 0);
          coinObj.mesh.rotation.z = a + Math.PI / 2;
        }
      }

      if (flyoutActive) {
        const elapsed = t - flyoutStartTime;
        const progress = Math.min(elapsed / EXIT_DURATION, 1);

        // Phase 1: Deceleration (0-0.3)
        if (progress < 0.3) {
          targetSpeed = Math.max(0.1, targetSpeed * 0.92);
        }

        // Phase 2: Drift and fade (0.2-1.0)
        const driftStart = 0.2;
        if (progress > driftStart) {
          const driftProgress = Math.min((progress - driftStart) / (1 - driftStart), 1);
          const easedDrift = easeOutCubic(driftProgress);

          for (let i = 0; i < allCoins.length; i++) {
            const coinObj = allCoins[i];
            const exitAngle = exitAngles[i] || 0;
            const driftDist = 200 * easedDrift;
            const baseX = Math.cos(coinObj.angle) * RING_RADIUS;
            const baseY = Math.sin(coinObj.angle) * RING_RADIUS;
            coinObj.mesh.position.set(
              baseX + Math.cos(exitAngle) * driftDist,
              baseY + Math.sin(exitAngle) * driftDist,
              50 * easedDrift
            );
            coinObj.mesh.scale.setScalar(1 - 0.4 * easedDrift);
            setAllMaterialsTransparent(coinObj.mesh, true, 1 - easedDrift);
          }
        }

        if (progress >= 1) {
          flyoutActive = false;
          ringGroup.visible = false;
          window.dispatchEvent(new CustomEvent("scene-converge-complete"));
        }
      } else {
        camera.position.x = -120 + Math.sin(t * 0.07) * 25;
        camera.position.y = 280 + Math.cos(t * 0.05) * 15;
        camera.lookAt(200, 0, 0);
      }

      // Fade out all coins when scene-fade-out fires
      if (fadeActive) {
        const fadeElapsed = t - fadeStartTime;
        const fadeProgress = Math.min(fadeElapsed / FADE_DURATION, 1);
        const easedFade = easeOutCubic(fadeProgress);
        for (let i = 0; i < allCoins.length; i++) {
          setAllMaterialsTransparent(allCoins[i].mesh, true, 1 - easedFade);
        }
        if (fadeProgress >= 1) {
          fadeActive = false;
          turboActive = false;
          ringGroup.visible = false;
        }
      }

      pt1.position.x = 300 + Math.sin(t * 0.3) * 150;
      pt1.position.y = 400 + Math.cos(t * 0.25) * 100;

      renderer.render(scene, camera);
    }
    animate();

    let resizeTimeout: number;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scene-converge", onConverge);
      window.removeEventListener("scene-reset", resetToRing);
      window.removeEventListener("scene-speed-boost", onSpeedBoost);
      window.removeEventListener("scene-hover-pause", onHoverPause);
      window.removeEventListener("scene-hover-resume", onHoverResume);
      window.removeEventListener("scene-turbo-spin", onTurboSpin);
      window.removeEventListener("scene-fade-out", onFadeOut);
      window.removeEventListener("scene-scroll-intensity", onScrollIntensity as EventListener);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
});

Scene3D.displayName = "Scene3D";
export default Scene3D;
