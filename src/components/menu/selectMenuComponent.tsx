import { useEffect, useState } from "react";
import { Container, Root, Text } from "@react-three/uikit";

import { ContainerComponent } from "./containerComponent";

/**
 * create a menu to select the visual indication and the feedback effect we want to apply to the scene
 * @param visualIndication string representing the current visual indication name
 * @function setVisualIndication function to update the current visual indication name in the parent component
 * @param feedbackEffect string representing the current feedback effect name
 * @function setFeedbackEffect function to update the current feedback effect name in the parent component
 */
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
    /**
     *change the feeback/indication in the parent component when we use the menu
     * @param visualOrFeedback indicate if the value that changed is a visual indication or a feedback effect, visual indication = true, feedback effect = false
     * @param index indicate the index in the feeback/indication list of the selected feeback/indication
     */
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

    //updates the selected feeback/indication when we open the menu
    useEffect(() => {
        setVisualIndicationList((list) =>
            list.map((v, i) => ({ ...v, selected: v.setName === visualIndication }))
        );
        setFeedbackEffectList((list) =>
            list.map((v, i) => ({ ...v, selected: v.setName === feedbackEffect }))
        );
    }, []);

    //add a new line on this list to display it on the menu and to be able to select it later

    //list of every existing visual indications
    const [visualIndicationList, setVisualIndicationList] = useState([
        //name = name that has to be displayed on the menu, setName = name used in the program to enable or disable the effect
        //selected = indicates if the feeback/indication is currently selected
        { name: "arrows indication", setName: "arrows", selected: false },
        { name: "oriented arrows 1", setName: "arrows1", selected: false },
        { name: "oriented arrows 2", setName: "arrows2", selected: false },
        { name: "rays indication", setName: "rays", selected: false },
        { name: "glow indication", setName: "glow", selected: false },
        { name: "illuminated", setName: "illuminated", selected: false },
        { name: "pedestal", setName: "pedestal", selected: false }
    ]);

    //list of every existing feedback effect
    const [feedbackEffectList, setFeedbackEffectList] = useState([
        { name: "lamps", setName: "lamps", selected: false },
        { name: "gray balls", setName: "gray", selected: false },
        { name: "disable balls", setName: "disable", selected: false },
        { name: "vibration", setName: "vibrate", selected: false }
    ]);

    return (
        <Root>
            {/*entire menu container */}
            <Container
                backgroundColor={"black"}
                borderColor={"white"}
                borderWidth={2}
                height={150}
                width={250}
            >
                {/*visual indications container */}
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
                        Visual Indications :
                    </Text>
                    {/*selectable visual indications container, scroll feature enabled */}
                    <Container
                        width={120}
                        flexDirection={"column"}
                        alignItems={"center"}
                        gap={2}
                        maxHeight={250}
                        overflow={"scroll"}
                        scrollbarWidth={0}
                    >
                        {/*draw every existing visual indication */}
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
                {/*feedback effect container */}
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
                    {/*selectable feedback effect container, scroll feature enabled */}
                    <Container
                        width={120}
                        flexDirection={"column"}
                        alignItems={"center"}
                        gap={2}
                        maxHeight={250}
                        overflow={"scroll"}
                        scrollbarWidth={0}
                    >
                        {/*draw every existing feedback effect */}
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
