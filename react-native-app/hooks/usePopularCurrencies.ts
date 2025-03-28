import { Cryptocurrency } from "@/types"
import { useEffect, useState } from "react"

export function usePopularCurrencies() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/popular-currencies/`

    const [data, setData] = useState<Cryptocurrency[]>([])
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
