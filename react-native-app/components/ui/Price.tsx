import { ThemedText } from "../ThemedText"

export default function Price({
    value,
    currency = "£",
}: {
    value: number | undefined
    currency?: string
}) {
    return (
        <ThemedText style={{ fontSize: 14, lineHeight: 16 }}>
            {value !== undefined ? `${currency}${value.toFixed(2)}` : ``}
        </ThemedText>
    )
}
