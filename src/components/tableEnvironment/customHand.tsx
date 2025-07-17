import { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * create an oriented arrow by rotating it
 * @param LoR boolean indicating if the ball has to be taken with the left or the right hand
 * @param position poisition of the ball relative to the the table
 */
export function CustomHand({
    LoR,
    position,
    handModel
}: {
    LoR: boolean;
    position: THREE.Vector3;
    handModel: any;
}) {
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

    // Réf. pour appliquer la rotation dynamiquement
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (!groupRef.current) return;

        const baseEuler = LoR
            ? new THREE.Euler((Math.PI / 6) * 3, -Math.PI / 4.5, Math.PI / 6)
            : new THREE.Euler((Math.PI / 6) * 3, Math.PI / 4.5, -Math.PI / 6);

        const rotationAroundY = new THREE.Euler(0, 0, 0); //new THREE.Euler(0, angle.current, 0);

        // Appliquer la rotation Y puis la rotation de base
        const finalQuat = new THREE.Quaternion()
            .setFromEuler(rotationAroundY)
            .multiply(new THREE.Quaternion().setFromEuler(baseEuler));

        groupRef.current.quaternion.copy(finalQuat);
    }, [angle.current]);

    return (
        <group
            ref={groupRef}
            position={[
                LoR ? -Math.cos(angle.current) * 0.1 : Math.cos(angle.current) * 0.1,
                0.1,
                LoR ? Math.sin(angle.current) * 0.1 : -Math.sin(angle.current) * 0.1
            ]}
        >
            {handModel.current && (
                <mesh geometry={handModel.current}>
                    <meshStandardMaterial color={LoR ? "pink" : "lightgreen"} />
                </mesh>
            )}
        </group>
    );
}
