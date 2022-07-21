import { Color, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector2 } from "three"
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { AbstractSceneContext } from "../abstract/AbstractScene"
import ContextComponent from "../abstract/ContextComponent"

type Props = {
    context: AbstractSceneContext
}

// Model from : https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf
export default class Porsche extends ContextComponent<AbstractSceneContext> {
    constructor({
        context,
    }: Props) {
        super(context)
    }

    public load() {
        const URL = "assets/models/porsche_911_carrera_4s_modified.glb"

        return new Promise<GLTF>((resolve, reject) => {
            this.context.gltfLoader.load(
                URL,
                (gltf) => {
                    this.handleModel(gltf);
                    resolve(gltf);
                },

                (progress) => {
                    console.log(
                        "Loading model...",
                        100.0 * (progress.loaded / progress.total),
                        "%"
                    )
                },

                (error) => {
                    console.error(error);
                    reject(error);
                }
            );
        });
    }

    private handleModel(gltf: GLTF) {
        gltf.scene.traverse((obj) => {
            // Find only Meshes
            if (obj.type !== "Mesh") return

            // Cast as Mesh
            const mesh = obj as Mesh

            // Cast as StandardMaterial
            let material = mesh.material as MeshStandardMaterial

            // Tweak materials
            switch (material.name) {
                case "window":
                    material.roughness = 0.
                    material.opacity = 0.8
                    material.transparent = true
                    break;

                case "coat":
                    material.envMapIntensity = 3
                    material.roughness = 0.4
                    material.metalness = 1
                    break;

                case "silver":
                    material.color = new Color(0x555555)
                    material.envMapIntensity = 3
                    material.roughness = 0.3
                    material.metalness = 1
                    break;


                case "paint":
                    material.color = new Color(0x555555)
                    material.roughness = 0.5
                    material.metalness = 0.8
                    material.envMapIntensity = 2
                    break;

                case "glass":
                    material.color = new Color(0x000000)
                    material.roughness = 0.07
                    material.envMapIntensity = 2
                    break;
            }
        })
    }
}