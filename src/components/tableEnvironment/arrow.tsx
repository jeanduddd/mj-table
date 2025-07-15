import { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Arrow({ color, position }: { color: string; position: THREE.Vector3 }) {
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
