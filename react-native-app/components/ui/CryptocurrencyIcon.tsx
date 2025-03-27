import { Image } from "react-native"

export default function CryptocurrencyIcon({ symbol }: { symbol: string }) {
    let source
    switch (symbol) {
        case "BTC": {
            source = require("@/assets/images/btc.svg")
            break
        }
        case "ETH": {
            source = require("@/assets/images/eth.svg")
            break
        }
        case "SOL": {
            source = require("@/assets/images/sol.svg")
            break
        }
        case "XRP": {
            source = require("@/assets/images/xrp.svg")
            break
        }
        case "LTC": {
            source = require("@/assets/images/ltc.svg")
            break
        }
    }

    return <Image source={source} style={{ width: 32, height: 32 }} />
}
