import React, {Component} from 'react';
import Layout from '../components/Layout.js';
import Presentation from '../components/IndexSections/Presentation.js';
import Claim from '../components/IndexSections/Claim.js';
import Sponsorship from '../components/IndexSections/Sponsorship.js';
import {Header, Button, Modal} from 'semantic-ui-react';
import { Web3 } from "web3";
import EthereumProvider from "@walletconnect/ethereum-provider";
import styles from "../styles/pages/INDEX.module.scss";

class MyDapp extends Component {
    provider = null;
    walletConnectProvider = null;

    // Named handlers for cleanup
    handleAccountsChanged = (accounts) => {
        console.log("account changed " + accounts[0]);
        window.location.reload();
    }

    handleChainChanged = (networkId) => {
        console.log("chain changed: reloading page");
        window.location.reload();
    }

    handleDisconnect = () => {
        console.log("disconnecting");
        this.cleanupProvider();
    }

    cleanupProvider = () => {
        if (this.provider) {
            try {
                this.provider.removeListener('accountsChanged', this.handleAccountsChanged);
                this.provider.removeListener('chainChanged', this.handleChainChanged);
                this.provider.removeListener('disconnect', this.handleDisconnect);
            } catch(err) {
                console.log("Cleanup error:", err);
            }
            this.provider = null;
        }
        if (this.walletConnectProvider) {
            try {
                this.walletConnectProvider.disconnect();
            } catch(err) {
                console.log("WalletConnect cleanup error:", err);
            }
            this.walletConnectProvider = null;
        }
    }

    componentWillUnmount() {
        this.cleanupProvider();
    }

    state = {
        twitter: process.env.NEXT_PUBLIC_GEN_TWITTER,
        website: process.env.NEXT_PUBLIC_GEN_WEBSITE,
        discord: process.env.NEXT_PUBLIC_GEN_DISCORD,
        tripsCommunity: process.env.NEXT_PUBLIC_GEN_TRIPSCOMMUNITY,
        github: process.env.NEXT_PUBLIC_GEN_GITHUB,
        policy: process.env.NEXT_PUBLIC_GEN_POLICY,
        lnk_bondingCurve:process.env.NEXT_PUBLIC_GEN_LNK_BONDING_CURVE,
        lnk_airdrop:process.env.NEXT_PUBLIC_GEN_LNK_AIRDROP,
        lnk_how_to_access:process.env.NEXT_PUBLIC_GEN_LNK_HOW_TO_ACCESS,
        lnk_spnsr_read_more:process.env.NEXT_PUBLIC_GEN_LNK_SPONSOR_READ_MORE,
        lnk_learn_more:process.env.NEXT_PUBLIC_GEN_LNK_LEARN_MORE,
        lnk_littleTraveler:process.env.NEXT_PUBLIC_LNK_LITTLE_TRAVELER,
        showWalletModal: false,
        web3Settings: {
            isWeb3Connected: false,
            chains: [
                {
                  name:process.env.NEXT_PUBLIC_POLYGON_NAME,
                  id:parseInt(process.env.NEXT_PUBLIC_POLYGON_ID),
                  addr:process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS,
                  marketplace:process.env.NEXT_PUBLIC_POLYGON_MARKETPLACE,
                  marketCard:process.env.NEXT_PUBLIC_POLYGON_MARKETCARD,
                  coin:process.env.NEXT_PUBLIC_POLYGON_COIN,
                  buy:process.env.NEXT_PUBLIC_POLYGON_BUY,
                  ltAddr:process.env.NEXT_PUBLIC_POLYGON_LITTLE_TRAVELER_ADDRESS,
                },
          ],
        }
    };

    constructor(props) {
        super(props);
    }

    update = async (nextState) => {
        console.log("nextState: " + JSON.stringify(nextState));
        this.setState(nextState);
    }

    disconnect = (event) => {
        console.log("disconnect");
        this.cleanupProvider();
        var web3Settings = this.state.web3Settings;
        web3Settings.isWeb3Connected = false;
        this.setState({web3Settings: web3Settings});
    }

    openWalletModal = (event) => {
        let myId = event.target.id.split("btn")[1];
        this.setState({selectedSection: myId, showWalletModal: true});
    }

    closeWalletModal = () => {
        this.setState({showWalletModal: false});
    }

    connectWithMetaMask = async () => {
        this.closeWalletModal();
        if (this.state.web3Settings.isWeb3Connected) return false;

        if (typeof window === "undefined" || !window.ethereum) {
            alert("MetaMask is not installed. Please install MetaMask extension.");
            return;
        }

        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = window.ethereum;
            await this.setupWeb3(provider);
        } catch (e) {
            console.log("Could not connect to MetaMask", e);
        }
    }

    connectWithWalletConnect = async () => {
        this.closeWalletModal();
        if (this.state.web3Settings.isWeb3Connected) return false;

        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
        if (!projectId) {
            alert("WalletConnect Project ID not configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your environment.");
            return;
        }

        try {
            const provider = await EthereumProvider.init({
                projectId: projectId,
                chains: [137], // Polygon mainnet
                showQrModal: true,
                methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
                events: ["chainChanged", "accountsChanged"],
                metadata: {
                    name: "Web3 in Travel NFT Ticket",
                    description: "NFT Ticket system for Web3 in Travel conferences",
                    url: typeof window !== "undefined" ? window.location.origin : "https://web3intravel.com",
                    icons: ["https://web3intravel.com/favicon.ico"]
                },
                rpcMap: {
                    137: "https://polygon-rpc.com"
                }
            });

            await provider.connect();
            this.walletConnectProvider = provider;
            await this.setupWeb3(provider);
        } catch (e) {
            console.log("Could not connect with WalletConnect", e);
        }
    }

    setupWeb3 = async (provider) => {
        var web3 = new Web3(provider);

        // Store provider reference for cleanup
        this.provider = provider;

        // Use named handlers for proper cleanup
        provider.on('accountsChanged', this.handleAccountsChanged);
        provider.on('chainChanged', this.handleChainChanged);
        provider.on('disconnect', this.handleDisconnect);

        this.setState({web3: web3});

        // Web3 v4 returns BigInt - convert to Number
        const networkId = Number(await web3.eth.net.getId());
        const accounts = await web3.eth.getAccounts();

        // Web3 v4 returns BigInt for balance - convert properly
        const balanceWei = await web3.eth.getBalance(accounts[0]);
        const ethBalance = Number(balanceWei) / 10 ** 18;

        var web3Settings = this.state.web3Settings;
        web3Settings.account = accounts[0];
        web3Settings.networkId = networkId;
        web3Settings.networkName = networkId === 137 ? 'polygon' : `chain-${networkId}`;
        web3Settings.ethBalance = ethBalance;
        web3Settings.isWeb3Connected = accounts.length > 0;
        this.setState({web3Settings: web3Settings});

        console.log("web3connected:", this.state.web3Settings.isWeb3Connected);

        if (this.state.selectedSection) {
            document.getElementById(this.state.selectedSection).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    truncateAddress(address) {
        const begin = address.substring(0, 6).concat("...");
        const end = address.substring(address.length - 6);
        return begin + end;
    }

    render() {
        return (
            <Layout state={this.state}>
                <Modal
                    open={this.state.showWalletModal}
                    onClose={this.closeWalletModal}
                    size="tiny"
                    className={styles.walletModal}
                >
                    <Modal.Header>Connect Wallet</Modal.Header>
                    <Modal.Content>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <button
                                className="btn btn__primary"
                                onClick={this.connectWithMetaMask}
                                style={{padding: '15px', fontSize: '16px'}}
                            >
                                MetaMask / Browser Wallet
                            </button>
                            <button
                                className="btn btn__alternative"
                                onClick={this.connectWithWalletConnect}
                                style={{padding: '15px', fontSize: '16px'}}
                            >
                                WalletConnect (Mobile)
                            </button>
                        </div>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.closeWalletModal}>Cancel</Button>
                    </Modal.Actions>
                </Modal>

                <div id="connectWallet">
                    {
                        this.state.web3Settings.isWeb3Connected
                            ? (
                                <a className={`px-5`}>
                                    <button className={`btn btn__wallet`} onClick={this.disconnect}>
                                        {this.truncateAddress(this.state.web3Settings.account)}
                                    </button>
                                </a>
                            )
                            : (
                                <a href="#Claim" className={`px-5`}>
                                    <button id = "btnHome" className={`btn btn__wallet`} onClick={this.openWalletModal}>
                                        Connect wallet
                                    </button>
                                </a>
                            )
                    }
                </div>
                <div id="Home">
                  <Presentation disconnect={this.disconnect} connect={this.openWalletModal} state={this.state} />
                  {
                    this.state.web3Settings.isWeb3Connected
                    ?(
                      <div>
                        {
                          this.state.selectedSection=="Sponsorship"
                          ?
                            <div id="Sponsorship" className="bg-trips-5">
                              <Sponsorship disconnect={this.disconnect} connect={this.openWalletModal} state={this.state}/>
                            </div>
                          :
                            <div id="Claim" className="bg-trips-5">
                              <Claim disconnect={this.disconnect} connect={this.openWalletModal} state={this.state}/>
                            </div>
                        }


                      </div>
                    )
                    :(
                      <div>
                      </div>
                    )
                  }
              </div>
            </Layout>
        )
    }
}

export default MyDapp;
