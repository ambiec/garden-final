import { 
    BoxGeometry, 
    MeshBasicMaterial, 
    MeshStandardMaterial, 
    Mesh, 
    PlaneGeometry,
    TextureLoader 
} from "three";

const tLoader = new TextureLoader()

export const addBackground = () => {
    const backgroundGeometry = new PlaneGeometry(20, 16, 100, 100) //width, height, width segments, height segments
    const backgroundMaterial = new MeshStandardMaterial({
        map: tLoader.load('meadow.png'),
        // emissive: 0xffffff,
        // emissiveIntensity: 0.1
    })
    const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial)
    backgroundMesh.position.set(0, 0, -3)
    return backgroundMesh
}

export const addBoilerPlateMeshes = () => {
    const box = new BoxGeometry(1, 1, 1)
    const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 })
    const boxMesh = new Mesh(box, boxMaterial)
    boxMesh.position.set(-2, 0, 0)
    return boxMesh
}

export const addStandardMesh = () => {
    const box = new BoxGeometry(1, 1, 1)
    const boxMaterial = new MeshStandardMaterial({ color: 0x00ff00 })
    const boxMesh = new Mesh(box, boxMaterial)
    boxMesh.position.set(2, 0, 0)
    return boxMesh
}

