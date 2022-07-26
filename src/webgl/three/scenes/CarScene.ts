import { clamp, lerp } from "@/utils/math/math";
import { Camera, PerspectiveCamera, Scene, Texture, Vector2 } from "three";
import { FolderApi } from "tweakpane";
import AbstractScene from "../abstract/AbstractScene";
import Porsche from "../components/Porsche";
import { MainContext } from "../WebGLController";

export default class CarScene extends AbstractScene {
  private gltfCamera: PerspectiveCamera
  private onLoad: (scene: Scene, camera: Camera) => void

  constructor(context: MainContext, { onLoad }) {
    super(context, 'Car Scene')

    this.onLoad = onLoad
    this.setCamera()
    this.setOrbit()
    this.setObjects();
    this.setEvents();
    // this.debug();
  }

  private setObjects() {
    // Load and add car
    new Porsche({ context: this.generateContext() }).load().then((gltf) => {
      // Replace default camera from gltf
      this.gltfCamera = gltf.cameras.find((camera) => camera.name === "Camera_Orientation") as PerspectiveCamera
      if (this.gltfCamera) {
        this.orbit.enabled = false
        this.camera = this.gltfCamera
        // Update projection matrix
        this.onResize()
      }

      this.scene.add(gltf.scene)

      this.onLoad(this.scene, this.camera)
    })
  }

  private setEvents = () => {
    window.addEventListener("resize", this.onResize);
  };

  public removeEvents = () => {
    window.removeEventListener("resize", this.onResize)
  }

  public tick(envTexture: Texture, deltaTime: number, elapsedTime: number) {
    this.scene.environment = envTexture
  }
}