import { View } from "react-native"
import BTC from "@/assets/images/btc.svg"
import ETH from "@/assets/images/eth.svg"
import LTC from "@/assets/images/ltc.svg"
import SOL from "@/assets/images/sol.svg"
import XRP from "@/assets/images/xrp.svg"

export default function CryptocurrencyIcon({ symbol }: { symbol: string }) {
    let source
    let Icon
    switch (symbol) {
        case "BTC": {
            Icon = BTC
            break
        }
        case "ETH": {
            Icon = ETH
            break
        }
        case "SOL": {
            Icon = SOL
            break
        }
        case "XRP": {
            Icon = XRP
            break
        }
        case "LTC": {
            Icon = LTC
            break
        }
        default: {
            throw new Error(`Unhandled cryptocurrency symbol ${symbol}`)
        }
    }

    return (
        <View style={{ width: 42, height: 42, display: "flex" }}>
            <Icon width={32} height={32} style={{ margin: "auto" }} />
        </View>
    )
}
