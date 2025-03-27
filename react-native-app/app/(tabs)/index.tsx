import { Image, StyleSheet, View, TouchableHighlight } from "react-native"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { usePopularCurrencies } from "@/hooks/usePopularCurrencies"
import { Cryptocurrency } from "@/types"
import AntDesign from "@expo/vector-icons/AntDesign"

function CryptocurrencyIcon({ symbol }: { symbol: string }) {
    let source
    switch (symbol) {
        case "BTC": {
            source = require("@/assets/images/btc.svg")
            break
        }
        case "ETH": {
            source = require("@/assets/images/eth.svg")
            break
        }
        case "SOL": {
            source = require("@/assets/images/sol.svg")
            break
        }
        case "XRP": {
            source = require("@/assets/images/xrp.svg")
            break
        }
        case "LTC": {
            source = require("@/assets/images/ltc.svg")
            break
        }
    }

    return <Image source={source} style={{ width: 32, height: 32 }} />
}

function Price({ value }: { value: number | undefined }) {
    return (
        <ThemedText style={{ fontSize: 14, lineHeight: 16 }}>
            {value !== undefined ? `£${value.toFixed(2)}` : ``}
        </ThemedText>
    )
}

function PriceChangePercent({ value }: { value: number | undefined }) {
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
                    <Price value={price} />{" "}
                    <PriceChangePercent value={change} />
                </View>
            </View>
        </TouchableHighlight>
    )
}

function CryptocurrencyList({ items }: { items: Cryptocurrency[] }) {
    return (
        <ThemedView style={{ display: "flex", gap: 16, maxWidth: 260 }}>
            {items.map((item) => (
                <CryptocurrencyItem currency={item} onSelectItem={() => {}} />
            ))}
        </ThemedView>
    )
}

function PopularCryptocurrencies() {
    const currencies = usePopularCurrencies()

    return (
        <ThemedView>
            {currencies ? (
                <CryptocurrencyList items={currencies} />
            ) : (
                <ThemedText>Loading...</ThemedText>
            )}
        </ThemedView>
    )
}

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            headerImage={
                <Image
                    source={require("@/assets/images/partial-react-logo.png")}
                    style={styles.reactLogo}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Popular Cryptocurrencies!</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <PopularCryptocurrencies />
            </ThemedView>
        </ParallaxScrollView>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: "absolute",
    },
})
