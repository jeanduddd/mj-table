import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Container, Text } from "@react-three/uikit";

/**
 * display a feeback/indication and indicated if it is currently selected or not
 * @param name name of the feeback/indication that has to be displayed
 * @param selected indicated if the displayed feeback/indication is currently selected
 * @function onPress indicate to the parent component that this feeback/indication has been selected
 */
export function ContainerComponent({
    name,
    selected,
    onPress
}: {
    name: string;
    selected: boolean;
    onPress: () => void;
}) {
    //background color
    const [color, setColor] = useState("white");
    //indicates if the component is hovered
    const [hover, setHover] = useState(false);
    //indicates the last time we clicked on the component
    const [lastClick, setLastClick] = useState<Date | null>(null);

    useFrame(() => {
        //set the background color to green for a few milliseconds when the component is clicked
        if (new Date().getTime() - lastClick!?.getTime() < 300) {
            setColor("lightgreen");
            onPress();
        } else {
            //set the background color to gray if the component is hovered, white instead
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
                {/*display a dot before the name of the feeback/indication if it is currently selected */}
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
