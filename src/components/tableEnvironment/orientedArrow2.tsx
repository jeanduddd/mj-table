import { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";


/**
  * create an oriented arrow by changing the form of its "tail"
 * @param LoR boolean indicating if the ball has to be taken with the left or the right hand
 * @param position poisition of the ball relative to the the table
 */
export function OrientedArrow2({ LoR, position }: { LoR: boolean; position: THREE.Vector3 }) {
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
    rectangle.moveTo(x, y);
    rectangle.lineTo(x + 0.5, y);
    rectangle.lineTo(x + 0.5, y + 1.5);
    rectangle.lineTo(x, y + 1.5);
    rectangle.lineTo(x, y + 0.4);
    rectangle.lineTo(x - 0.25, y + 0.4);
    rectangle.lineTo(x - 0.25, y);
    rectangle.lineTo(x, y);

    //get the user camera
    const { camera } = useThree();
    const [cameraPosition, setCameraPosition] = useState(camera.position);

    //angle of the arrow
    const angle = useRef(0);

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
        //get some camera properties
        camera.updateMatrixWorld();
        const position = new THREE.Vector3();
        camera.getWorldPosition(position);
        setCameraPosition(position);
    });

    return (
        <group
            scale={0.1}
            position={[
                //make the arrow always on the correct side (Left or Right) regardless of the user position
                LoR ? -Math.cos(angle.current) * 0.2 : Math.cos(angle.current) * 0.2,
                0.05,
                LoR ? Math.sin(angle.current) * 0.2 : -Math.sin(angle.current) * 0.2
            ]}
            //rotate the arrow to follow the user and to indicate the direction
            rotation={[0, angle.current + (LoR ? 0 : Math.PI), 0]}
        >
            <mesh position={[0, 1, 0]} rotation={[0, Math.PI, 0]}>
                <shapeGeometry args={[rectangle]}></shapeGeometry>
                <meshStandardMaterial
                    color={LoR ? "pink" : "lightgreen"}
                    side={THREE.DoubleSide}
                ></meshStandardMaterial>
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[1.25, 1.2, 0]}>
                <shapeGeometry args={[triangle]}></shapeGeometry>
                <meshStandardMaterial
                    color={LoR ? "pink" : "lightgreen"}
                    side={THREE.DoubleSide}
                ></meshStandardMaterial>
            </mesh>
        </group>
    );
}
