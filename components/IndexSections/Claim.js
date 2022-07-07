import React, {Component} from 'react';
import {Container, Button, Tab} from 'semantic-ui-react';
import styles from "../../styles/components/Claim.module.scss"; // Styles
//import LittleTraveler from '../../ethereum/build/LittleTraveler.sol.json';
import ClaimWithEther from "./ClaimSections/ClaimingForm"


class Claim extends Component {
    state = {
        loading: 0,
        all: [],
        activeIndex: 0
    }

    constructor(props) {
        super(props);
        this.goToFetch = this.goToFetch.bind(this);
    }

    handleTabChange = (e, {activeIndex}) => this.setState({activeIndex});

    goToFetch() {
      this.setState({activeIndex:0});
    }

    render() {
        var option = this.props.state.web3Settings.chains
            .filter(chain => chain.id === this.props.state.web3Settings.networkId)
            .map(chain => chain.options)[0];

        const panes = [
          {
              menuItem: "Yours",
              render: () => <FetchNFTList state={this.props.state}/>
          },
            option && option.coin ?
                {
                    menuItem: 'Mint With ' + option.coin.name,
                    render: () => <ClaimWithEther state={this.props.state} goToFetch={this.goToFetch}/>,
                } : null,

        ]
        return (
            <div className={`${styles.claim__container} py-10 text-trips-1`}>
                <div className="flex justify-around">
                    <div className={`${styles.container} rounded`}>
                        <br/>
                        {
                            this.props.state.web3Settings.isWeb3Connected
                                ? this.props.state.web3Settings.chains
                                    .filter(chain => chain.id === this.props.state.web3Settings.networkId)
                                    .map(chain => chain.options.id).length == 1
                                ?
                                (
                                    <div>
                                        <ClaimWithEther state={this.props.state} goToFetch={this.goToFetch}/>
                                    </div>
                                )
                                : (
                                    <div>
                                        <Container style={{color: "white"}}>
                                            <div style={{padding: "5px"}}>
                                                <div className="text-center">
                                                    <div className={`${styles.modal}`}>
                                                        <p className={`${styles.modal_error_title}`}>Wrong network!</p>
                                                        <p>You are connected to
                                                        netword {this.props.state.web3Settings.networkId} - {this.props.state.web3Settings.networkName}</p>
                                                        <p className={`${styles.modal_error_second_description}`}>Please connect to
                                                        networks:<br/></p>
                                                            {
                                                                this.props.state.web3Settings.chains.map(chain =>
                                                                    <div key={chain.id}>
                                                                        <div>{`${chain.id} - ${chain.name}`}</div>
                                                                    </div>
                                                                )
                                                            }

                                                    </div>
                                                </div>
                                            </div>
                                        </Container>
                                    </div>
                                )
                                : (
                                    <div>
                                        <Container style={{color: "white"}}>
                                            <div style={{padding: "5px"}}>
                                                {
                                                    this.props.state.web3Settings.isWeb3Connected
                                                        ? (
                                                            <Button onClick={this.props.disconnect}>
                                                                {this.props.state.web3Settingsaccount}
                                                            </Button>
                                                        )

                                                        : (
                                                            <div className="text-center">
                                                                <button className={`btn btn__primary`} onClick={this.props.connect}>
                                                                    Connect Wallet
                                                                </button>
                                                            </div>
                                                        )
                                                }
                                            </div>
                                        </Container>
                                    </div>
                                )
                        }
                    </div>
                </div>
            </div>
        )
    };
}

export default Claim;
