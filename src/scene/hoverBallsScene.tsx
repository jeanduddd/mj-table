import { useState, type SetStateAction, type Dispatch } from "react";
import { useFrame } from "@react-three/fiber";
import { Button } from "@react-three/uikit-default";
import { Root, Text } from "@react-three/uikit";
import * as THREE from "three";
import { TeleportTarget } from "@react-three/xr";

export function HoverScene({
    scene,
    /*onTeleport*/
}: {
    scene: [string, Dispatch<SetStateAction<string>>];
    /*onTeleport: Dispatch<SetStateAction<THREE.Vector3>>;*/
}) {
    const [, setScene] = scene;

    const [balls, setBalls] = useState([
        { name: "ball1", color: "red", hover: false },
        { name: "ball2", color: "blue", hover: false },
        { name: "ball3", color: "yellow", hover: false }
    ]);

    useFrame(() => {});

    return (
        <>
            <group position={[0, 0, -4]}>
                <group position={[-1, 0, 0]}>
                    <Root>
                        <Button onClick={() => setScene("lamp")}>
                            <Text>lamp</Text>
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

            {/*<TeleportTarget onTeleport={onTeleport}>*/}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <planeGeometry args={[10, 10]}></planeGeometry>
                    <meshStandardMaterial side={THREE.DoubleSide}></meshStandardMaterial>
                </mesh>
            {/*</TeleportTarget>*/}

            <ambientLight intensity={0.7} />

            <mesh
                position={[0, 0, -2]}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <boxGeometry args={[2, 1, 1]} />
                {balls.map((value, index) => (
                    <mesh
                        key={value.name}
                        position={[index * 0.8 - 0.8, 0.8, 0]}
                        onPointerOver={() => {
                            setBalls((balls) =>
                                balls.map((v, i) => (i === index ? { ...v, hover: true } : v))
                            );
                        }}
                        onPointerOut={() => {
                            setBalls((balls) =>
                                balls.map((v, i) => (i === index ? { ...v, hover: false } : v))
                            );
                        }}
                    >
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial color={value.hover ? "gray" : value.color} />
                    </mesh>
                ))}
            </mesh>
        </>
    );
}
