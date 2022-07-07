import React, {Component} from 'react';
import {Image} from 'semantic-ui-react'
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
                    <a href="https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/93380629908989276154329187712159695682604484101294988604591734366325570535524"
                       target="_blank" className={`${styles__footer.link} a__link__secondary`}>
                        <span>The Traveler DAO</span>
                    </a>, a
                    <a target="_blank" href={this.props.state.tripsCommunity} className={`${styles__footer.link} a__link__secondary`}>
                        <span>TripsCommunity DAO</span>
                    </a>

                    <br/>
                    <br/>
                    Website and Smart Contract's code are
                        <a target="_blank" rel="noopener noreferrer" href="https://github.com/jacmos3/LittleTraveler" className={`${styles__footer.link} a__link__secondary`}>
                            <span>open-source</span>
                        </a>
                    and licensed under MIT license.
                    <br/>
                    The Little Traveler NFTs are Public Domain.
                    <div className="flex py-8 w-full justify-center space-x-6">
                        <Image className="mx-2" src="https://i.creativecommons.org/p/zero/1.0/88x31.png"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
