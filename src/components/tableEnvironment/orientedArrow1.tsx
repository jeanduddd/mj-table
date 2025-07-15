import { useState, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { radToDeg } from "three/src/math/MathUtils.js";

export function OrientedArrow1({ LoR, position }: { LoR: boolean; position: THREE.Vector3 }) {
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

    useEffect(() => {
        const cameraFlat = new THREE.Vector3(cameraPosition.x, 0, cameraPosition.z);
        const flecheFlat = new THREE.Vector3(position.x, 0, position.z);
        const dirToCamera = cameraFlat.clone().sub(flecheFlat).normalize();
        angle.current = Math.atan2(dirToCamera.x, dirToCamera.z);
        
    }, [cameraPosition]);

    useFrame(() => {
        camera.updateMatrixWorld();
        const position = new THREE.Vector3();
        camera.getWorldPosition(position);
        setCameraPosition(position);
    });

    return (
        <group
            scale={0.1}
            position={[
                LoR ? -Math.cos(angle.current) * 0.1 : Math.cos(angle.current) * 0.1,
                0.2,
                LoR ? Math.sin(angle.current) * 0.1 : -Math.sin(angle.current) * 0.1
            ]}
            rotation={[0, angle.current, LoR ? Math.PI / 4 : -Math.PI / 4]}
        >
            <mesh position={[0, 1, 0]}>
                <shapeGeometry args={[rectangle]}></shapeGeometry>
                <meshStandardMaterial
                    color={LoR ? "pink" : "lightgreen"}
                    side={THREE.DoubleSide}
                ></meshStandardMaterial>
            </mesh>
            <mesh>
                <shapeGeometry args={[triangle]}></shapeGeometry>
                <meshStandardMaterial
                    color={LoR ? "pink" : "lightgreen"}
                    side={THREE.DoubleSide}
                ></meshStandardMaterial>
            </mesh>
        </group>
    );
}
