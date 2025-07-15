import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useState } from "react";
import { useFrame } from "@react-three/fiber";

export function RayIndication({
    beginPosition,
    endPosition,
    color
}: {
    beginPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    color: string;
}) {
    const totalBoxes = 20;

    const [lineDirection, setLineDirection] = useState(
        endPosition.clone().sub(beginPosition).normalize()
    );

    const [lineLenght, setLineLength] = useState (beginPosition.distanceTo(beginPosition))

    const particulesHeight = 0.02;

    const curve1Points = [
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

    const curve2Points = [
        beginPosition,
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.75))
            .add(new THREE.Vector3(-0.02, 0, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.5))
            .add(new THREE.Vector3(0, -0.02, 0)),
        endPosition
            .clone()
            .add(lineDirection.clone().multiplyScalar(lineLenght * -0.25))
            .add(new THREE.Vector3(0, 0, -0.02)),
        endPosition
    ];

    const curve1 = new THREE.CatmullRomCurve3(curve1Points);
    const [points1, setPoints1] = useState(curve1.getPoints(totalBoxes));

    const curve2 = new THREE.CatmullRomCurve3(curve2Points);
    const [points2, setPoints2] = useState(curve2.getPoints(totalBoxes));
    
    const [offset, setOffset] = useState(0);

    useFrame(() => {
        setLineDirection(endPosition.clone().sub(beginPosition).normalize());

        setLineLength(endPosition.distanceTo(beginPosition))

        setPoints1(
            Array.from({ length: totalBoxes }, (_, i) => {
                const t = (i / totalBoxes + offset) % 1;
                const point = curve1.getPointAt(t);
                return point;
            })
        );

        setPoints2(
            Array.from({ length: totalBoxes }, (_, i) => {
                const t = (i / totalBoxes + offset) % 1;
                const point = curve2.getPointAt(t);
                return point;
            })
        );

        setOffset((offset + 0.002) % 1);
    });

    return (
        <>
        {/*
            <Line
                points={[endPosition, beginPosition]}
                lineWidth={10}
                color={color}
                transparent
                opacity={0.3}
            ></Line>
            */}
            {points1.map((value, index) => (
                <mesh position={[value.x, value.y, value.z]}>
                    <boxGeometry args={[0.005, 0.005, 0.005]}></boxGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
            ))}
            {/* 
            {points2.map((value, index) => (
                <mesh position={[value.x, value.y, value.z]}>
                    <boxGeometry args={[0.005, 0.005, 0.005]}></boxGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
            ))}
                */}
        </>
    );
}

/*<mesh>
            <Line points={[beginPosition,endPosition]} lineWidth={10} color={color} transparent opacity={0.3}></Line>
        </mesh>*/

/*import * as THREE from "three";
import { Line, Point, useFBO } from "@react-three/drei";
import { useState } from "react";
import { useFrame } from "@react-three/fiber";

export function RayIndication({
    beginPosition,
    endPosition,
    color
}: {
    beginPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    color: string;
}) {

    const curve = new THREE.CatmullRomCurve3([beginPosition, endPosition]);
    const [points,setPoints] = useState(curve.getPoints(50));

    const [lineDirection, setLineDirection] = useState((endPosition.clone().sub(beginPosition).normalize()))

    const [randomX, setRandomX] = useState()


    useFrame(()=>{
        setLineDirection(endPosition.clone().sub(beginPosition).normalize());

        //setPoints
    
        //setPoints(points.map((value, index) => (value.sub(lineDirection.clone().multiplyScalar(0.005)))))  
    })

    return (
        <>
            <Line
                points={[beginPosition, endPosition]}
                lineWidth={10}
                color={color}
                transparent
                opacity={0.3}
            ></Line>
            {points.map((value, index) => (
                <mesh
                    position={[
                        value.x ,
                        value.y ,   
                        value.z 
                    ]}
                >
                    <boxGeometry args={[0.005, 0.005, 0.005]}></boxGeometry>
                    <meshStandardMaterial color={color}></meshStandardMaterial>
                </mesh>
            ))}
        </>
    );
}

/*<mesh>
            <Line points={[beginPosition,endPosition]} lineWidth={10} color={color} transparent opacity={0.3}></Line>
        </mesh>*/
