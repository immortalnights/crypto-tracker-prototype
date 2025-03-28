import { Cryptocurrency } from "@/types"
import { useEffect, useState } from "react"

export function useHistoricCurrencyPrices(
    symbol: string,
    fiat: string = "GBP",
) {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/price/${symbol}-${fiat}/1-hour`

    const [data, setData] = useState<number[]>()
    const get = async () => {
        const res = await fetch(url)
        if (res.ok) {
            setData(await res.json())
        } else {
            console.error(`Failed to fetch from ${url}`)
            throw new Error(`Failed to fetch from '${url}'`)
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
