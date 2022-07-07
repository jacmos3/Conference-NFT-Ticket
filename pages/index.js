import React, {Component} from 'react';
import Layout from '../components/Layout.js';
import Presentation from '../components/IndexSections/Presentation.js';
import Claim from '../components/IndexSections/Claim.js';

import Space from '../components/IndexSections/Space.js';

import {Header, Button} from 'semantic-ui-react';
//import web3 from '../ethereum/web3';
import {Router} from '../routes';
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import styles from "../styles/pages/INDEX.module.scss";

//import * as UAuthWeb3Modal from "@uauth/web3modal";
//import UAuthSPA from "@uauth/js";

class MyDapp extends Component {
    state = {
        opensea: "https://opensea.io/collection/...",
        etherscan: "https://etherscan.io/",
        twitter: "https://twitter.com/tripscommunity",
        website: "https://web3intravel.com/",
        discord: "https://discord.gg/tripscommunity",
        tripsCommunity: "https://www.tripscommunity.com",
        web3Settings: {
            infura: "aec28327c8c04ea7b712b34da8302791",//ldg
            isWeb3Connected: false,
            chains: [
                {
                  name:"Rinkeby", id:4,
                  opensea:"https://testnets.opensea.io/collection/web3-in-travel-nft-ticket-tbv0qt7nou",
                  openseaCard:"https://testnets.opensea.io/assets/",
                  options:{
                    coin:{
                      name:"xDAI"
                    }
                  }
                }

          ],
        }
    };

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        var web3Settings = this.state.web3Settings;
        web3Settings.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        this.setState({web3Settings: web3Settings});
    }

    update = async (nextState) => {
        console.log("nextState: " + JSON.stringify(nextState));
        this.setState(nextState);
    }

    disconnect = (event) => {
        console.log("disconnect");
        var web3Settings = this.state.web3Settings;
        web3Settings.isWeb3Connected = false;
        this.setState({web3Settings: web3Settings});
    }

    connect = async (event) => {
        var providerOptions = {
            injected: {
                display: {
                    name: "Default",
                    description: "Connect with the provider in your Browser"
                },
                package: null
            },
            walletconnect: {
                display: {
                    name: "Mobile",
                    description: "Scan qrcode with your mobile wallet"
                },
                package: WalletConnectProvider,
                options: {
                    infuraId: this.state.web3Settings.infura // required
                }
            }
        }

        var web3Modal = new Web3Modal({
            network: "rinkeby", // optional
            cacheProvider: false, // optional
            providerOptions // required
        });

        var provider;
        web3Modal.clearCachedProvider();
        try {
            provider = await web3Modal.connect();
            console.log("provider",provider);
        } catch (e) {
            console.log("Could not get a wallet connection", e);
            return;
        }

        var web3 = new Web3(provider);

        provider.on('accountsChanged', function (accounts) {
            console.log("account changed " + accounts[0]);
            window.location.reload();
        })

        provider.on('chainChanged', function (networkId) {
            console.log("chain changed: reloading page");
            window.location.reload();
        })

        provider.on("disconnect", function () {
                console.log("disconnecting");
                provider.disconnect();
                web3Modal.clearCachedProvider();
                provider = null;
            }
        );

        this.setState({web3: web3});
        //console.log(this.state.web3);
        const networkId = await this.state.web3.eth.net.getId();
        const accounts = await this.state.web3.eth.getAccounts();
        //console.log("account:"+ accounts[0]);

        const ethBalance = await this.state.web3.eth.getBalance(accounts[0]) / 10 ** 18;
        // console.log(this.state.web3Settings.isWeb3Connected);
        var web3Settings = this.state.web3Settings;
        web3Settings.account = accounts[0];
        web3Settings.networkId = networkId;
        web3.eth.net.getNetworkType()
            .then((value) => {
                web3Settings.networkName = value;
                this.forceUpdate();
            });

        web3Settings.ethBalance = ethBalance;
        web3Settings.isWeb3Connected = accounts.length > 0;
        this.setState({web3Settings: web3Settings});


        console.log("web3connected:",this.state.web3Settings.isWeb3Connected);
    }

    truncateAddress(address) {
        const begin = address.substring(0, 6).concat("...");
        const end = address.substring(address.length - 6);
        return begin + end;
    }

    render() {
        return (
            <Layout state={this.state}>
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
                                    <button className={`btn btn__wallet`} onClick={this.connect}>
                                        Connect wallet
                                    </button>
                                </a>
                            )
                    }
                </div>

                <Presentation disconnect={this.disconnect} connect={this.connect} state={this.state}/>
                <div id="Claim" className="bg-trips-5">
                  <Claim disconnect={this.disconnect} connect={this.connect} state={this.state}/>
              </div>
            </Layout>
        )
    }
}

export default MyDapp;
