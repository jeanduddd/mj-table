import { useState, type SetStateAction, type Dispatch, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useXRInputSourceState } from "@react-three/xr";

import { Menu } from "../components/menu/selectMenuComponent";
import { Lamp } from "../components/tableEnvironment/lamp";
import { Ball } from "../components/tableEnvironment/balls";
import { isPinching, isPinchingMiddle } from "../utilities/handState";

import { HandChangedEvent } from "../events/handChangedEvent";
import { VisualIndicationChangedEvent } from "../events/visualIndicationChangedEvent";
import { FeedbackEffectChangedEvent } from "../events/feedbackEffectChangedEvent";

export function InsideScene({
    scene,
    eventHandler //transmit informations to the parent component
}: {
    scene: [string, Dispatch<SetStateAction<string>>];
    eventHandler: (event: Event) => void;
}) {
    const { gl } = useThree() as { gl: THREE.WebGLRenderer & { xr: any } };
    const referenceSpace = gl.xr.getReferenceSpace();

    //indicates if the user is pinching with the thumb and the middle finger
    const [pinchMiddle, setPinchMiddle] = useState(false);

    const handSourceRight = useXRInputSourceState("hand", "right");
    const right = handSourceRight?.inputSource?.hand;

    //indicate the last time the user pinched
    const [lastPinch, setLastPinch] = useState<Date | null>(null);

    useFrame((_, __, frame) => {
        //detect if the user is pinching with the thumb and the middle finger
        const pinchMiddle = isPinchingMiddle(right, frame, referenceSpace);
        setPinchMiddle(pinchMiddle);
        pinchMiddle ? setLastPinch(new Date()) : null;
        //enable or diable the feedback/indication selection menu when the user is pinching
        if (
            pinchMiddle &&
            (lastPinch == null || new Date().getTime() - lastPinch!?.getTime() > 300)
        ) {
            setShowMenu((prev) => !prev);
        }
    });

    //index of the last ball that had to be picked up
    const [lastBallIndex, setLastBallIndex] = useState(0);

    /**
     * handle behavior when a controller/hand is in contact with a ball
     * @param index index of the ball the user want to pick up
     * @param correct indicate if the ball the user wants to pick up is the correct one or not. true = correct with the correct controller,
     * false : incorrect with the left controller, null = incorrect with the right controller
     */
    function handleNear(index: number, correct: boolean | null) {
        //if the correct controller is next to the correct ball
        if (correct) {
            //set lightning in case lamp feedback is activated
            setLightning(true);
            setLastLightChange(new Date());

            //little vibration on the controller that was near the ball if the vibrate feedback is on
            if (feedbackEffect === "vibrate") {
                balls[index].LoR
                    ? leftHapticActuator?.pulse(10, 20)
                    : rightHapticActuator?.pulse(10, 20);
            }
            //reset the select variable
            if (balls[index].select === true) {
                setBalls((balls) =>
                    balls.map((b, i) => (i === index ? { ...b, select: false, LoR: null } : b))
                );

                //get a new ball index, different from the one before
                let nextBallIndex = -1;
                do {
                    nextBallIndex = Math.floor(Math.random() * 3);
                } while (nextBallIndex === lastBallIndex);
                setLastBallIndex(nextBallIndex);

                //get the hand that will have to pick up the ball
                const nextBallLoR = Math.floor(Math.random() * 2);

                //create an event and notify the parent component that the ball has changed (pass the hand that need to pick up the ball and its color)
                const event = new HandChangedEvent(
                    nextBallLoR === 0 ? false : true,
                    balls[nextBallIndex].color
                );
                eventHandler(event);

                //updates the balls variable
                setBalls((balls) =>
                    balls.map((b, i) =>
                        i === nextBallIndex
                            ? { ...b, select: true, LoR: nextBallLoR === 0 ? false : true }
                            : b
                    )
                );
            }
        }
        //if the wrong controller is next to the correct ball or any controller is next to another ball
        else {
            //set lightning in case lamp feedback is activated
            setLightning(false);
            setLastLightChange(new Date());
            //agressive vibration on the controller that was near the ball if the vibrate feedback is on
            if (feedbackEffect === "vibrate") {
                correct === false
                    ? leftHapticActuator?.pulse(25, 250)
                    : rightHapticActuator?.pulse(25, 250);
            }
        }
    }

    const leftController = useXRInputSourceState("controller", "left");
    const rightController = useXRInputSourceState("controller", "right");

    const leftHand = useXRInputSourceState("hand", "left");
    const rightHand = useXRInputSourceState("hand", "right");

    const leftHandPos = useRef<THREE.Vector3 | null>(null);
    const rightHandPos = useRef<THREE.Vector3 | null>(null);

    const leftHandRot = useRef<THREE.Quaternion | null>(null);
    const rightHandRot = useRef<THREE.Quaternion | null>(null);

    const leftHapticActuator = leftController?.inputSource.gamepad?.hapticActuators[0];
    const rightHapticActuator = rightController?.inputSource.gamepad?.hapticActuators[0];

    const leftControllerPos = useRef<THREE.Vector3 | null>(null);
    const rightControllerPos = useRef<THREE.Vector3 | null>(null);

    const leftControllerRot = useRef<THREE.Quaternion | null>(null);
    const rightControllerRot = useRef<THREE.Quaternion | null>(null);

    //used to define the light color when lamp feedback is activated
    const [lightning, setLightning] = useState<boolean | null>(null);
    const [lastLightChange, setLastLightChange] = useState<Date | null>(null);

    const [, setScene] = scene;

    //create the balls
    const [balls, setBalls] = useState([
        //name : id of the ball, color : color of the ball, select : if the ball have to be picked up
        // LoR = LeftorRight : if the ball have to be picked up with the left or the right hand, true = left, false = right, null = don't pick up
        { name: "ball1", color: "red", select: true, LoR: true },
        { name: "ball2", color: "blue", select: false, LoR: null },
        { name: "ball3", color: "yellow", select: false, LoR: null }
    ]);

    const [, forceUpdate] = useState(0);

    //indicates if the menu has to be shown
    const [showMenu, setShowMenu] = useState(false);
    const [lastX, setLastX] = useState<Date | null>(null);

    useFrame(() => {
        //check if the X button of the controller has been pressed in order to open the feedback/indication selection menu
        const buttonX = leftController?.gamepad?.["x-button"]?.button;
        if (buttonX && (lastX == null || new Date().getTime() - lastX.getTime() > 300)) {
            setLastX(new Date());
            setShowMenu((prev) => !prev);
        }

        //reset the light color after a second
        if (lastLightChange && new Date().getTime() - lastLightChange.getTime() > 1000) {
            setLightning(null);
        }

        let changed = false;

        //get left hand current world position and rotation
        if (leftHand?.object) {
            leftHand.object.updateMatrixWorld();
            const position = new THREE.Vector3();
            leftHand.object.getWorldPosition(position);

            const rotation = new THREE.Quaternion();
            leftHand.object.getWorldQuaternion(rotation);

            if (!leftHandPos.current || !leftHandPos.current.equals(position)) {
                leftHandPos.current = position.clone();
                changed = true;
            }
            if (!leftHandRot.current || !leftHandRot.current.equals(rotation)) {
                leftHandRot.current = rotation.clone();
                changed = true;
            }
        }

        //get right hand current world position and rotation
        if (rightHand?.object) {
            rightHand.object.updateMatrixWorld();
            const position = new THREE.Vector3();
            rightHand.object.getWorldPosition(position);

            const rotation = new THREE.Quaternion();
            rightHand.object.getWorldQuaternion(rotation);

            if (!rightHandPos.current || !rightHandPos.current.equals(position)) {
                rightHandPos.current = position.clone();
                changed = true;
            }
            if (!rightHandRot.current || !rightHandRot.current.equals(rotation)) {
                rightHandRot.current = rotation.clone();
                changed = true;
            }
        }

        //get left controller current world position and rotation
        if (leftController?.object) {
            leftController.object.updateMatrixWorld();
            const position = new THREE.Vector3();
            leftController.object.getWorldPosition(position);

            const rotation = new THREE.Quaternion();
            leftController.object.getWorldQuaternion(rotation);

            if (!leftControllerPos.current || !leftControllerPos.current.equals(position)) {
                leftControllerPos.current = position.clone();
                changed = true;
            }
            if (!leftControllerRot.current || !leftControllerRot.current.equals(rotation)) {
                leftControllerRot.current = rotation.clone();
                changed = true;
            }
        }

        //get right controller current world position and rotation
        if (rightController?.object) {
            rightController.object.updateMatrixWorld();
            const position = new THREE.Vector3();
            rightController.object.getWorldPosition(position);

            const rotation = new THREE.Quaternion();
            rightController.object.getWorldQuaternion(rotation);

            if (!rightControllerPos.current || !rightControllerPos.current.equals(position)) {
                rightControllerPos.current = position.clone();
                changed = true;
            }
            if (!rightControllerRot.current || !rightControllerRot.current.equals(rotation)) {
                rightControllerRot.current = rotation.clone();
                changed = true;
            }
        }
        if (changed) {
            forceUpdate((n) => n + 1);
        }
    });

    //define the current feedback/indication when we start the program
    const [feedbackEffect, setFeedbackEffect] = useState("gray");
    const [visualIndication, setVisualIndication] = useState("arrows");

    //create an event and notify the parent component that the visual indication has changed
    useEffect(() => {
        const event = new VisualIndicationChangedEvent(visualIndication);
        eventHandler(event);
    }, [visualIndication]);

    //create an event and notify the parent component that the feedback effect has changed
    useEffect(() => {
        const event = new FeedbackEffectChangedEvent(feedbackEffect);
        eventHandler(event);
    }, [feedbackEffect]);

    //get the user camera
    const { camera } = useThree();
    const [cameraPosition, setCameraPosition] = useState(camera.position);

    //get camera position
    useFrame(() => {
        const position = new THREE.Vector3();
        camera.getWorldPosition(position);
        setCameraPosition(position);

        menuRef.current?.position.copy(camera.position);
        menuRef.current?.rotation.copy(camera.rotation);

        const offset = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2);
        menuRef.current?.position.add(offset);
    });

    const menuRef = useRef<THREE.Group>(null);

    return (
        <>
            {/*display the ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[10, 10]}></planeGeometry>
                <meshStandardMaterial side={THREE.DoubleSide}></meshStandardMaterial>
            </mesh>
            {/*display either the menu at the same height of the player or the table with the balls */}
            {showMenu ? (
                <>
                    <group position={[0, cameraPosition.y, -3]} scale={0.5}>
                        <Menu
                            feedbackEffect={feedbackEffect}
                            setFeedbackEffect={setFeedbackEffect}
                            visualIndication={visualIndication}
                            setVisualIndication={setVisualIndication}
                        ></Menu>
                    </group>
                    <group>
                        <ambientLight intensity={0.7} />
                        <pointLight
                            position={[0, 5, 0]}
                            color="white"
                            intensity={10}
                            distance={15}
                        ></pointLight>
                    </group>
                </>
            ) : (
                <>
                    {feedbackEffect === "lamps" ? (
                        <group scale={0.5} position={[0, 3, -2]}>
                            <group position={[5, 0, 0]} rotation={[-Math.PI / 2, Math.PI / 4, 0]}>
                                <Lamp light={lightning}></Lamp>
                            </group>
                            <group position={[-5, 0, 0]} rotation={[-Math.PI / 2, -Math.PI / 4, 0]}>
                                <Lamp light={lightning}></Lamp>
                            </group>
                            <ambientLight intensity={0.3} />
                        </group>
                    ) : (
                        <group>
                            <ambientLight intensity={0.7} />
                            <pointLight
                                position={[0, 5, 0]}
                                color="white"
                                intensity={10}
                                distance={15}
                            ></pointLight>
                        </group>
                    )}

                    <mesh position={[0, 0, -2]}>
                        <boxGeometry args={[1.5, 1, 0.5]} />
                        <meshStandardMaterial></meshStandardMaterial>

                        {balls.map((value, index) => (
                            <Ball
                                key={value.name}
                                value={value}
                                index={index}
                                rightControllerPos={
                                    rightHand ? rightHandPos.current : rightControllerPos.current
                                }
                                leftControllerPos={
                                    leftHand ? leftHandPos.current : leftControllerPos.current
                                }
                                onNear={(correct: boolean | null) => handleNear(index, correct)}
                                visualIndication={visualIndication}
                                feedbackEffect={feedbackEffect}
                            />
                        ))}
                    </mesh>
                </>
            )}
        </>
    );
}
