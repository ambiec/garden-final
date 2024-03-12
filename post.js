import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
//optional
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'


export function post(scene, camera, renderer) {
    //
    const composer = new EffectComposer(renderer)
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(window.innerWidth, window.innerHeight)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomComposer = new EffectComposer(renderer)
    bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    bloomComposer.setSize(window.innerWidth, window.innerHeight)

    const bloomRenderPass = new RenderPass(scene, camera)
    bloomComposer.addPass(bloomRenderPass)

    const bloomPass = new UnrealBloomPass()
    bloomPass.strength = 0.1
    bloomPass.radius = 1
    bloomPass.threshold = 0.4
    bloomComposer.addPass(bloomPass)
    bloomComposer.renderToScreen = false

    const afterimagePass = new AfterimagePass()
    afterimagePass.uniforms.damp.value = 0.20
    composer.addPass(afterimagePass)

    const mixPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: {value: null},
                bloomTexture: {value: bloomComposer.renderTarget2.texture}
                },
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent
        }), 'baseTexture'
    );

    const outputPass = new OutputPass()
    composer.addPass(outputPass)
    composer.addPass(mixPass)



    const bloomOutputPass = new OutputPass()
    // bloomComposer.addPass(bloomOutputPass)

    return { composer: composer, bloomComposer: bloomComposer, after: afterimagePass, bloom: bloomPass }
}