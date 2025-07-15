import { useState, useRef, type SetStateAction, type Dispatch } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Button } from "@react-three/uikit-default";
import { Root, Text } from "@react-three/uikit";
import * as THREE from "three";

//unused scene for the table, was made to discover react three fiber

/**
 * create a lamp
 * @param bool boolean indicating if the light has to be switched on or off
 * @returns a lamp component
 */
function Lamp({ bool }: { bool: boolean }) {
    const lamp = useRef<THREE.Group>(null);
    const angle = Math.PI / 4;
    //rotate the lamp around y axis on each frame
    useFrame(() => {
        if (lamp.current) {
            lamp.current.rotation.y += 0.01;
        }
    });
    return (
        <group ref={lamp} position={[0, 0, 0]}>
            <group rotation={[-angle, angle, 0]}>
                {/* draw or not a light point depending on the function parameter */}
                {bool ? (
                    <pointLight position={[0, 0, 3.8]} color="red" intensity={50} distance={15} />
                ) : null}
                <mesh position={[0, 0, 4.5]}>
                    <sphereGeometry args={[0.1, 12, 8]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <mesh position={[0, 0, 4]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[1, 1.5, 16, 2, true, 0, Math.PI * 2.0]} />
                    <meshStandardMaterial color="red" side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}

export function LampScene({ scene }: { scene: [string, Dispatch<SetStateAction<string>>] }) {
    //load an imported texture
    const colorMap = useLoader(THREE.TextureLoader, "./assets/wall.jpg");

    const [switchOn, setSwitchOn] = useState(true);
    const [, setScene] = scene;

    return (
        <>
            {/*buttuns to change scene */}
            <group position={[0, 0, -2]}>
                <group position={[-1, 0, 0]}>
                    <Root>
                        <Button onClick={() => setScene("hover")}>
                            <Text>hover balls</Text>
                        </Button>
                    </Root>
                </group>
                <group position={[1, 0, 0]}>
                    <Root>
                        <Button onClick={() => setScene("collision")}>
                            <Text>ball collision</Text>
                        </Button>
                    </Root>
                </group>
            </group>

            <ambientLight intensity={0.1} />

            <Lamp bool={switchOn}></Lamp>

            {/* create a textured cube that switch on/off the light when we click on it*/}
            <mesh
                onClick={(e) => {
                    setSwitchOn(!switchOn);
                    e.stopPropagation();
                }}
            >
                <boxGeometry args={[1, 1, 1]}></boxGeometry>
                <meshStandardMaterial map={colorMap}></meshStandardMaterial>
            </mesh>
            {/*the ground of the scene */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <planeGeometry args={[10, 10]}></planeGeometry>
                <meshStandardMaterial side={THREE.DoubleSide}></meshStandardMaterial>
            </mesh>
        </>
    );
}
