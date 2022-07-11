import React, {Component} from 'react';
import styles from "../../styles/components/Presentation.module.scss";
import Claim from './Claim.js';

class Presentation extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`${styles.hero__img}`}>
                <div className={styles.presentation__content}>
                    <div className={`${styles.text__content}`}>
                        <h1 className={`${styles.title} text-trips-1 text-center`}>Mint a conference <br />NFT Ticket!</h1>
                        <div className={`${styles.text__description} text-trips-1 text-center`}>

                        <div className={`${styles.img}`} >
                          <img width="480px" src={'/img/Ticket.svg'}/>
                        </div>

                        <div className={`${styles.button__component}`}>
                            <a href="#Claim">
                                <button id="btnClaim" className={`btn btn__primary`}  onClick={this.props.connect}>
                                    Mint NFT ticket
                                </button>
                            </a>

                            <a href="#Sponsorship">
                                <button id = "btnSponsorship" className={`btn btn__alternative`}  onClick={this.props.connect}>
                                    Become Sponsor
                                </button>
                            </a>
                        </div>
                        </div>
                    </div>

                        <div className={`${styles.social__component}`}>
                            { /*
                              <a
                                href={this.props.state.opensea}
                                target="_blank">
                                <img className={`btn btn__secondary`} src="../img/social/opensea.svg" alt="Opensea"/>
                            </a>
                            */
                            }
                            <a
                                href={this.props.state.twitter}
                                target="_blank">
                                <img className={`btn btn__secondary`} src="../img/social/twitter.svg" alt="Twitter"/>
                            </a>
                            <a
                                href={this.props.state.discord}
                                target="_blank">
                                <img className={`btn btn__secondary`} src="../img/social/discord.svg" alt="Discord"/>
                            </a>
                        </div>

                </div>
            </div>
        )
    };
}

export default Presentation;
