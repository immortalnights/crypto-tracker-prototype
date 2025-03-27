import { useHistoricCurrencyPrices } from "@/hooks/useHistoricCurrencyPrices"
import React, { PureComponent, useCallback, useRef, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import {
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { ThemedText } from "../ThemedText"
import { type CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart"

function useDebounce<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => callback(...args), delay)
        },
        [callback, delay],
    )
}

export function PriceChart({ data }: { data: number[] }) {
    const [highlightValue, setHighlightValue] = useState<number>()
    // Format data for chart
    const chartData = data.map((entry, index) => ({
        price: Number(entry),
    }))

    const handleMouseMove = useDebounce<CategoricalChartFunc>((e) => {
        if (e.activeTooltipIndex) {
            setHighlightValue(chartData[e.activeTooltipIndex]?.price)
        } else {
            setHighlightValue(undefined)
        }
    }, 10)

    return (
        <>
            <View>
                {highlightValue ? (
                    <ThemedText type="subtitle">
                        £{highlightValue.toFixed(2)}
                    </ThemedText>
                ) : (
                    <ThemedText style={{ lineHeight: 27 }}>&nbsp;</ThemedText>
                )}
            </View>
            <View style={{ height: 500, padding: 6 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        onMouseMove={handleMouseMove}
                    >
                        {/* <CartesianGrid strokeDasharray="3 3" /> */}
                        {/* <XAxis /> */}
                        <YAxis
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tickCount={5}
                        />
                        {/* <Tooltip /> */}
                        <Line
                            type="natural"
                            dataKey="price"
                            dot={false}
                            activeDot={false}
                            stroke="#82ca9d"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </View>
        </>
    )
}

export default function CryptocurrencyChart({ symbol }: { symbol: string }) {
    const data = useHistoricCurrencyPrices(symbol)

    return data ? (
        <PriceChart data={data} />
    ) : (
        <ThemedText style={{ display: "flex", alignItems: "center" }}>
            <ActivityIndicator size="small" color="white" /> Loading...
        </ThemedText>
    )
}
