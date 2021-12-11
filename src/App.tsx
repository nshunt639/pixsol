import {BrowserRouter as Router} from 'react-router-dom'

import {ThemeProvider} from '@material-ui/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from './theme'

import {SnackbarProvider} from 'context'
import Snackbar from 'components/shared/Snackbar'

import * as anchor from '@project-serum/anchor'
import {clusterApiUrl} from '@solana/web3.js'
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base'
import {getPhantomWallet, getSolflareWallet, getSolletWallet} from '@solana/wallet-adapter-wallets'

import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react'

import {WalletDialogProvider} from '@solana/wallet-adapter-material-ui'
import {useMemo} from 'react'
import {SOLANA_NETWORK, SOLANA_RPC_HOST} from 'config/constants'

import AppRouter from 'router'

const network = SOLANA_NETWORK as WalletAdapterNetwork

const connection = new anchor.web3.Connection(SOLANA_RPC_HOST!)

const App = () => {
    const endpoint = useMemo(() => clusterApiUrl(network), [])

    const wallets = useMemo(() => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()], [])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider>
                <ConnectionProvider endpoint={endpoint}>
                    <WalletProvider wallets={wallets} autoConnect>
                        <WalletDialogProvider>
                            <Router>
                                <AppRouter connection={connection} />
                            </Router>
                        </WalletDialogProvider>
                    </WalletProvider>
                </ConnectionProvider>
                <Snackbar />
            </SnackbarProvider>
        </ThemeProvider>
    )
}

export default App
