import { useState, useRef, type SetStateAction, type Dispatch } from "react";
import { useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { Button } from "@react-three/uikit-default";
import { Root, Text } from "@react-three/uikit";
import * as THREE from "three";
import { TeleportTarget } from "@react-three/xr";

function Lamp({ bool }: { bool: boolean }) {
    const lamp = useRef<THREE.Group>(null);
    const angle = Math.PI / 4;
    useFrame(() => {
        if (lamp.current) {
            lamp.current.rotation.y += 0.01;
        }
    });
    return (
        <group ref={lamp} position={[0, 0, 0]}>
            <group rotation={[-angle, angle, 0]}>
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

export function LampScene({
    scene,
    /*onTeleport*/
}: {
    scene: [string, Dispatch<SetStateAction<string>>];
    /*onTeleport: Dispatch<SetStateAction<THREE.Vector3>>;*/
}) {
    const colorMap = useLoader(THREE.TextureLoader, "./assets/wall.jpg");

    const [switchOn, setSwitchOn] = useState(true);
    const [, setScene] = scene;

    return (
        <>
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

            <mesh
                onClick={(e) => {
                    setSwitchOn(!switchOn);
                    e.stopPropagation();
                }}
            >
                <boxGeometry args={[1, 1, 1]}></boxGeometry>
                <meshStandardMaterial map={colorMap}></meshStandardMaterial>
            </mesh>
            {/*<TeleportTarget onTeleport={onTeleport}>*/}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                    <planeGeometry args={[10, 10]}></planeGeometry>
                    <meshStandardMaterial side={THREE.DoubleSide}></meshStandardMaterial>
                </mesh>
            {/*</TeleportTarget>*/}
        </>
    );
}
