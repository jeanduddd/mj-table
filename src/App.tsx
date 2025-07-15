import { PointerRayModel, XR } from "@react-three/xr";
import { createXRStore, XROrigin } from "@react-three/xr";
import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { XRHandModel } from "@react-three/xr";
import { LampScene } from "./scene/lampScene";
import { HoverScene } from "./scene/hoverBallsScene";
import { InsideScene } from "./scene/insideBallsSceneRemake";
import { RotatePlayer } from "./xrControls/RotatePlayer";
import { FlyPlayer } from "./xrControls/FlyPlayer";
import { MovePlayer } from "./xrControls/MovePlayer";
import * as THREE from "three";
import "./style/App.css";
import { HandChangedEvent } from "./events/handChangedEvent";
import { FeedbackEffectChangedEvent } from "./events/feedbackEffectChangedEvent";
import { VisualIndicationChangedEvent } from "./events/visualIndicationChangedEvent";

/*
const store = createXRStore({
    hand: { teleportPointer: true},
    controller: { teleportPointer: true }
});
*/

function CustomHand({ side, color }: { side: "left" | "right"; color: string }) {
    const handRef = useRef<THREE.Group>(null!);

    useEffect(() => {
        if (handRef.current) {
            handRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.material instanceof THREE.Material) {
                        const oldMat = child.material;
                        const newMat = oldMat.clone();
                        (newMat as THREE.MeshStandardMaterial).color.set(color);
                        child.material = newMat;
                    }
                }
            });
        }
    }, [color]);

    return (
        <>
            <XRHandModel ref={handRef}></XRHandModel>
            {/*<PointerRayModel pointer={}></PointerRayModel>*/}
        </>
    );
}

let leftHandColor = "pink";
let rightHandColor = "lightgreen";

const LeftHand = () => <CustomHand side="left" color={leftHandColor} />;
const RightHand = () => <CustomHand side="right" color={rightHandColor} />;

/*
const store = createXRStore({
    hand: {
        left: LeftHand,
        right: RightHand,
        //rayPointer:{rayModel:{color:"blue"}}
    }
});
*/
const store = createXRStore({ hand: { rayPointer: { rayModel: { color: "red" } } } });


function XRSpaceManager({ scene, xrOrigin }: { scene: string; xrOrigin: React.RefObject<any> }) {
    const { gl } = useThree() as { gl: THREE.WebGLRenderer & { xr: any } };
    const initialReferenceSpace = useRef<XRReferenceSpace | null>(null);
    const isInitialized = useRef(false);
    const lastScene = useRef(scene);

    // save initial reference space
    useFrame(() => {
        if (!isInitialized.current && gl.xr.isPresenting) {
            const currentReferenceSpace = gl.xr.getReferenceSpace();
            if (currentReferenceSpace) {
                initialReferenceSpace.current = currentReferenceSpace;
                isInitialized.current = true;
            }
        }
    });

    useEffect(() => {
        if (lastScene.current !== scene && isInitialized.current) {
            if (initialReferenceSpace.current && gl.xr.isPresenting) {
                try {
                    gl.xr.setReferenceSpace(initialReferenceSpace.current);
                } catch (e) {
                    console.warn("Error during reference space change", e);
                }
            }

            if (xrOrigin.current) {
                xrOrigin.current.position.set(0, 0, 0);
            }

            lastScene.current = scene;
        }
    }, [scene, gl, xrOrigin]);

    return null;
}

export default function App() {
    const [position, setPosition] = useState(new THREE.Vector3(0, 0, -1.5));

    const xrOrigin: any = useRef(null);
    const [scene, setScene] = useState<string>("collision");

    const [feedbackEffect, setFeedbackEffect] = useState<string>("gray");
    const [visualIndication, setVisualIndication] = useState<string>("arrows");
    const [LoR, setLoR] = useState(true);
    const [targetColor, setTargetColor] = useState("red");

    function updateHandsColor(visualIndication: string, LoR: boolean, targetColor: string) {
        if (
            visualIndication === "arrows" ||
            visualIndication === "arrows1" ||
            visualIndication === "arrows2"
        ) {
            leftHandColor = LoR ? "pink" : "gray";
            rightHandColor = LoR ? "gray" : "lightgreen";
        }
        if (
            visualIndication === "rays" ||
            visualIndication === "glow" ||
            visualIndication === "illuminated" ||
            visualIndication === "pedestal"
        ) {
            leftHandColor = LoR ? targetColor : "gray";
            rightHandColor = LoR ? "gray" : targetColor;
        }
    }

    function eventHandler(event: Event) {
        if (event instanceof HandChangedEvent) {
            const eventLoR = event.getLoR();
            const eventTargetColor = event.getTargetColor();

            updateHandsColor(visualIndication, eventLoR, eventTargetColor);

            setLoR(event.getLoR());
            setTargetColor(event.getTargetColor());
        }
        if (event instanceof FeedbackEffectChangedEvent) {
            //const eventFeedback=event.getFeedbackEffect()
            setFeedbackEffect(event.getFeedbackEffect());
        }
        if (event instanceof VisualIndicationChangedEvent) {
            const eventVisual = event.getvisualIndication();

            updateHandsColor(eventVisual, LoR, targetColor);

            setVisualIndication(event.getvisualIndication());
        }
    }

    //useEffect(()=>{updateHandsColor(visualIndication,LoR,targetColor)},[])
    /*{ name: "arrows indication", setName: "arrows", selected: false },
        { name: "oriented arrows 1", setName: "arrows1", selected: false },
        { name: "oriented arrows 2", setName: "arrows2", selected: false },
        //{ name: "mouvement", setName: "mouvement", selected: false },
        { name: "rays indication", setName: "rays", selected: false },
        { name: "glow indication", setName: "glow", selected: false },
        { name: "illuminated", setName: "illuminated", selected: false },
        { name: "pedestal", setName: "pedestal", selected: false } */

    /*        { name: "lamps", setName: "lamps", selected: false },
        { name: "gray balls", setName: "gray", selected: false },
        { name: "disable balls", setName: "disable", selected: false },
        { name: "vibration", setName: "vibrate", selected: false } */

    return (
        <div className="canvas-container">
            <button onClick={() => store.enterVR()}>Enter VR</button>
            <Canvas style={{ background: "skyblue" }}>
                <XR store={store}>
                    <PerspectiveCamera position={[0, 4, 10]} makeDefault />
                    <XROrigin ref={xrOrigin} position={position} />
                    <OrbitControls />
                    <XRSpaceManager scene={scene} xrOrigin={xrOrigin} />
                    {scene === "lamp" && (
                        <LampScene scene={[scene, setScene]} /*onTeleport={setPosition}*/ />
                    )}
                    {scene === "hover" && (
                        <HoverScene scene={[scene, setScene]} /*onTeleport={setPosition} */ />
                    )}
                    {scene === "collision" && (
                        <InsideScene
                            scene={[scene, setScene]}
                            eventHandler={eventHandler} /*onTeleport={setPosition}*/
                        />
                    )}
                    {/*<MovePlayer xrOrigin={xrOrigin} />*/}
                    <FlyPlayer xrOrigin={xrOrigin} />
                    <RotatePlayer />
                </XR>
            </Canvas>
        </div>
    );
}
