import { Cryptocurrency } from "@/types"
import { useEffect, useState } from "react"

export function useCryptocurrency(symbol: string) {
    const [data, setData] = useState<Cryptocurrency>()
    const get = async () => {
        const res = await fetch("http://127.0.0.1/popular-currencies/")
        if (res.ok) {
            const json = await res.json()

            if (json) {
                setData(
                    json.find(
                        (item: unknown) =>
                            item &&
                            typeof item === "object" &&
                            "id" in item &&
                            item.id === symbol,
                    ),
                )
            }
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
