import React, {Component} from 'react';
import styles from "../styles/components/Layout.module.scss"; // Styles
import styles__footer from "../styles/components/Footer.module.scss"; // Styles

class Footer extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        return (
            <div className={`${styles__footer.section__footer}`}>
                <div className={`${styles.footer}`}>
                    Built by
                    <a target="_blank" href={this.props.state.tripsCommunity} className={`${styles__footer.link} a__link__secondary`}>
                        <span>TripsCommunity DAO</span>
                    </a>

                    On

                    <div className={`${styles__footer.img}`} >
                    <a href="https://gnosischain.com"><img src="../img/gnosischain.png" alt="Gnosis chain" /></a>

                    </div>

                    <br/>
                    <br/>
                    Website and Smart Contract's code are
                        <a target="_blank" rel="noopener noreferrer" href="https://github.com/jacmos3/Conference-NFT-Ticket" className={`${styles__footer.link} a__link__secondary`}>
                            <span>open-source</span>
                        </a>
                    and licensed under MIT license.
                    <br/>
                </div>
            </div>
        );
    }
}

export default Footer;
