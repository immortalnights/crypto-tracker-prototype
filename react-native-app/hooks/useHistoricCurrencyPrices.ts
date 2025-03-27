import { Cryptocurrency } from "@/types"
import { useEffect, useState } from "react"

export function useHistoricCurrencyPrices(
    symbol: string,
    fiat?: string = "GBP",
) {
    const [data, setData] = useState<number[]>()
    const get = async () => {
        const res = await fetch(
            `http://127.0.0.1/price/${symbol}-${fiat}/1-hour`,
        )
        if (res.ok) {
            setData(await res.json())
        }
    }

    useEffect(() => {
        get()

        const interval = window.setInterval(() => {
            get()
        }, 60 * 1000)

        return () => {
            window.clearInterval(interval)
        }
    }, [])

    return data
}
