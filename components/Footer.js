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
                      <a href="https://polygonscan.com/"><img src="../img/polygonchain.svg" alt="Gnosis chain" /></a>
                    </div>
                    <br />
                    <div>
                    Website and Smart Contract's code are
                        <a target="_blank" rel="noopener noreferrer" href={this.props.state.github} className={`${styles__footer.link} a__link__secondary`}>
                            open-source
                        </a>
                    and licensed under MIT license.
                    </div>
                    <br />
                    <div>
                    <a target="_blank" rel="noopener noreferrer" href={this.props.state.policy} className={`${styles__footer.link} a__link__secondary`}>
                        Privacy policy
                    </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
