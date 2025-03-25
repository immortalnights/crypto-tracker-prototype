import { Cryptocurrency } from "@/types"
import { useEffect, useState } from "react"

export function usePopularCurrencies() {
    const [data, setData] = useState<Cryptocurrency[]>([])
    const get = async () => {
        const res = await fetch("http://127.0.0.1:8081/popular-currencies/")
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
