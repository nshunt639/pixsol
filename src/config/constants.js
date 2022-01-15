const HOME_URL = process.env.REACT_APP_HOME_URL ?? ''

const CANDY_MACHINE_ID = process.env.REACT_APP_CANDY_MACHINE_ID || ''
const CANDY_START_DATE = process.env.REACT_APP_CANDY_START_DATE
    ? parseInt(process.env.REACT_APP_CANDY_START_DATE)
    : 1635381780000
const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || ''
const SOLANA_RPC_HOST = process.env.REACT_APP_SOLANA_RPC_HOST || ''

const TREASURY_ADDRESS = process.env.REACT_APP_TREASURY_ADDRESS || ''

const PRESALE_DISABLED = process.env.REACT_APP_PRESALE_DISABLED === `true`

const PRESALE_DURATION = process.env.REACT_APP_PRESALE_DURATION != null
    ? parseInt(process.env.REACT_APP_PRESALE_DURATION)
    : 300
const PRESALE_LIMIT = process.env.REACT_APP_PRESALE_LIMIT != null
    ? parseInt(process.env.REACT_APP_PRESALE_LIMIT)
    : 1
const PRESALE_WHITELIST = process.env.REACT_APP_PRESALE_WHITELIST
    ? process.env.REACT_APP_PRESALE_WHITELIST.split(',')
    : [
          '', //client
          'FLiQ37zG3rAimhQFpur1PG8LzYguX3przaPMbjRdbue9' //me
      ]

// const PRESALE_LIMIT = 1
// const PRESALE_WHITELIST = ['empty']

const MINT_ENABLED = process.env.REACT_APP_MINT_ENABLED !== `false`

const SUPPLY_LIMIT = process.env.REACT_APP_SUPPLY_LIMIT
    ? parseInt(process.env.REACT_APP_SUPPLY_LIMIT)
    : 0

const TRANSACTION_TIMEOUT = 30000

export {
    HOME_URL,
    CANDY_MACHINE_ID,
    CANDY_START_DATE,
    SOLANA_NETWORK,
    SOLANA_RPC_HOST,
    TREASURY_ADDRESS,
    PRESALE_DISABLED,
    PRESALE_DURATION,
    PRESALE_LIMIT,
    PRESALE_WHITELIST,
    MINT_ENABLED,
    TRANSACTION_TIMEOUT,
    SUPPLY_LIMIT
}
