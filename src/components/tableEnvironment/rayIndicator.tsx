import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useState } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * draw a curved ray with moving particules
 * @param beginPosition point where the ray should begin
 * @param enPosition point where the ray should end
 * @param color color of the ray
 */
export function CurvedRayIndication({
    beginPosition,
    endPosition,
    color
}: {
    beginPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    color: string;
}) {
    //number of particules that will be drawn
    const totalBoxes = 20;

    //direction of the line
    const [lineDirection, setLineDirection] = useState(
        endPosition.clone().sub(beginPosition).normalize()
    );

    //length of the line
    const [lineLenght, setLineLength] = useState(beginPosition.distanceTo(beginPosition));

    //gap between the straigth line going from start to end point and the particules path
    const particulesHeight = 0.02;

    //points that define the curve the particules will follow
    const curvePoints = [
        beginPosition,
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.875))
            .add(new THREE.Vector3(particulesHeight, 0, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.75))
            .add(new THREE.Vector3(0, particulesHeight, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.625))
            .add(new THREE.Vector3(-particulesHeight, 0, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.5))
            .add(new THREE.Vector3(0, -particulesHeight, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.375))
            .add(new THREE.Vector3(particulesHeight, 0, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.25))
            .add(new THREE.Vector3(0, particulesHeight, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.125))
            .add(new THREE.Vector3(-particulesHeight, 0, 0)),
        endPosition
    ];

    //curve that the partucles will follow
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    //particules
    const [points, setPoints] = useState(curve.getPoints(totalBoxes));

    const [offset, setOffset] = useState(0);

    useFrame(() => {
        //updates line direction
        setLineDirection(endPosition.clone().sub(beginPosition).normalize());

        //updates line length
        setLineLength(endPosition.distanceTo(beginPosition));

        //updates particules, add the offset to make them move forward
        setPoints(
            Array.from({ length: totalBoxes }, (_, i) => {
                const t = (i / totalBoxes + offset) % 1;
                const point = curve.getPointAt(t);
                return point;
            })
        );

        //updates the offset
        setOffset((offset + 0.002) % 1);
    });

    return (
        <>
            {/* draw a low opacity line from start to end point */}
            {/*
            <Line
                points={[endPosition, beginPosition]}
                lineWidth={10}
                color={color}
                transparent
                opacity={0.3}
            ></Line>
            */}
            {/*draw the particules */}
            {points.map((value, index) => (
                <mesh position={[value.x, value.y, value.z]}>
                    <boxGeometry args={[0.005, 0.005, 0.005]}></boxGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
            ))}
        </>
    );
}

/**
 * draw a linear ray with moving particules
 * @param beginPosition point where the ray should begin
 * @param enPosition point where the ray should end
 * @param color color of the ray
 */
export function LinearRayIndication({
    beginPosition,
    endPosition,
    color
}: {
    beginPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    color: string;
}) {
    //number of particules that will be drawn
    const totalBoxes = 50;

    //curve that the partucles will follow
    const curve = new THREE.CatmullRomCurve3([beginPosition, endPosition]);
    //particules
    const [points, setPoints] = useState(curve.getPoints(totalBoxes));

    const [offset, setOffset] = useState(0);

    useFrame(() => {
        //updates particules, add the offset to make them move forward
        setPoints(
            Array.from({ length: totalBoxes }, (_, i) => {
                const t = (i / totalBoxes + offset) % 1;
                const point = curve.getPointAt(t);
                return point;
            })
        );

        //updates the offset
        setOffset((offset + 0.002) % 1);
    });

    return (
        <>
            {/* draw a low opacity line from start to end point */}
            <Line
                points={[beginPosition, endPosition]}
                lineWidth={10}
                color={color}
                transparent
                opacity={0.3}
            ></Line>
            {/*draw the particules */}
            {points.map((value, index) => (
                <mesh position={[value.x, value.y, value.z]}>
                    <boxGeometry args={[0.005, 0.005, 0.005]}></boxGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
            ))}
        </>
    );
}
