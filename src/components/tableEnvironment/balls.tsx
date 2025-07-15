import { useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Arrow } from "./arrow";
import { CurvedRayIndication, LinearRayIndication } from "./rayIndicator";
import { color } from "three/tsl";
import { OrientedArrow1 } from "./orientedArrow1";
import { OrientedArrow2 } from "./orientedArrow2";

export function Ball({
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
    const spherePosInWorld = new THREE.Vector3(index * 0.35 - 0.35, height, -2);
    const spherePos = new THREE.Vector3(index * 0.35 - 0.35, height, 0);
    const rightIsNear =
        rightControllerPos && rightControllerPos.distanceTo(spherePosInWorld) < 0.11;
    const leftIsNear = leftControllerPos && leftControllerPos.distanceTo(spherePosInWorld) < 0.11;
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
        else if (visualIndication === "pedestal" && value.select === true) {
            setHeight(0.70);
        }
        else if (visualIndication !== "mouvement" && !value.select) {
            setHeight(0.65);
        }
        else{
            setHeight(0.65)
        }
      
        if (leftControllerPos && rightControllerPos) {
            value.select
                ? setPoints([
                      spherePos,
                      value.LoR
                          ? leftControllerPos.clone().add(new THREE.Vector3(0, 0, 2))
                          : rightControllerPos.clone().add(new THREE.Vector3(0, 0, 2))
                  ])
                : null;
        }

        
    });

    if (feedbackEffect === "disable") {
        if (disable) {
            return null;
        }
    }

    return (
        <>
            {value.select ? (
                <>
                    {points && visualIndication === "rays" ? (
                        <>
                            <mesh position={spherePos}>
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
                                    <meshStandardMaterial
                                        color={value.color}
                                    ></meshStandardMaterial>
                                )}
                            </mesh>
                            <CurvedRayIndication
                                beginPosition={points[1]}
                                endPosition={points[0]}
                                color={value.color}
                            ></CurvedRayIndication>
                        </>
                    ) : null}
                    {points &&
                    (visualIndication === "mouvement" ||
                        visualIndication === "glow" ||
                        visualIndication === "illuminated" ||
                        visualIndication === "pedestal") ? (
                        <LinearRayIndication
                            beginPosition={points[1]}
                            endPosition={points[0]}
                            color={value.LoR ? "#e43e6f" : "#1ec71e"}
                        ></LinearRayIndication>
                    ) : null}

                    {visualIndication === "arrows" ? (
                        <>
                            <group position={spherePos}>
                                <mesh>
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
                                        <meshStandardMaterial
                                            color={value.color}
                                        ></meshStandardMaterial>
                                    )}
                                </mesh>

                                <Arrow
                                    color={value.LoR ? "pink" : "lightgreen"}
                                    position={spherePosInWorld}
                                />
                            </group>
                        </>
                    ) : null}
                    {visualIndication === "arrows1" ? (
                        <>
                            <group position={spherePos}>
                                <mesh>
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
                                        <meshStandardMaterial
                                            color={value.color}
                                        ></meshStandardMaterial>
                                    )}
                                </mesh>

                                <OrientedArrow1 LoR={value.LoR!} position={spherePosInWorld} />
                            </group>
                        </>
                    ) : null}
                    {visualIndication === "arrows2" ? (
                        <>
                            <group position={spherePos}>
                                <mesh>
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
                                        <meshStandardMaterial
                                            color={value.color}
                                        ></meshStandardMaterial>
                                    )}
                                </mesh>

                                <OrientedArrow2 LoR={value.LoR!} position={spherePosInWorld} />
                            </group>
                        </>
                    ) : null}
                    {visualIndication === "glow" ? (
                        <>
                            <mesh position={spherePos}>
                                <sphereGeometry args={[0.15, 32, 32]} />
                                {feedbackEffect === "gray" ? (
                                    <meshStandardMaterial
                                        emissive={
                                            leftIsNear || rightIsNear
                                                ? wasCorrect
                                                    ? value.color
                                                    : "gray"
                                                : value.color
                                        }
                                        emissiveIntensity={2.5}
                                        color={
                                            leftIsNear || rightIsNear
                                                ? wasCorrect
                                                    ? value.color
                                                    : "gray"
                                                : value.color
                                        }
                                        transparent
                                        opacity={0.8}
                                    />
                                ) : (
                                    <meshStandardMaterial
                                        emissive={value.color}
                                        emissiveIntensity={2.5}
                                        color={value.color}
                                        transparent
                                        opacity={0.8}
                                    />
                                )}
                            </mesh>
                            <mesh position={spherePos}>
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
                    {visualIndication === "illuminated" ? (
                        <>
                            <group position={spherePos}>
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
                                <pointLight
                                    color={value.color}
                                    intensity={1}
                                    distance={0.25}
                                ></pointLight>
                            </group>
                        </>
                    ) : null}
                    {visualIndication === "mouvement" ? (
                        <mesh position={spherePos}>
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
                        </mesh>
                    ) : null}
                    {visualIndication === "pedestal" ? (
                        <>
                            <mesh position={spherePos}>
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
                                    <meshStandardMaterial
                                        color={value.color}
                                    ></meshStandardMaterial>
                                )}
                            </mesh>
                            <mesh
                                scale={0.04}
                                position={spherePos.clone().add(new THREE.Vector3(0, -0.17, 0))}
                            >
                                <cylinderGeometry args={[2, 3, 1.5, 32]}></cylinderGeometry>
                                <meshStandardMaterial color={value.color}></meshStandardMaterial>
                            </mesh>
                            <mesh
                                scale={0.04}
                                position={spherePos.clone().add(new THREE.Vector3(0, -0.17, 0))}
                            >
                                <cylinderGeometry args={[2, 3, 1.5, 32]}></cylinderGeometry>
                                <meshStandardMaterial
                                    color={"lightgray"}
                                    wireframe
                                ></meshStandardMaterial>
                            </mesh>
                        </>
                    ) : null}
                </>
            ) : (
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
                </mesh>
            )}
        </>
    );
}
