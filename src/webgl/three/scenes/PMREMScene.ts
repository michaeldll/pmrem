import { Euler, Group, PerspectiveCamera, Vector3 } from "three";
import { FolderApi } from "tweakpane";
import AbstractScene from "../abstract/AbstractScene";
import { Lightformer } from "../components/Lightformer";
import Porsche from "../components/Porsche";
import { MainContext } from "../WebGLController";

// Credit to https://codesandbox.io/s/building-live-envmaps-lwo219?file=/src/App.js
export default class PMREMScene extends AbstractScene {
  private activeSceneObjects: { spots: Group }

  constructor(context: MainContext) {
    super(context, 'PMREM Scene')

    this.setCamera(new Vector3(9.9, 3.4, 13.09), new Euler(-.275, 0.64, 0.168));
    this.setOrbit(false)
    this.setObjects()
    this.setEvents();

    // this.debug();
    this.tweaks()
  }

  private setObjects() {
    new Porsche({ context: this.generateContext() }).load().then((gltf) => {
      // Get fov from GLTF Camera
      const gltfCamera = gltf.cameras.find((camera) => camera.name === "Camera_Orientation") as PerspectiveCamera
      if (gltfCamera) {
        this.camera.fov = gltfCamera.fov
        // Update projection matrix
        this.onResize()
      }

      // Useful to position lights around car
      // this.debugMaterials(gltf.scene)
      // this.scene.add(gltf.scene)
    })

    // Left side
    const leftPlane = new Lightformer("RECT", 6)
    leftPlane.rotation.y = Math.PI / 2
    leftPlane.position.set(-5, 1, -1)
    leftPlane.scale.set(20, .1, 1)
    this.scene.add(leftPlane)

    // Moving spots
    const spots = this.getSpots()
    this.scene.add(spots)

    this.activeSceneObjects = { spots }
  }

  private getSpots = () => {
    const group = new Group()
    const positions = [2, 0,]
    group.rotation.set(0, 0.5, 0)

    for (let index = 0; index < positions.length; index++) {
      const position = positions[index];
      const lightformer = new Lightformer("CIRCLE", 1)
      lightformer.rotation.x = Math.PI / 2
      lightformer.position.set(position, 2.2, index * 4)
      lightformer.scale.x = 3
      group.add(lightformer)
    }

    return group
  }

  private setEvents = () => {
    window.addEventListener("resize", this.onResize);
  };

  public removeEvents = () => {
    window.removeEventListener("resize", this.onResize)
  }

  private tweaks = () => {
    const folder: FolderApi = this.context.pane.addFolder({
      title: this.scene.name,
    });

    folder.addInput(this.orbit, "enabled", { label: "Toggle orbit" });

    folder.addInput(this.camera, "position", { label: "Camera Position" });
    folder.addInput(this.camera, "rotation", { label: "Camera Rotation" });
  }

  public tick(deltaTime, elapsedTime) {
    const { spots } = this.activeSceneObjects
    spots.position.z = Math.sin(elapsedTime * Math.PI * 0.2) * 10. - 1
  }
}
