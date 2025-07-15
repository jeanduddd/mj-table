import { useRef } from "react";
import * as THREE from "three";

/**
 * create a light that can change color
 * @param light boolean or null representing the color of the light. null = white, true = green, false = red
 */
export function Lamp({ light }: { light: boolean | null }) {
    const lamp = useRef<THREE.Group>(null);

    return (
        <group ref={lamp} position={[0, 0, 0]}>
            <group rotation={[0, 0, 0]}>
                {/*apply the correct light color */}
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
