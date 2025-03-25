import express, { type RequestHandler } from "express"
import { createClient } from "redis"

const t = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("done")
            resolve("Hello")
        }, 1000)
    })
}

const redis = createClient()

const app = express()
const port = 8081

const parseDuration = (duration: string) => {
    const [value, unit] = duration.split("-")

    let valueNumeric
    try {
        valueNumeric = parseInt(value)
    } catch (err) {
        console.error(err)
    }

    let multiplier
    switch (unit) {
        case "minute":
        case "minutes": {
            multiplier = 60 * 1000
            break
        }
        case "hour":
        case "hours": {
            multiplier = 60 * 60 * 1000
            break
        }
        case "day":
        case "days": {
            multiplier = 24 * 60 * 60 * 1000
            break
        }
        case "month":
        case "months": {
            multiplier = 30 * 24 * 60 * 60 * 1000
            break
        }
        case "year": {
            multiplier = 365 * 24 * 60 * 60 * 1000
            break
        }
    }

    return valueNumeric && multiplier
        ? ([valueNumeric, multiplier] as const)
        : undefined
}

const calculateDuration = (duration: string): number => {
    const res = parseDuration(duration)

    let seconds
    if (res) {
        const [value, multiplier] = res
        seconds = value * multiplier
    }

    return seconds ?? 60 * 60 * 1000
}

const asyncHandler = (fn: RequestHandler) =>
    function wrapper(...rest: any[]) {
        const fnReturn = fn(...rest)
        const next = rest[rest.length - 1]
        return Promise.resolve(fnReturn).catch(next)
    }

app.get(
    "/price/:symbol/:duration",
    asyncHandler(async (req, res) => {
        const { symbol, duration } = req.params

        const durationInSeconds = calculateDuration(duration)

        // 1hr default
        const now = Date.now()
        const cutoffTime = now - durationInSeconds
        const key = `history:${symbol.replace("-", "/")}`
        const data = await redis.zRangeByScore(key, cutoffTime, now)

        res.json(data)
    }),
)

app.get(
    "/top-currencies",
    asyncHandler(async (req, res) => {
        const d = await redis.get("price:BTC/GBP")
        console.log(d)
        res.send(d.toString())
    }),
)

const run = async () => {
    await redis.connect()

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

run()
;["SIGTERM", "SIGINT", "SIGUSR2"].forEach((type) => {
    process.once(type, async () => {
        try {
            await redis.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
