import { clamp, lerp } from "@/utils/math/math";
import { Camera, PerspectiveCamera, Scene, Texture, Vector2 } from "three";
import { FolderApi } from "tweakpane";
import AbstractScene from "../abstract/AbstractScene";
import { MouseController } from "../components/MouseController";
import Porsche from "../components/Porsche";
import { MainContext } from "../WebGLController";

export default class CarScene extends AbstractScene {
  // Needs to be public to be accessible within tweakpane
  public disableTickLookAt = false

  private gltfCamera: PerspectiveCamera
  private onLoad: (scene: Scene, camera: Camera) => void
  private lookAtCoords = new Vector2()
  private mouseController: MouseController

  constructor(context: MainContext, { onLoad }) {
    super(context, 'Car Scene')

    this.onLoad = onLoad
    this.setMouseController()
    this.setCamera()
    this.setOrbit()
    this.setObjects();
    this.setEvents();
    // this.debug();
  }

  private setMouseController() {
    this.mouseController = new MouseController(this.generateContext())
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

      this.tweaks()
      this.scene.add(gltf.scene)

      this.onLoad(this.scene, this.camera)
    })
  }

  private setEvents = () => {
    window.addEventListener("resize", this.onResize);
  };

  public removeEvents = () => {
    window.removeEventListener("resize", this.onResize)
    this.mouseController.removeEvents()
  }

  private tweaks = () => {
    const folder: FolderApi = this.context.pane.addFolder({
      title: this.scene.name,
    });

    folder.addInput(this, "disableTickLookAt", { label: "Mouse Interaction" })
  }

  private tickLookAt(deltaTime) {
    // Prevents wacky values when unfocusing the tab
    const clampedDelta = clamp(deltaTime, 0.04, 0.64)

    // Get coords
    const factor = 0.01
    this.lookAtCoords.x = lerp(
      this.lookAtCoords.x,
      this.mouseController.normalizedMousePosition.x,
      0.5 * clampedDelta
    )
    this.lookAtCoords.y = lerp(
      this.lookAtCoords.y,
      this.mouseController.normalizedMousePosition.y,
      0.5 * clampedDelta
    )

    // Camera Position
    this.camera.position.x = this.lookAtCoords.y * factor * 3
    this.camera.position.y = this.lookAtCoords.x * factor * 3

    // Camera Rotation
    this.camera.rotation.x = -1.5707962926 + this.lookAtCoords.y * factor
    this.camera.rotation.y = -(this.lookAtCoords.x * factor)

    // Scene rotation for environment map rotation
    this.scene.rotation.x = this.lookAtCoords.y * factor * 20
    this.scene.rotation.y = -(this.lookAtCoords.x * factor) * 20
  }

  public tick(envTexture: Texture, deltaTime: number, elapsedTime: number) {
    this.scene.environment = envTexture
    if (this.orbit && !this.orbit.enabled && !this.disableTickLookAt) this.tickLookAt(deltaTime)
  }
}