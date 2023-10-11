import { ACESFilmicToneMapping, Clock, Mesh, MeshStandardMaterial, PMREMGenerator, Raycaster, sRGBEncoding, Texture, TextureLoader, Vector2, WebGLRenderer } from "three";
import { Pane } from "tweakpane";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { isTouchDevice } from "../../utils/misc/misc";
import FramerateManager from "@/utils/perf/FramerateManager";
import CarScene from "./scenes/CarScene";
import { TierResult } from 'detect-gpu';
import VirtualScroll from 'virtual-scroll'
import PMREMScene from "./scenes/PMREMScene";
import CustomPostProcessing from "./components/CustomPostProcessing";

export default class WebGLController {
  public carScene: CarScene;
  public pmremScene: PMREMScene;

  private clock = new Clock();
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private postprocessing: CustomPostProcessing
  private pane = new Pane()
  private framerateManager: FramerateManager;
  private gpuTier: TierResult
  private pmremGenerator: PMREMGenerator
  private envTexture: Texture

  constructor(canvas: HTMLCanvasElement, gpuTier: TierResult) {
    this.canvas = canvas;
    this.gpuTier = gpuTier

    this.setRenderer();

    this.framerateManager = new FramerateManager({ targetFPS: 57 });

    this.pmremGenerator = new PMREMGenerator(this.renderer)
    this.pmremScene = new PMREMScene(this.generateContext());

    this.postprocessing = new CustomPostProcessing(this.generateContext(), this.renderer.getDrawingBufferSize(new Vector2()))

    this.carScene = new CarScene(this.generateContext(), {
      onLoad: () => {
        this.tweaks()
        document.body.dispatchEvent(new Event('loaded'))
      }
    });
  }

  public setRenderer = (antialias = false) => {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      antialias,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.toneMapping = ACESFilmicToneMapping
  };

  public generateContext = () => ({
    renderer: this.renderer,
    clock: this.clock,
    textureLoader: new TextureLoader(),
    raycaster: new Raycaster(),
    pane: this.pane,
    isTouchDevice: isTouchDevice(),
    gltfLoader: new GLTFLoader(),
    postprocessing: this.postprocessing,
    scroller: new VirtualScroll({
      useKeyboard: false,
    }),
    gpuTier: this.gpuTier,
    pmremGenerator: this.pmremGenerator
  });

  private tweaks = () => {
    this.framerateManager && this.framerateManager.tweaks(this.pane);

    this.postprocessing.tweaks()
  }

  public tick = () => {
    const deltaTime = this.clock.getDelta()
    const elapsedTime = this.clock.elapsedTime

    // Update scenes
    this.envTexture = this.pmremGenerator.fromScene(this.pmremScene.scene).texture
    this.carScene.tick(this.envTexture, deltaTime, elapsedTime);
    this.pmremScene.tick(deltaTime, elapsedTime)

    // Update postprocessing
    this.postprocessing.renderPass(this.carScene.scene, this.carScene.camera, "fboA")
    // Only render PMREM scene when needed
    if (this.postprocessing.visibleFbo === "fboB") this.postprocessing.renderPass(this.pmremScene.scene, this.pmremScene.camera, "fboB")
    this.postprocessing.renderToScreen()

    this.framerateManager && this.framerateManager.tick(deltaTime);

    // Warning: costly
    // this.pane.refresh()
  };

  public unmount = () => {
    // Clear geometries and materials
    this.carScene.scene.traverse((obj) => {
      if (obj.type === "Mesh") {
        const mesh = obj as Mesh
        const material = mesh.material as MeshStandardMaterial
        mesh.geometry.dispose()
        material.dispose()
      }
    })

    // Remove events
    this.carScene.removeEvents()
    this.pmremScene.removeEvents()

    this.postprocessing.dispose()

    this.pane.dispose()
  };
}

export type MainContext = ReturnType<WebGLController["generateContext"]>;
