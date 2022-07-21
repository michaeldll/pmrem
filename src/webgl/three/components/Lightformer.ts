import { polarToCartesian } from "@/utils/math/math"
import { Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneBufferGeometry, RingBufferGeometry, SphereBufferGeometry, Vector3 } from "three"

// Credit to https://codesandbox.io/s/building-live-envmaps-lwo219?file=/src/App.js
type Shape = "CIRCLE" | "RING" | "RECT" | "SPHERE"

const getShape = (shape: Shape) => {
    switch (shape) {
        case "CIRCLE":
            return new RingBufferGeometry(0, 1, 64)

        case "RING":
            return new RingBufferGeometry(0.5, 1, 64)

        case "RECT":
            return new PlaneBufferGeometry()

        case "SPHERE":
            return new SphereBufferGeometry()

        default:
            break;
    }
}

export class Lightformer extends Mesh {
    public material: MeshBasicMaterial

    constructor(shape: Shape, intensity = 1, color = new Color()) {
        super(getShape(shape), new MeshBasicMaterial({ color, toneMapped: false, side: DoubleSide }))

        this.material.color.multiplyScalar(intensity)
        this.userData.polarProgression = 0
    }

    private rotate(radius = 2) {
        this.userData.polarProgression += 0.01
        const [x, y] = polarToCartesian(radius, this.userData.polarProgression)
        this.position.set(x, y, 0)
    }

    public tick(lookAt = new Vector3()) {
        this.lookAt(lookAt)
        this.rotate()
    }
}