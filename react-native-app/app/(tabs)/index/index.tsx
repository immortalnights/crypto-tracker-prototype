import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Stack, Link } from "expo-router"
import { View } from "react-native"
import PopularCryptocurrencies from "@/components/ui/PopularCryptocurrencies"

export default function List() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerTitle: "Popular Cryptocurrencies",
                }}
            />
            <ThemedView style={{ flex: 1 }}>
                <PopularCryptocurrencies />
            </ThemedView>
        </View>
    )
}
