import { useState, type SetStateAction, type Dispatch } from "react";
import { Button } from "@react-three/uikit-default";
import { Root, Text } from "@react-three/uikit";
import * as THREE from "three";

//unused scene, was made to create the table and use basic interactions

export function HoverScene({ scene }: { scene: [string, Dispatch<SetStateAction<string>>] }) {
    const [, setScene] = scene;

    //create the balls
    const [balls, setBalls] = useState([
        //name : id of the ball, color : color of the ball, hover : indicate if the ball is hovered
        { name: "ball1", color: "red", hover: false },
        { name: "ball2", color: "blue", hover: false },
        { name: "ball3", color: "yellow", hover: false }
    ]);

    return (
        <>
            {/*buttons to change scene */}
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
            {/*set the ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[10, 10]}></planeGeometry>
                <meshStandardMaterial side={THREE.DoubleSide}></meshStandardMaterial>
            </mesh>

            <ambientLight intensity={0.7} />

            <mesh
                position={[0, 0, -2]}
                //we can't click throught the table
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <boxGeometry args={[2, 1, 1]} />
                {/*draw the balls on the table */}
                {balls.map((value, index) => (
                    <mesh
                        key={value.name}
                        position={[index * 0.8 - 0.8, 0.8, 0]}
                        //change hover variable when the pointer hover the ball
                        onPointerOver={() => {
                            setBalls((balls) =>
                                balls.map((v, i) => (i === index ? { ...v, hover: true } : v))
                            );
                        }}
                        //desactivated the hover variable when the pointer doesn't hover the ball anymore
                        onPointerOut={() => {
                            setBalls((balls) =>
                                balls.map((v, i) => (i === index ? { ...v, hover: false } : v))
                            );
                        }}
                    >
                        <sphereGeometry args={[0.3, 32, 32]} />
                        {/*draw a gray ball of the pointer hovers a ball */}
                        <meshStandardMaterial color={value.hover ? "gray" : value.color} />
                    </mesh>
                ))}
            </mesh>
        </>
    );
}
