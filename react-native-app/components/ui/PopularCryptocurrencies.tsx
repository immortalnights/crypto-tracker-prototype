import { usePopularCurrencies } from "@/hooks/usePopularCurrencies"
import { ThemedText } from "../ThemedText"
import { ThemedView } from "../ThemedView"
import CryptocurrencyList from "./CryptocurrencyList"
import { ActivityIndicator } from "react-native"

export default function PopularCryptocurrencies() {
    const currencies = usePopularCurrencies()

    return (
        <ThemedView style={{ flex: 1 }}>
            {currencies ? (
                <CryptocurrencyList items={currencies} />
            ) : (
                <ThemedText>
                    <ActivityIndicator size="small" color="white" /> Loading...
                </ThemedText>
            )}
        </ThemedView>
    )
}
