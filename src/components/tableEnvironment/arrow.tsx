import { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * create a colored and moving arrow that follows the user
 * @param color color of the arrow
 * @param position poisition of the ball relative to the the table
 */
export function Arrow({ color, position }: { color: string; position: THREE.Vector3 }) {
    //create the triangle of the arrow
    const triangle = new THREE.Shape();
    const x = 0;
    const y = 0;
    triangle.moveTo(x, y);
    triangle.lineTo(x + 0.5, y + 1);
    triangle.lineTo(x - 0.5, y + 1);
    triangle.lineTo(x, y);

    //create the "tail" of the arrow
    const rectangle = new THREE.Shape();
    rectangle.moveTo(0, 0);
    rectangle.lineTo(x + 0.25, y);
    rectangle.lineTo(x + 0.25, y + 1);
    rectangle.lineTo(x - 0.25, y + 1);
    rectangle.lineTo(x - 0.25, y);
    rectangle.lineTo(x, y);

    //get the user camera
    const { camera } = useThree();
    const [cameraPosition, setCameraPosition] = useState(camera.position);

    //angle of the arrow
    const angle = useRef(0);

    //height of the arrow to make it move up and down
    const [height, setHeight] = useState(0.2);

    useEffect(() => {
        //get the camera position without taking into account the height
        const cameraFlat = new THREE.Vector3(cameraPosition.x, 0, cameraPosition.z);
        //get the arrow position without taking into account the height
        const flecheFlat = new THREE.Vector3(position.x, 0, position.z);
        //Get the camera to arrow direction
        const dirToCamera = cameraFlat.clone().sub(flecheFlat).normalize();
        //calculate the angle that we need to apply to the arrow
        angle.current = Math.atan2(dirToCamera.x, dirToCamera.z);
    }, [cameraPosition]);

    useFrame(() => {
        //change the height of the arrow to make it move
        setHeight(0.2 + Math.abs(Math.sin(Date.now() * 0.002)) * 0.05);

        //get some camera properties
        camera.updateMatrixWorld();
        const position = new THREE.Vector3();
        camera.getWorldPosition(position);
        setCameraPosition(position);
    });

    //return the arrow with the right height and rotation
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
}
