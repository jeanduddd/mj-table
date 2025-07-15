import { useState, type SetStateAction, type Dispatch, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TeleportTarget, useXRInputSourceState } from "@react-three/xr";
import { Line } from "@react-three/drei";
import { Menu } from "../components/menu/selectMenuComponent";

function Fleche({ color, position }: { color: string; position: THREE.Vector3 }) {
    const triangle = new THREE.Shape();
    const x = 0;
    const y = 0;
    triangle.moveTo(x, y);
    triangle.lineTo(x + 0.5, y + 1);
    triangle.lineTo(x - 0.5, y + 1);
    triangle.lineTo(x, y);

    const rectangle = new THREE.Shape();
    rectangle.moveTo(0, 0);
    rectangle.lineTo(x + 0.25, y);
    rectangle.lineTo(x + 0.25, y + 1);
    rectangle.lineTo(x - 0.25, y + 1);
    rectangle.lineTo(x - 0.25, y);
    rectangle.lineTo(x, y);

    const { camera } = useThree();
    const [cameraPosition, setCameraPosition] = useState(camera.position);

    const angle = useRef(0);

    const [height, setHeight] = useState(0.2);

    useEffect(() => {
        const cameraFlat = new THREE.Vector3(cameraPosition.x, 0, cameraPosition.z);
        const flecheFlat = new THREE.Vector3(position.x, 0, position.z);
        const dirToCamera = cameraFlat.clone().sub(flecheFlat).normalize();
        angle.current = Math.atan2(dirToCamera.x, dirToCamera.z);
        //console.log(radToDeg(angle.current));
        //console.log(position)
    }, [cameraPosition]);

    useFrame(() => {
        setHeight(0.2 + Math.abs(Math.sin(Date.now() * 0.002)) * 0.05);

        camera.updateMatrixWorld();
        const position = new THREE.Vector3();
        camera.getWorldPosition(position);
        setCameraPosition(position);
        //setCameraPosition(camera.position)
        //console.log(camera.position)

        // console.log(camera.quaternion)

        //console.log(cameraPosition.angleTo(position.add(new THREE.Vector3(0, 0.25, 0))));
    });

    return (
        <group scale={0.1} position={[0, height, 0]} rotation={[0, angle.current, 0]}>
            <mesh position={[0, 1, 0]}>
                <shapeGeometry args={[rectangle]}></shapeGeometry>
                <meshStandardMaterial color={color} side={THREE.DoubleSide}></meshStandardMaterial>
            </mesh>
            <mesh>
                <shapeGeometry args={[triangle]}></shapeGeometry>
                <meshStandardMaterial color={color} side={THREE.DoubleSide}></meshStandardMaterial>
            </mesh>
        </group>
    );

    /*(

        const shape = new THREE.Shape();
    const x=0
    const y=0
    shape.moveTo(x,y)
    shape.lineTo(x+0.5,y+1)
    shape.lineTo(x-0.5,y+1)
    shape.lineTo(x,y)

    return  (
        <mesh>
            <shapeGeometry args={[shape]}></shapeGeometry>
            <meshStandardMaterial color={color}></meshStandardMaterial>
        </mesh>
    )
    
        <>
            <group position={[0, 0.5, 0]} scale={0.1}>
                <mesh position={[0, 2, 0]}>
                    
                    <cylinderGeometry args={[1, 1, 3, 12]}></cylinderGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
                <mesh rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[2, 1.5, 16]}></coneGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
            </group>
        </>
    );*/
}

function Boule({
    value,
    index,
    rightControllerPos,
    leftControllerPos,
    onNear,
    visualIndication,
    feedbackEffect
}: {
    value: { name: string; color: string; select: boolean; LoR: boolean | null };
    index: number;
    rightControllerPos: THREE.Vector3 | null;
    leftControllerPos: THREE.Vector3 | null;
    onNear: (correct: boolean | null) => void;
    visualIndication: string;
    feedbackEffect: string;
}) {
    const [height, setHeight] = useState(0.7);
    const spherePos = new THREE.Vector3(index * 0.35 - 0.35, height, -2);
    const rightIsNear = rightControllerPos && rightControllerPos.distanceTo(spherePos) < 0.15;
    const leftIsNear = leftControllerPos && leftControllerPos.distanceTo(spherePos) < 0.15;
    const [wasNear, setWasNear] = useState(false);
    const [wasCorrect, setWasCorrect] = useState(false);

    const [disable, setDisable] = useState(false);
    const [lastDisabled, setLastDisabled] = useState<Date | null>(null);

    useEffect(() => {
        if ((leftIsNear || rightIsNear) && !wasNear) {
            setWasNear(true);

            if (leftIsNear && value.LoR === true) {
                onNear(true);
                setWasCorrect(true);
                setDisable(true);
                setLastDisabled(new Date());
            } else if (leftIsNear && (value.LoR === null || value.LoR === false)) {
                onNear(false);
            }
            if (rightIsNear && value.LoR === false) {
                onNear(true);
                setWasCorrect(true);
                setDisable(true);
                setLastDisabled(new Date());
            }
            if (rightIsNear && (value.LoR === null || value.LoR === true)) {
                onNear(null);
            }
        } else if (!(leftIsNear || rightIsNear) && wasNear) {
            setWasNear(false);
            setWasCorrect(false);
        }
    }, [rightIsNear, leftIsNear, wasNear, wasCorrect]);

    const [points, setPoints] = useState<[THREE.Vector3, THREE.Vector3]>();

    useFrame(() => {
        if (lastDisabled && new Date().getTime() - lastDisabled.getTime() > 1000) {
            setDisable(false);
            setLastDisabled(new Date());
        }
        if (visualIndication === "mouvement" && value.select === true) {
            setHeight(0.7 + Math.abs(Math.sin(Date.now() * 0.002)) * 0.3);
        }
        if (!value.select) {
            setHeight(0.7);
        }
        if (leftControllerPos && rightControllerPos) {
            value.select
                ? setPoints([
                      spherePos.clone().add(new THREE.Vector3(0, 0, 2)),
                      value.LoR
                          ? leftControllerPos.clone().add(new THREE.Vector3(0, 0, 2))
                          : rightControllerPos.clone().add(new THREE.Vector3(0, 0, 2))
                  ])
                : null;
        }

        if (visualIndication !== "mouvement") {
            setHeight(0.65);
        }
    });

    if (feedbackEffect === "disable") {
        if (disable) {
            return null;
        }
    }

    return (
        <>
            {value.select && points && visualIndication === "rays" ? (
                <mesh>
                    <Line points={points} lineWidth={10} color={value.color}></Line>
                </mesh>
            ) : null}
            {/* l'activer aussi pour les autres indications qui se sont pas claire pour gauche droite. avec la couleur de gauche droite */}
            {value.select &&
            points &&
            (visualIndication === "mouvement" || visualIndication === "glow") ? (
                <mesh>
                    <Line
                        points={points}
                        lineWidth={10}
                        color={value.LoR ? "#e43e6f" : "#1ec71e"}
                    ></Line>
                </mesh>
            ) : null}
            {visualIndication !== "illuminated" ? (
                <mesh position={[index * 0.35 - 0.35, height, 0]}>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    {feedbackEffect === "gray" ? (
                        <meshStandardMaterial
                            color={
                                leftIsNear || rightIsNear
                                    ? wasCorrect
                                        ? value.color
                                        : "gray"
                                    : value.color
                            }
                        />
                    ) : (
                        <meshStandardMaterial color={value.color}></meshStandardMaterial>
                    )}
                    {visualIndication === "arrows" ? (
                        <>
                            {value.select ? (
                                <Fleche
                                    color={value.LoR ? "pink" : "lightgreen"}
                                    position={spherePos}
                                />
                            ) : null}
                        </>
                    ) : null}
                </mesh>
            ) : null}

            {value.select && visualIndication === "glow" ? (
                <>
                    <mesh position={spherePos.clone().add(new THREE.Vector3(0, 0, 2))}>
                        <sphereGeometry args={[0.15, 32, 32]} />
                        <meshStandardMaterial
                            emissive={value.color}
                            emissiveIntensity={2.5}
                            color={value.color}
                            transparent
                            opacity={0.8}
                        />
                    </mesh>
                    <mesh position={spherePos.clone().add(new THREE.Vector3(0, 0, 2))}>
                        <sphereGeometry args={[0.15, 32, 32]} />
                        <meshStandardMaterial
                            wireframe={true}
                            color={value.color}
                            transparent
                            opacity={0.5}
                        ></meshStandardMaterial>
                    </mesh>
                </>
            ) : null}
            {value.select && visualIndication === "illuminated" ? (
                <>
                    <group position={spherePos.clone().add(new THREE.Vector3(0, 0, 2))}>
                        <mesh>
                            <sphereGeometry args={[0.15, 32, 32]} />
                            {feedbackEffect === "gray" ? (
                                <meshPhysicalMaterial
                                    transmission={1}
                                    transparent
                                    opacity={0.7}
                                    color={
                                        leftIsNear || rightIsNear
                                            ? wasCorrect
                                                ? value.color
                                                : "gray"
                                            : value.color
                                    }
                                    side={THREE.FrontSide}
                                    ior={10}
                                ></meshPhysicalMaterial>
                            ) : (
                                <meshPhysicalMaterial
                                    transmission={1}
                                    transparent
                                    opacity={0.7}
                                    color={value.color}
                                    side={THREE.FrontSide}
                                    ior={10}
                                ></meshPhysicalMaterial>
                            )}
                        </mesh>
                        <mesh position={[0, 0, -0.025]}>
                            <sphereGeometry args={[0.01, 32, 32]}></sphereGeometry>
                            <meshStandardMaterial color={"white"}></meshStandardMaterial>
                        </mesh>
                        <pointLight color={value.color} intensity={1} distance={0.25}></pointLight>
                    </group>

                    {/* 



                    <group position={spherePos.clone().add(new THREE.Vector3(0, 0, 2))}>
                        <mesh>
                            <sphereGeometry args={[0.15, 32, 32]} />
                            <meshStandardMaterial
                                color={value.color}
                                transparent={true}
                                opacity={0.0}
                            />
                        </mesh>
                        <mesh>
                            <sphereGeometry args={[0.155, 32, 32]}></sphereGeometry>
                            <meshStandardMaterial
                                side={THREE.BackSide}
                                color={value.color}
                            ></meshStandardMaterial>
                        </mesh>
                        <mesh position={[0,0,-0.025]}>
                            <sphereGeometry args={[0.010, 32, 32]}></sphereGeometry>
                            <meshStandardMaterial color={"white"}></meshStandardMaterial>
                        </mesh>
                        <pointLight color={value.color} intensity={1} distance={0.25} ></pointLight>
                    </group>
                    */}
                </>
            ) : null}

            {!value.select ? <></> : null}
        </>
    );
}

function Lamp({ light }: { light: boolean | null }) {
    const lamp = useRef<THREE.Group>(null);
    const angle = 0;

    return (
        <group ref={lamp} position={[0, 0, 0]}>
            <group rotation={[-angle, angle, 0]}>
                {light === null ? (
                    <pointLight position={[0, 0, -0.2]} color="white" intensity={10} distance={6} />
                ) : light === true ? (
                    <pointLight
                        position={[0, 0, -0.2]}
                        color="green"
                        intensity={10}
                        distance={15}
                    />
                ) : (
                    <pointLight position={[0, 0, -0.2]} color="red" intensity={10} distance={15} />
                )}
                <mesh position={[0, 0, 0.5]}>
                    <sphereGeometry args={[0.1, 12, 8]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[1, 1.5, 16, 2, true, 0, Math.PI * 2.0]} />
                    <meshStandardMaterial color="white" side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}

export function InsideScene({
    scene
}: /*onTeleport*/
{
    scene: [string, Dispatch<SetStateAction<string>>];
    /*onTeleport: Dispatch<SetStateAction<THREE.Vector3>>;*/
}) {
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
                if (feedbackEffect === "disable") {
                    do {
                        nextBallIndex = Math.floor(Math.random() * 3);
                    } while (nextBallIndex === lastBallIndex);
                    setLastBallIndex(nextBallIndex);
                } else {
                    nextBallIndex = Math.floor(Math.random() * 3);
                }
                const nextBallLoR = Math.floor(Math.random() * 2);

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

    useEffect(() => {
        console.log(showMenu);
    }, [showMenu]);

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
    const [visualIndication, setVisualIndication] = useState("illuminated");

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
                            <Boule
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
