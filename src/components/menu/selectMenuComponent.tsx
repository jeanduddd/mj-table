import { Container, Root, Text } from "@react-three/uikit";
import { ContainerComponent } from "./containerComponent";
import { useEffect, useState } from "react";

export function Menu({
    visualIndication,
    setVisualIndication,
    feedbackEffect,
    setFeedbackEffect
}: {
    visualIndication: string;
    setVisualIndication: (vakue: string) => void;
    feedbackEffect: string;
    setFeedbackEffect: (value: string) => void;
}) {
    function setSelected(visualOrFeedback: boolean, index: number) {
        visualOrFeedback
            ? setVisualIndicationList((list) =>
                  list.map((v, i) => ({ ...v, selected: i === index }))
              )
            : setFeedbackEffectList((list) =>
                  list.map((v, i) => ({ ...v, selected: i === index }))
              );

        visualOrFeedback
            ? setVisualIndication(visualIndicationList[index].setName)
            : setFeedbackEffect(feedbackEffectList[index].setName);
    }

    useEffect(() => {
        setVisualIndicationList((list) =>
            list.map((v, i) => ({ ...v, selected: v.setName === visualIndication }))
        );
        setFeedbackEffectList((list) =>
            list.map((v, i) => ({ ...v, selected: v.setName === feedbackEffect }))
        );
    }, []);

    const [visualIndicationList, setVisualIndicationList] = useState([
        { name: "arrows indication", setName: "arrows", selected: false },
        { name: "oriented arrows 1", setName: "arrows1", selected: false },
        { name: "oriented arrows 2", setName: "arrows2", selected: false },
        //{ name: "mouvement", setName: "mouvement", selected: false },
        { name: "rays indication", setName: "rays", selected: false },
        { name: "glow indication", setName: "glow", selected: false },
        { name: "illuminated", setName: "illuminated", selected: false },
        { name: "pedestal", setName: "pedestal", selected: false }
    ]);

    const [feedbackEffectList, setFeedbackEffectList] = useState([
        { name: "lamps", setName: "lamps", selected: false },
        { name: "gray balls", setName: "gray", selected: false },
        { name: "disable balls", setName: "disable", selected: false },
        { name: "vibration", setName: "vibrate", selected: false }
    ]);

    return (
        <Root>
            <Container
                backgroundColor={"black"}
                borderColor={"white"}
                borderWidth={2}
                height={150}
                width={250}
            >
                <Container width={120} flexDirection={"column"} alignItems={"center"}>
                    <Text
                        fontSize={10}
                        width="60%"
                        textAlign="center"
                        color={"white"}
                        marginTop={11}
                        marginBottom={6}
                        borderBottomWidth={1}
                        borderColor={"white"}
                    >
                        Effets Visuels :
                    </Text>
                    <Container
                        width={120}
                        flexDirection={"column"}
                        alignItems={"center"}
                        gap={2}
                        maxHeight={250}
                        overflow={"scroll"}
                        scrollbarWidth={0}
                    >
                        {visualIndicationList.map((value, index) => (
                            <ContainerComponent
                                key={index}
                                name={value.name}
                                selected={value.selected}
                                onPress={() => setSelected(true, index)}
                            />
                        ))}
                    </Container>
                </Container>
                <Container width={120} flexDirection={"column"} alignItems={"center"}>
                    <Text
                        fontSize={10}
                        width="75%"
                        textAlign="center"
                        color={"white"}
                        marginTop={11}
                        marginBottom={6}
                        borderBottomWidth={1}
                        borderColor={"white"}
                    >
                        Feedback Effects :
                    </Text>
                    <Container
                        width={120}
                        flexDirection={"column"}
                        alignItems={"center"}
                        gap={2}
                        maxHeight={250}
                        overflow={"scroll"}
                        scrollbarWidth={0}
                    >
                        {feedbackEffectList.map((value, index) => (
                            <ContainerComponent
                                key={index}
                                name={value.name}
                                selected={value.selected}
                                onPress={() => {
                                    setSelected(false, index);
                                }}
                            />
                        ))}
                    </Container>
                </Container>
            </Container>
        </Root>
    );
}
