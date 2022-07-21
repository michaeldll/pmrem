import BaseScene from "./BaseScene";
import { MainContext } from "../WebGLController";
import {
    AxesHelper,
    Euler,
    GridHelper,
    Group,
    Mesh,
    MeshMatcapMaterial,
    PerspectiveCamera,
    Vector3,
} from "three";
import { OrbitControls } from "@/utils/libs/OrbitControls";

export default abstract class AbstractScene extends BaseScene {
    public name: string
    protected orbit: OrbitControls;

    constructor(context: MainContext, name: string) {
        super(context, name);
    }

    protected generateContext = () => ({
        ...this.context,
        camera: this.camera,
        scene: this.scene,
        controls: this.orbit,
    });

    protected getCamera() {
        const camera = new PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0.0, 10);

        return camera
    }

    protected setCamera(position = new Vector3(0, 0.0, 10), rotation = new Euler()) {
        this.camera = new PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.copy(position)
        this.camera.rotation.copy(rotation)

        this.onResize();
    }

    protected setOrbit(enabled = true) {
        this.orbit = new OrbitControls(
            this.camera,
            this.context.renderer.domElement
        );
        this.orbit.update();
        this.orbit.enabled = enabled;
    }

    public onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.context.renderer.setSize(width, height);
        const minimum = this.context.gpuTier.tier > 2 ? 2 : 1.5
        this.context.renderer.setPixelRatio(Math.min(minimum, window.devicePixelRatio));

        if (this.context.postprocessing) this.context.postprocessing.onResize()
    };

    protected debug() {
        this.scene.add(new AxesHelper(5));
        this.scene.add(new GridHelper());
    }

    protected debugMaterials(group: Group) {
        group.traverse((obj) => {
            // Find only Meshes
            if (obj.type !== "Mesh") return
            const mesh = obj as Mesh

            // Replace material with matcap
            mesh.material = new MeshMatcapMaterial({ matcap: this.context.textureLoader.load("assets/textures/matcap-golden.png") })
        })
    }

    public unmount() {
        console.log("unmount MainScene");
    }
}

export type AbstractSceneContext = ReturnType<AbstractScene["generateContext"]>;
