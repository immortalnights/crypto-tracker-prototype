import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import ChangePercent from "@/components/ui/ChangePercent"
import Chart from "@/components/ui/Chart"
import CryptocurrencyIcon from "@/components/ui/CryptocurrencyIcon"
import Price from "@/components/ui/Price"
import { useCryptocurrency } from "@/hooks/useCryptocurrency"
import { Cryptocurrency } from "@/types"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { ActivityIndicator, View } from "react-native"

function CryptocurrencyDetails({ id, name, price, change }: Cryptocurrency) {
    return (
        <ThemedView style={{ padding: 12, flex: 1 }}>
            <View
                style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    <View
                        style={{
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
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
            <Chart symbol={id} />
        </ThemedView>
    )
}

function CryptocurrencyLoader({ symbol }: { symbol: string }) {
    const data = useCryptocurrency(symbol)

    return data ? (
        <CryptocurrencyDetails {...data} />
    ) : (
        <ThemedText>
            <ActivityIndicator size="small" color="white" /> Loading...
        </ThemedText>
    )
}

export default function List() {
    const r = useRouter()
    const { currency: id } = useLocalSearchParams()

    let content
    if (!Array.isArray(id)) {
        content = <CryptocurrencyLoader symbol={id} />
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen
                options={{ title: "Details" }}
                getId={({ params }) => {
                    console.log("params", params)
                    return ""
                }}
            />
            {content}
        </View>
    )
}
