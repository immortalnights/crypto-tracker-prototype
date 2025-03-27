import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Stack, Link } from "expo-router"
import { View } from "react-native"
import PopularCryptocurrencies from "@/components/ui/PopularCryptocurrencies"

export default function List() {
    return (
        <View>
            <Stack.Screen
                options={{
                    headerTitle: "Popular Cryptocurrencies",
                }}
            />
            <ThemedView>
                <PopularCryptocurrencies />
            </ThemedView>
        </View>
    )
}
