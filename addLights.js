import { DirectionalLight } from "three";

export const addLight = () => {
    let light = new DirectionalLight(0xffffff, 1)
    light.position.set(0.5, 0.3, 1)
    return light
}

export const backLight = () => {
    let light = new DirectionalLight(0xffffff, 5)
    light.position.set(0, 1, -2)
    return light
}