import {useContext, useEffect, useRef, useState} from 'react'
import {Box, Button, CircularProgress, Container, Grid, Paper, Typography} from '@material-ui/core'
import {SnackbarContext} from 'context'
import Countdown from 'react-countdown'

import useStyles from './Mint.styles'

import * as anchor from '@project-serum/anchor'

import {useWallet} from '@solana/wallet-adapter-react'

// import {
//     CandyMachine,
//     awaitTransactionSignatureConfirmation,
//     getCandyMachineState,
//     mintOneToken
// } from '../../config/candy-machine'

import {
    awaitTransactionSignatureConfirmation,
    CandyMachineAccount,
    getCandyMachineState,
    mintOneToken
} from '../../config/candy-machine'

import {
    CANDY_MACHINE_ID,
    CANDY_START_DATE,
    TRANSACTION_TIMEOUT,
    PRESALE_DISABLED,
    PRESALE_LIMIT,
    PRESALE_WHITELIST,
    PRESALE_DURATION,
    SUPPLY_LIMIT
} from 'config/constants'

const candyMachineId = new anchor.web3.PublicKey(CANDY_MACHINE_ID!)

export interface ProgressProps {
    classes: any
    percent: any
    count: any
}

const Progress = ({classes, percent, count}: ProgressProps) => (
    <Box className={classes.progressContainer}>
        <Box className={classes.progressBack}></Box>
        <Box className={classes.progress} style={{width: `${percent}%`}}></Box>
        <Box className={classes.percent} textAlign="center" style={{left: `${percent}%`}}>
            <Typography variant="body1" style={{fontSize: 10}}>
                {count}
            </Typography>
        </Box>
    </Box>
)

export interface MintProps {
    connection: anchor.web3.Connection
}

const Mint = (props: MintProps) => {
    const classes = useStyles()
    const {showMessage} = useContext(SnackbarContext)

    // const [balance, setBalance] = useState<number>()
    const [isActive, setIsActive] = useState(true) // true when countdown completes
    const [isSoldOut, setIsSoldOut] = useState(false) // true when items remaining is zero
    const [isMinting, setIsMinting] = useState(false) // true when user got to press MINT

    const [remainingCount, setRemainingCount] = useState(0)
    const [redeemdedCount, setRedeemedCount] = useState(0)
    const [availableCount, setAvailableCount] = useState(0)

    const wallet = useWallet()
    const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()

    const isWhitelisted =
        wallet.publicKey && PRESALE_WHITELIST.includes(wallet.publicKey.toBase58())

    // const [mintingCount, setMintingCount] = useState<number>(1)

    const [mintedCount, setMintedCount] = useState<number>(0)
    const presaleReachedToLimit = PRESALE_LIMIT > 0 && mintedCount >= PRESALE_LIMIT

    const [presaleDate, setPresaleDate] = useState(new Date(CANDY_START_DATE))
    const saleDate = new Date(presaleDate.getTime() + PRESALE_DURATION * 1000)

    // const [startDate, setStartDate] = useState(new Date(props.startDate + PRESALE_DURATION))
    const startDate =
        PRESALE_DISABLED || (isWhitelisted && !presaleReachedToLimit) ? presaleDate : saleDate

    const saveMintedCount = (count: Number) => {
        localStorage.setItem('mintedCount', count + '')
    }

    useEffect(() => {
        //Load minted count
        const loadMintedCount = async () => {
            const count = parseInt(localStorage.getItem('mintedCount') ?? '0')
            setMintedCount(isNaN(count) ? 0 : count)
        }
        loadMintedCount()
    }, [])

    const mintOne = async () => {
        try {
            if (wallet.connected && candyMachine?.program && wallet.publicKey) {
                const mintTxId = (await mintOneToken(candyMachine, wallet.publicKey))[0]

                let status: any = {err: true}
                if (mintTxId) {
                    status = await awaitTransactionSignatureConfirmation(
                        mintTxId,
                        TRANSACTION_TIMEOUT,
                        props.connection,
                        true
                    )
                }

                if (!status?.err) {
                    showMessage('Congratulations! Mint succeeded!', 'success')
                    const count = mintedCount + 1
                    setMintedCount(count)
                    saveMintedCount(count)

                    loadCandyMachineState()
                } else {
                    showMessage('Mint failed! Please try again!', 'error')
                }
            }
        } catch (error: any) {
            // TODO: blech:
            let message = error.msg || 'Minting failed! Please try again!'
            if (!error.msg) {
                if (error.message.indexOf('0x138')) {
                } else if (error.message.indexOf('0x137')) {
                    message = `SOLD OUT!`
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`
                    setIsSoldOut(true)
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`
                }
            }

            showMessage(message, 'error')
        }
    }

    const isPresale = () => {
        return new Date().getTime() < saleDate.getTime()
    }

    const hasPresaleReachedToLimit = () => {
        return isPresale() && presaleReachedToLimit
    }

    const handleMint = async () => {
        //Limit check for presale
        if (hasPresaleReachedToLimit()) {
            const leftMin = Math.round((saleDate.getTime() - new Date().getTime()) / (60 * 1000))
            showMessage(
                `You have reached to the limit for presale. Please try again after ${leftMin} minutes.`,
                'error'
            )
            setIsActive(false)
            return
        }

        setIsMinting(true)

        await mintOne()

        setIsMinting(false)
    }

    const loadCandyMachineState = async () => {
        const anchorWallet = {
            publicKey: wallet.publicKey,
            signAllTransactions: wallet.signAllTransactions,
            signTransaction: wallet.signTransaction
        } as anchor.Wallet

        const cndy = await getCandyMachineState(anchorWallet, candyMachineId, props.connection)

        const { goLiveDate, itemsRemaining, itemsRedeemed, itemsAvailable } = cndy.state
        
        setRedeemedCount(itemsRedeemed)

        const itemsAvailable2 =
            SUPPLY_LIMIT > 0 && itemsAvailable > SUPPLY_LIMIT ? SUPPLY_LIMIT : itemsAvailable
        setAvailableCount(itemsAvailable2)

        const itemsRemaining2 =
            SUPPLY_LIMIT > 0 && itemsRemaining > SUPPLY_LIMIT
                ? itemsAvailable2 - itemsRedeemed
                : itemsRemaining
        setRemainingCount(itemsRemaining2)

        setIsSoldOut(itemsRemaining === 0 || (SUPPLY_LIMIT > 0 && itemsRedeemed >= SUPPLY_LIMIT))

        const date = new Date(goLiveDate.toNumber() * 1000)
        setPresaleDate(date)
        setCandyMachine(cndy)
    }

    useEffect(() => {
        ;(async () => {
            if (
                !wallet ||
                !wallet.publicKey ||
                !wallet.signAllTransactions ||
                !wallet.signTransaction
            ) {
                return
            }

            loadCandyMachineState()
        })()
    }, [wallet, candyMachineId, props.connection])

    return (
        <Box className={classes.root}>
            <Container maxWidth="xl">
                <Box textAlign="center">
                    <Typography variant="h2" color="primary">
                        Minting
                    </Typography>
                    <Typography variant="subtitle2">
                        {remainingCount}/{availableCount} Remaining
                    </Typography>
                </Box>
                <Box marginTop={1} textAlign="center">
                    <Box>
                        <Progress
                            classes={classes}
                            percent={(redeemdedCount / availableCount) * 100}
                            count={redeemdedCount}
                        />
                    </Box>
                    <Box mt={1}>
                        {!isSoldOut && !isActive ? (
                            <Countdown
                                date={startDate}
                                onMount={({completed}) => completed && setIsActive(true)}
                                onComplete={() => setIsActive(true)}
                                renderer={renderCounter}
                            />
                        ) : (
                            <Box className={classes.mintButtonWrapper}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={
                                        !wallet.connected || isSoldOut || isMinting || !isActive
                                    }
                                    className={classes.mintButton}
                                    onClick={handleMint}
                                >
                                    {isSoldOut ? 'SOLD OUT' : 'Mint NFT'}
                                </Button>
                                {isMinting && (
                                    <CircularProgress
                                        size={20}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

const renderCounter = ({days, hours, minutes, seconds, props}: any) => {
    return (
        <Typography variant="body1">
            {days ? `${days}:` : ''}
            {hours}:{minutes}:{seconds}
        </Typography>
    )
}

export default Mint
