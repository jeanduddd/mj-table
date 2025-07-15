import { useFrame } from "@react-three/fiber";
import { Container, Text } from "@react-three/uikit";
import { useState } from "react";

export function ContainerComponent({
    name,
    selected,
    onPress
}: {
    name: string;
    selected: boolean;
    onPress: () => void;
}) {
    const [color, setColor] = useState("white");
    const [hover, setHover] = useState(false);

    const [lastClick, setLastClick] = useState<Date | null>(null);

    useFrame(() => {
        if (new Date().getTime() - lastClick!?.getTime() < 300) {
            setColor("lightgreen");
            onPress();
        } else {
            hover ? setColor("#CCCCCC") : setColor("white");
        }
    });

    return (
        <Container
            marginTop={5}
            borderRadius={15}
            width={100}
            height={25}
            backgroundColor={color}
            positionType={"relative"}
            //alignItems={"center"}
            onClick={() => {
                setLastClick(new Date());
            }}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
        >
            <Text
                fontSize={30}
                width="100%"
                marginBottom={17.5}
                alignSelf={"center"}
                positionType={"absolute"}
                onClick={() => {
                    setLastClick(new Date());
                }}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
            >
                {selected ? "." : ""}
            </Text>
            <Text
                fontSize={10}
                width="100%"
                positionType={"absolute"}
                textAlign={"center"}
                alignSelf={"center"}
                onClick={() => {
                    setLastClick(new Date());
                }}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
            >
                {name}
            </Text>
        </Container>
    );
}
