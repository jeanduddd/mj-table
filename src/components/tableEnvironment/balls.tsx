import { useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { Arrow } from "./arrow";
import { CurvedRayIndication, LinearRayIndication } from "./rayIndicator";
import { OrientedArrow1 } from "./orientedArrow1";
import { OrientedArrow2 } from "./orientedArrow2";
import { CustomHand } from "./customHand";
//import { CustomHand } from "./customHand";

/**
 * draw a ball with different possible displays
 * @param value every information about the ball contained in the balls tab
 * @param index index of the ball
 * @param rightControllerPos position of the right controller
 * @param leftControllerPos position of the left controller
 * @function onNear used when a controller is next to a ball
 * @param visualIndication name of the current visual indication
 * @param feedbackEffect name of the current feedback effect
 * @param handModel geometry of the correct (left or right) hand that has to be displayed
 */
export function Ball({
    value,
    index,
    rightControllerPos,
    leftControllerPos,
    onNear,
    visualIndication,
    feedbackEffect,
    handModel
}: {
    value: { name: string; color: string; select: boolean; LoR: boolean | null };
    index: number;
    rightControllerPos: THREE.Vector3 | null;
    leftControllerPos: THREE.Vector3 | null;
    onNear: (correct: boolean | null) => void;
    visualIndication: string;
    feedbackEffect: string;
    handModel: any;
}) {
    //height of the ball relative to the table
    const [height, setHeight] = useState(0.7);
    //position of the ball world coordinates
    const spherePosInWorld = new THREE.Vector3(index * 0.35 - 0.35, height, -2);
    //position of the ball relative to the table
    const spherePos = new THREE.Vector3(index * 0.35 - 0.35, height, 0);
    //detect of the right controller/hand is near the ball
    const rightIsNear =
        rightControllerPos && rightControllerPos.distanceTo(spherePosInWorld) < 0.11;
    //detect of the left controller/hand is near the ball
    const leftIsNear = leftControllerPos && leftControllerPos.distanceTo(spherePosInWorld) < 0.11;
    //indicate if the ball was already near the ball
    const [wasNear, setWasNear] = useState(false);
    //indicate if the last ball the user picked up was the correct one
    const [wasCorrect, setWasCorrect] = useState(false);
    //indicate if the ball has to be disabled
    const [disable, setDisable] = useState(false);
    //indicate the time when the ball has been disabled
    const [lastDisabled, setLastDisabled] = useState<Date | null>(null);

    useEffect(() => {
        //if a controller/hand is near the ball and wasn't near before
        if ((leftIsNear || rightIsNear) && !wasNear) {
            //set was near to true
            setWasNear(true);
            //if the left controller/hand is near, checks if it was the one that had to pick up the ball
            if (leftIsNear && value.LoR === true) {
                //left was correct
                onNear(true);
                setWasCorrect(true);
                setDisable(true);
                setLastDisabled(new Date());
            } else if (leftIsNear && (value.LoR === null || value.LoR === false)) {
                //left was incorrect
                onNear(false);
            }
            //if the left controller/hand is near, checks if it was the one that had to pick up the ball
            if (rightIsNear && value.LoR === false) {
                //right was correct
                onNear(true);
                setWasCorrect(true);
                setDisable(true);
                setLastDisabled(new Date());
            }
            if (rightIsNear && (value.LoR === null || value.LoR === true)) {
                //right was incorrect
                onNear(null);
            }
        }
        //if a controller get out of a ball
        else if (!(leftIsNear || rightIsNear) && wasNear) {
            //reset wasNear and wasCorrect
            setWasNear(false);
            setWasCorrect(false);
        }
    }, [rightIsNear, leftIsNear, wasNear, wasCorrect]);

    //points representing the position of the ball and the position of the controller/hand that has to pick up the ball
    const [points, setPoints] = useState<[THREE.Vector3, THREE.Vector3]>();

    useFrame(() => {
        //reset the disable variable after a second
        if (lastDisabled && new Date().getTime() - lastDisabled.getTime() > 1000) {
            setDisable(false);
            setLastDisabled(new Date());
        }
        //set the correct height depending of the selected visual indication
        else if (visualIndication === "pedestal" && value.select === true) {
            setHeight(0.7);
        } else if (!value.select) {
            setHeight(0.65);
        } else {
            setHeight(0.65);
        }

        //updates the points of the ball and correct controller/hand
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
            {/*draw the ball that has to be picked up */}
            {value.select ? (
                <>
                    {/*selected visual indication is rays */}
                    {points && visualIndication === "rays" ? (
                        <>
                            <mesh position={spherePos}>
                                <sphereGeometry args={[0.15, 32, 32]} />
                                {feedbackEffect === "gray" ? (
                                    <meshStandardMaterial
                                        color={
                                            //check if the controller/hand was already in the ball and wasCorrect so it doesn't
                                            // turn gray after picking up the right ball and without geting out of it quickly
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
                    {/*selected visual indication an indication that doesn't show if the left or right hand have to pick up the ball */}
                    {points &&
                    (visualIndication === "glow" ||
                        visualIndication === "illuminated" ||
                        visualIndication === "pedestal") ? (
                        <LinearRayIndication
                            beginPosition={points[1]}
                            endPosition={points[0]}
                            color={value.LoR ? "#e43e6f" : "#1ec71e"}
                        ></LinearRayIndication>
                    ) : null}
                    {/*selected visual indication is arrows */}
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
                    {/*selected visual indication is the first version of oriented arrows */}
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
                    {/*selected visual indication is the second version of oriented arrows */}
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
                    {/*selected visual indication is glow */}
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
                    {/*selected visual indication is illuminated */}
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
                    {/*selected visual indication is pedestal */}
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
                    {/*selected visual indication is hands and balls. The only indication is the color of the hand matches the color of the ball */}
                    {visualIndication === "H&B" ? (
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
                    ) : null}
                    {/*selected visual indication is hands on ball. A fantom hand is placed on the ball to pick up */}
                    {visualIndication === "handsOnBall" ? (
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

                            <CustomHand
                                LoR={value.LoR!}
                                position={spherePosInWorld}
                                handModel={handModel}
                            ></CustomHand>
                        </mesh>
                    ) : null}
                </>
            ) : (
                /*draw the balls that don't have to be picked up */
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
