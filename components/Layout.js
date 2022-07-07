import React, {Component} from 'react';
import {Container} from 'semantic-ui-react';
import {useRouter} from "next/router"; // Routing
import Link from "next/link"; // Routing
import Head from './Head';
import Footer from './Footer';
import styles from "../styles/components/Layout.module.scss"; // Styles

class Layout extends Component {
    constructor(props) {
        super(props);
    }


    render() {

        const links = [
            // { name: "FAQ", path: "/faq" },
            // { name: "Resources", path: "/resources" },
        ];

        return (
            <div>
                <Head/>
                {this.props.children}
                <Footer state={this.props.state}/>
            </div>
        )
    };
}
export default Layout;
