import { Cryptocurrency } from "@/types"
import React from "react"
import { TouchableHighlight, View } from "react-native"
import { ThemedText } from "../ThemedText"
import { ThemedView } from "../ThemedView"
import Price from "./Price"
import ChangePercent from "./ChangePercent"
import CryptocurrencyIcon from "./CryptocurrencyIcon"
import { useRouter } from "expo-router"

function CryptocurrencyItem({
    currency: { id, name, price, change },
    onSelectItem,
}: {
    currency: Cryptocurrency
    onSelectItem: () => void
}) {
    return (
        <TouchableHighlight onPress={onSelectItem}>
            <View
                style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
                    <View style={{ display: "flex", justifyContent: "center" }}>
                        <CryptocurrencyIcon symbol={id} />
                    </View>
                    <View style={{ display: "flex", flexDirection: "column" }}>
                        <ThemedText type="defaultSemiBold">{name}</ThemedText>
                        <ThemedText
                            type="default"
                            style={{
                                color: "darkgray",
                                fontSize: 14,
                                lineHeight: 16,
                            }}
                        >
                            {id}
                        </ThemedText>
                    </View>
                </View>
                <View
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <Price value={price} />
                    <ChangePercent value={change} />
                </View>
            </View>
        </TouchableHighlight>
    )
}

export default function CryptocurrencyList({
    items,
}: {
    items: Cryptocurrency[]
}) {
    const { navigate } = useRouter()

    return (
        <ThemedView style={{ display: "flex", gap: 16, maxWidth: 260 }}>
            {items.map((item) => (
                <CryptocurrencyItem
                    key={item.id}
                    currency={item}
                    onSelectItem={() => navigate(`./${item.id}`)}
                />
            ))}
        </ThemedView>
    )
}
