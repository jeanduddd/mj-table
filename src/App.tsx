import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
    XR,
    createXRStore,
    XROrigin,
    XRHandModel,
    PointerRayModel,
    PointerCursorModel
} from "@react-three/xr";
import * as THREE from "three";

import { LampScene } from "./scene/lampScene";
import { HoverScene } from "./scene/hoverBallsScene";
import { InsideScene } from "./scene/insideBallsScene";
import { RotatePlayer } from "./xrControls/RotatePlayer";
import { FlyPlayer } from "./xrControls/FlyPlayer";

import { HandChangedEvent } from "./events/handChangedEvent";
import { FeedbackEffectChangedEvent } from "./events/feedbackEffectChangedEvent";
import { VisualIndicationChangedEvent } from "./events/visualIndicationChangedEvent";

import "./style/App.css";

/**
 * change the color of the hand
 * @param side side of the hand
 * @param color color of the hand
 * @returns XRHand with updated material color
 */
function CustomHand({ side, color }: { side: "left" | "right"; color: string }) {
    const handRef = useRef<THREE.Group>(null!);

    useEffect(() => {
        if (handRef.current) {
            //go throught every child
            handRef.current.traverse((child) => {
                //look if it is a mesh
                if (child instanceof THREE.Mesh) {
                    if (child.material instanceof THREE.Material) {
                        //copy its mesh
                        const oldMat = child.material;
                        const newMat = oldMat.clone();
                        //change the color of the mesh
                        (newMat as THREE.MeshStandardMaterial).color.set(color);
                        //apply the mesh with the new color
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

//variables containing the current hand color, the can change
let leftHandColor = "pink";
let rightHandColor = "lightgreen";

const LeftHand = () => <CustomHand side="left" color={leftHandColor} />;
const RightHand = () => <CustomHand side="right" color={rightHandColor} />;

/*
//XRStore to apply custom hands
const store = createXRStore({
    hand: {
        left: LeftHand,
        right: RightHand,
        //rayPointer:{rayModel:{color:"blue"}}
    }
});
*/

//XRStore to get custom ray pointers
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
    //define an initial position to be in front of the table when we launch the program (only for x and z coordinates)
    const [position, setPosition] = useState(new THREE.Vector3(0, 0, -1.5));

    const xrOrigin: any = useRef(null);
    const [scene, setScene] = useState<string>("collision");

    //every informations needed to change correctly hand color
    const [feedbackEffect, setFeedbackEffect] = useState<string>("gray");
    const [visualIndication, setVisualIndication] = useState<string>("arrows");
    const [LoR, setLoR] = useState(true); //LoR = Left or Right, Left = true, Right = false
    const [targetColor, setTargetColor] = useState("red");

    /**
     * change leftHandColor and rightHandColor variables in order to change the hand color inside the scene
     * @param visualIndication string representing the current visual indication
     * @param LoR boolean representing if the ball has to be taken by the left or right hand
     * @param targetColor string representing the color of the ball that has to be taken
     */
    function updateHandsColor(visualIndication: string, LoR: boolean, targetColor: string) {
        //visual indications that use a color to show if the ball has to be taken by the left or right hand
        if (
            visualIndication === "arrows" ||
            visualIndication === "arrows1" ||
            visualIndication === "arrows2"
        ) {
            //if the ball has to be taken by the left hand, leftHandColor is set to pink and rightHandColor is set to gray
            leftHandColor = LoR ? "pink" : "gray";
            //if the ball has to be taken by the right hand, leftHandColor is set to gray and rightHandColor is set to lightgreen
            rightHandColor = LoR ? "gray" : "lightgreen";
        }
        //visual indications that use don't show whether the ball should be taken with the left or right hand
        if (
            visualIndication === "rays" ||
            visualIndication === "glow" ||
            visualIndication === "illuminated" ||
            visualIndication === "pedestal"
        ) {
            //the hand that must take the ball is colored by the color of the ball that has to be picked up
            leftHandColor = LoR ? targetColor : "gray";
            rightHandColor = LoR ? "gray" : targetColor;
        }
    }

    /**
     * recieve events that will change variables needed to set the color
     * @param event custom event containing information to set the variables needed to set the color
     */
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

    return (
        <div className="canvas-container">
            <button onClick={() => store.enterVR()}>Enter VR</button>
            <Canvas style={{ background: "skyblue" }}>
                <XR store={store}>
                    <PerspectiveCamera position={[0, 4, 10]} makeDefault />
                    <XROrigin ref={xrOrigin} position={position} />
                    <OrbitControls />
                    <XRSpaceManager scene={scene} xrOrigin={xrOrigin} />
                    {scene === "lamp" && <LampScene scene={[scene, setScene]} />}
                    {scene === "hover" && <HoverScene scene={[scene, setScene]} />}
                    {scene === "collision" && (
                        <InsideScene scene={[scene, setScene]} eventHandler={eventHandler} />
                    )}
                    <FlyPlayer xrOrigin={xrOrigin} />
                    <RotatePlayer />
                </XR>
            </Canvas>
        </div>
    );
}
