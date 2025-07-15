import { useState, type SetStateAction, type Dispatch, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TeleportTarget, useXRInputSourceState } from "@react-three/xr";
import { Menu } from "../components/menu/selectMenuComponent";
import { Lamp } from "../components/tableEnvironment/lamp";
import { Ball } from "../components/tableEnvironment/balls";
import { isPinching, isPinchingMiddle } from "../utilities/handState";
import { HandChangedEvent } from "../events/handChangedEvent";
import { VisualIndicationChangedEvent } from "../events/visualIndicationChangedEvent";
import { FeedbackEffectChangedEvent } from "../events/feedbackEffectChangedEvent";

export function InsideScene({
    scene,
    eventHandler
}: /*onTeleport*/
{
    scene: [string, Dispatch<SetStateAction<string>>];
    eventHandler: (event: Event) => void;
    /*onTeleport: Dispatch<SetStateAction<THREE.Vector3>>;*/
}) {
    const { gl } = useThree() as { gl: THREE.WebGLRenderer & { xr: any } };
    const referenceSpace = gl.xr.getReferenceSpace();

    const [pinchMiddle, setPinchMiddle] = useState(false);

    const handSourceRight = useXRInputSourceState("hand", "right");
    const right = handSourceRight?.inputSource?.hand;

    const [lastPinch, setLastPinch] = useState<Date | null>(null);

    useFrame((_, __, frame) => {
        const pinchMiddle = isPinchingMiddle(right, frame, referenceSpace);
        setPinchMiddle(pinchMiddle);
        pinchMiddle ? setLastPinch(new Date()) : null;
        if (
            pinchMiddle &&
            (lastPinch == null || new Date().getTime() - lastPinch!?.getTime() > 300)
        ) {
            setShowMenu((prev) => !prev);
        }
    });

    const [lastBallIndex, setLastBallIndex] = useState(0);

    function handleNear(index: number, correct: boolean | null) {
        if (correct) {
            setLightning(true);
            setLastLightChange(new Date());
            if (feedbackEffect === "vibrate") {
                balls[index].LoR
                    ? leftHapticActuator?.pulse(10, 20)
                    : rightHapticActuator?.pulse(10, 20);
            }
            if (balls[index].select === true) {
                setBalls((balls) =>
                    balls.map((b, i) => (i === index ? { ...b, select: false, LoR: null } : b))
                );
                let nextBallIndex = -1;

                do {
                    nextBallIndex = Math.floor(Math.random() * 3);
                } while (nextBallIndex === lastBallIndex);
                setLastBallIndex(nextBallIndex);

                const nextBallLoR = Math.floor(Math.random() * 2);

                const event = new HandChangedEvent(
                    nextBallLoR === 0 ? false : true,
                    balls[nextBallIndex].color
                );
                eventHandler(event);

                setBalls((balls) =>
                    balls.map((b, i) =>
                        i === nextBallIndex
                            ? { ...b, select: true, LoR: nextBallLoR === 0 ? false : true }
                            : b
                    )
                );
            }
        } else {
            setLightning(false);
            setLastLightChange(new Date());
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

    //const leftHandM = leftHand?.inputSource.hand.get("middle-finger-metacarpal")

    //const leftHandMetacarpal = leftHand?.inputSource.hand.MIDDLE_METACARPAL;

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

    const [lightning, setLightning] = useState<boolean | null>(null);
    const [lastLightChange, setLastLightChange] = useState<Date | null>(null);

    const [, setScene] = scene;

    const [balls, setBalls] = useState([
        { name: "ball1", color: "red", select: true, LoR: true },
        { name: "ball2", color: "blue", select: false, LoR: null },
        { name: "ball3", color: "yellow", select: false, LoR: null }
    ]);

    const [, forceUpdate] = useState(0);

    const [showMenu, setShowMenu] = useState(false);
    const [lastX, setLastX] = useState<Date | null>(null);

    useFrame(() => {
        const buttonX = leftController?.gamepad?.["x-button"]?.button;
        if (buttonX && (lastX == null || new Date().getTime() - lastX.getTime() > 300)) {
            setLastX(new Date());
            setShowMenu((prev) => !prev);
        }

        if (lastLightChange && new Date().getTime() - lastLightChange.getTime() > 1000) {
            setLightning(null);
        }
        let changed = false;
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

    const [feedbackEffect, setFeedbackEffect] = useState("gray");
    const [visualIndication, setVisualIndication] = useState("arrows");

    useEffect(() => {
        const event = new VisualIndicationChangedEvent(visualIndication);
        eventHandler(event);
    }, [visualIndication]);

    useEffect(() => {
        const event = new FeedbackEffectChangedEvent(feedbackEffect);
        eventHandler(event);
    }, [feedbackEffect]);

    const { camera } = useThree();
    const [cameraPosition, setCameraPosition] = useState(camera.position);
    const [cameraDirection, setCameraDirection] = useState(camera.position);
    const [cameraQuaternion, setCameraQuaternion] = useState(camera.quaternion);

    const [menuPos, setMenuPos] = useState(camera.position);

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
            {/*<TeleportTarget onTeleport={onTeleport}>*/}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[10, 10]}></planeGeometry>
                <meshStandardMaterial side={THREE.DoubleSide}></meshStandardMaterial>
            </mesh>
            {/*</TeleportTarget>*/}
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
