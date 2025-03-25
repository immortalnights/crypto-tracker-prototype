import { Image, StyleSheet, Platform, View } from "react-native"

import { HelloWave } from "@/components/HelloWave"
import ParallaxScrollView from "@/components/ParallaxScrollView"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { usePopularCurrencies } from "@/hooks/usePopularCurrencies"
import { Cryptocurrency } from "@/types"

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

function CryptocurrencyItem({ id, name, price, change }: Cryptocurrency) {
    return (
        <View style={{ marginBottom: 20 }}>
            <ThemedText
                type="defaultSemiBold"
                style={{ display: "flex", gap: 12 }}
            >
                <CryptocurrencyIcon symbol={id} />
                {id} &#183; {name}
            </ThemedText>
            <ThemedText type="default">£{price.toFixed(2)} | change</ThemedText>
        </View>
    )
}

function CryptocurrencyList({ items }: { items: Cryptocurrency[] }) {
    return (
        <ThemedView>
            {items.map((item) => (
                <CryptocurrencyItem {...item} />
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
