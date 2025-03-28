import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Stack } from "expo-router"
import { View } from "react-native"
import PopularCryptocurrencies from "@/components/ui/PopularCryptocurrencies"
import { ErrorBoundary } from "react-error-boundary"

export default function List() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerTitle: "Popular Cryptocurrencies",
                }}
            />
            <ThemedView style={{ padding: 12, flex: 1 }}>
                <ErrorBoundary fallback={<ThemedText>Error</ThemedText>}>
                    <PopularCryptocurrencies />
                </ErrorBoundary>
            </ThemedView>
        </View>
    )
}
