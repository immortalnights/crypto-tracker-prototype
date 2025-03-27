import AntDesign from "@expo/vector-icons/AntDesign"
import { ThemedText } from "../ThemedText"

export default function ChangePercent({
    value,
}: {
    value: number | undefined
}) {
    let content
    if (value !== undefined) {
        const direction =
            value < 0 ? ("decreasing" as const) : ("increasing" as const)
        content = (
            <ThemedText
                style={{
                    color: direction === "increasing" ? "green" : "red",
                    textAlign: "right",
                    fontSize: 12,
                    lineHeight: 16,
                }}
            >
                {direction === "increasing" ? (
                    <AntDesign name="caretup" size={10} />
                ) : (
                    <AntDesign name="caretdown" size={10} />
                )}
                {value.toFixed(2)}%
            </ThemedText>
        )
    }

    return content
}
