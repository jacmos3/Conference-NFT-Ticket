import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card,Icon} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/Web3Sections/ClaimingForm.module.scss";
import confetti from 'canvas-confetti';

class ClaimingForm extends Component{
  state = {
    loading:0,
    errorMessage:"",
    warningMessage:"",
    successMessage:"",
    chain:{},
    adjustedPrice:0.00,
    checked:true,
    buttonLabel: "Mint",
    all:[],
    multiplier:1.2,
    isOwningLittleTraveler : false,
    lTPercentageDiscount : 0,
    usdPrice:0,
    priceBeforeDiscount:0
  }
  constructor(props){
    super(props);
  }

  async componentDidMount(){
    var myChain = this.props.state.web3Settings.chains
      .filter(chain => chain.id === this.props.state.web3Settings.networkId);
    //var coin = myChain.map(chain => chain.options.coin)[0];
    this.setState({chain:myChain[0]});
    await this.fetchInitialInfo(true);
    const coingeckoPrice = await fetch(
     'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
    );
    const data = await coingeckoPrice.json();
    this.setState({ usdPrice: data["matic-network"].usd });

  }

  happyShalala(){
    const confetti = require('canvas-confetti').default;

    var count = 200;
    var defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  async isOwningLittleTraveler(){
    console.log("is owning little traveler?");
    try{
      const accounts= await this.props.state.web3.eth.getAccounts();
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.ltAddr);
      let lastUserIndex = await instance.methods.balanceOf(accounts[0]).call()
      .then((result) =>{
          return JSON.parse(result);
      })
      .catch((error) =>{
        console.log(error);
      });

      this.setState({isOwningLittleTraveler: lastUserIndex > 0 ? true : false});
      console.log(lastUserIndex);
    }catch(err){
      this.setState({errorMessage: err.message});
    }
  }

  async fetchInitialInfo(firstFetch) {
      console.log("start initial Info");
      this.setState({checked:false,loading: this.state.loading +1, errorMessage: '',successMessage:''});
      try {
          const accounts = await this.props.state.web3.eth.getAccounts();
          const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.addr);
          let lTPercentageDiscount = await instance.methods.lTPercentageDiscount().call();
          console.log("percentage: "+lTPercentageDiscount);
          let paused = await instance.methods.paused().call();
          if (paused){
            console.log("minting paused");
            this.setState({adjustedPrice,buttonLabel:"Minting paused",loading: this.state.loading +1,errorMessage:"The NFT minting has been paused. Come back later!"});
            return false;
          }

          let totalSupply = parseInt(await instance.methods.totalSupply().call());
          let maxSupply = parseInt(await instance.methods.MAX_ID().call());

          if (totalSupply >= maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Minting finished",loading: this.state.loading +1});
            return false;
          }

          if (firstFetch){
            this.fetchNFTList();
          }

          let priceBeforeDiscount = this.props.state.web3.utils.fromWei(await instance.methods.price().call());
          await this.isOwningLittleTraveler();

          let adjustedPrice = (this.state.isOwningLittleTraveler ? (priceBeforeDiscount - (priceBeforeDiscount * lTPercentageDiscount) / 100) : 1 * priceBeforeDiscount).toFixed(18);
          if (adjustedPrice > this.props.state.web3Settings.ethBalance){
            console.log("You do not have enough money");
            this.setState({totalSupply,adjustedPrice,lTPercentageDiscount, priceBeforeDiscount, loading: this.state.loading +1,
              errorMessage:`Minting a ticket requires ${adjustedPrice} $${this.state.chain.coin}
              and in your address there are only ${this.props.state.web3Settings.ethBalance} $${this.state.chain.coin} right now.`});
            return false;
          }

          //console.log("info retrieved, result: " + totalSupply + " " + maxSupply + " " + price + " " + paused);
          this.setState({totalSupply,priceBeforeDiscount,maxSupply,adjustedPrice, lTPercentageDiscount, loading: this.state.loading -1, errorMessage: ""});
          console.log("end try Info - success");

          return adjustedPrice;
      } catch (err) {
        console.log(err);
          this.setState({loading: this.state.loading -1, errorMessage: err.message});
          console.log("end try Info - failed");
          return false;
      }

      this.setState({errorMessage: ""});
      console.log("end initial Info");
      return true;
  }


  onMint = async (event) => {
    event.preventDefault();
    console.log("start mint");
    this.setState({loading:this.state.loading+1, errorMessage:'',warningMessage: "Confirm the transaction on your wallet and then wait for confirmation...",successMessage:''})
    try{
      const accounts= await this.props.state.web3.eth.getAccounts();
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.addr );
      await instance.methods.claimByPatrons(this.state.checked)
        .send({
          from:accounts[0],
          value:(this.props.state.web3.utils.toWei(this.state.adjustedPrice.toString(),"ether"))
        });
      this.fetchNFTList();
      this.fetchInitialInfo(false); //dont move it under the setState, otherwise the successMessage would be overwritten
      this.setState({successMessage:"Minting successfull! check your ticket below", errorMessage: ""});
      this.happyShalala();
    }
    catch(err){
      this.fetchInitialInfo(false);
      this.setState({errorMessage: err.message, warningMessage: ""});
    }


    this.setState({loading:this.state.loading-1,warningMessage: ""});
    console.log("end mint");
  }

  fetchNFTList = async () => {
    console.log("start fetching");
      this.setState({loading:this.state.loading+1, errorMessage:'', warningMessage:'',successMessage:''})
      try{
        const accounts= await this.props.state.web3.eth.getAccounts();
        const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.addr );
        let lastUserIndex = await instance.methods.balanceOf(accounts[0]).call()
        .then((result) =>{
            return JSON.parse(result);
        })
        .catch((error) =>{
          console.log(error);
        })
        let all = [];
        for (let index = 0; index < lastUserIndex; index++){
          let tokenId = await instance.methods.tokenOfOwnerByIndex(accounts[0],index).call()
          .then((result) =>{
            return result;
          })
          .catch((error)=>{
            console.log(error);
          });

          let uri = await instance.methods.tokenURI(tokenId).call()
          .then((result)=> {
            return JSON.parse(window.atob(result.split(',')[1]));

          })
          .catch((error)=>{
            console.log(error);
          });

          let element = {
            "key": uri.name,
            "header": <div className="text-center">{uri.name}</div>,
            "image":uri.image,
            "extra":<div className="text-center"><a target="_blank" href={this.state.chain.marketCard.replace("[PH_ADDR]",this.state.chain.addr).replace("[PH_ID]",uri.name.replace("Ticket #",""))}>Trade on secondary market</a></div>,
          };
          all.push(element);
          //console.log(uri);
          this.setState({all:all});
        }
        this.setState({minted:true});
      }catch(err){
        this.setState({errorMessage: err.message});
      }
      this.setState({loading:this.state.loading-1});
      console.log("end fetching");
    }

  handleClick = (e, { checked }) => {
    if (this.state.loading > 0){
      return;
    }
    console.log("cheked: " + checked);
    var adjustedPrice = (checked ? this.state.adjustedPrice * this.state.multiplier : this.state.adjustedPrice / this.state.multiplier).toFixed(18);

    var errorMessage = "";
    if (adjustedPrice > this.props.state.web3Settings.ethBalance){
      console.log("You do not have enough money");
      errorMessage = `Minting a ticket requires ${adjustedPrice} $${this.state.chain.coin} and in your address there are only ${this.props.state.web3Settings.ethBalance} $${this.state.chain.coin} right now. You need to refill your wallet with more $${this.state.chain.coin}`;
    }
    else{
      errorMessage:"";
    }
    this.setState({errorMessage,adjustedPrice,checked});
  }

  render(){
    return (
      <Container>
      <h2 className="text-center">You are minting NFT ticket #{1 + this.state.totalSupply}</h2>
      <br />
          <Form error={!!this.state.errorMessage} warning={!!this.state.warningMessage} success={!!this.state.successMessage} className= {`${styles.form}`}>
                <Form.Field>
                <h3>Next ticket cost: ${this.state.chain.coin} {(1 * this.state.priceBeforeDiscount).toFixed(18)}</h3>
                <div className={`${styles.marginBottom}`} >The price increases following a <a className={`a__underline__primary`} target="_blank" href={this.props.state.lnk_bondingCurve}>bonding curve</a>.</div>
                <Input
                  label={{ basic: true, content: this.state.chain.coin, id:"inputLabel" }}
                  labelPosition='right'
                  placeholder={`${this.state.chain.coin} amount`}
                  readOnly
                  value = {this.state.adjustedPrice}
                />
                <h4>${(this.state.adjustedPrice * this.state.usdPrice).toFixed(2) } at the real time rate of ${this.state.usdPrice} per {this.state.chain.coin}</h4>
                </Form.Field>
                <Form.Field className={`${styles.content}`} >
                <h4>NOTE:</h4>
                {this.state.isOwningLittleTraveler ?
                  <p className="">You are enjoying a {this.state.lTPercentageDiscount}% discount because you own a
                    <a className={`a__underline__primary`} target="_blank" href={this.props.state.lnk_littleTraveler}> Little Traveler NFT</a>
                    <a target="_blank" href={this.props.state.lnk_littleTraveler}><img src = "../../lt.png" alt = "Little Traveler Collection"/></a>
                  </p>
                  :
                  <p>Get a {this.state.lTPercentageDiscount}% discount on ticket price by purchasing a
                    <a className={`a__underline__primary`} target="_blank" href={this.props.state.lnk_littleTraveler}> Little Traveler NFT</a> first
                      <a target="_blank" href={this.props.state.lnk_littleTraveler}><img src = "../../lt.png" alt = "Little Traveler Collection"/></a>
                  </p>
                }
                <h3>Upgrade to <a className={`a__underline__primary`} target="_blank" href={this.props.state.lnk_airdrop}>AIRDROP TICKET</a>:</h3>
                <div>Pay 20% extra (optional) to get airdrops of the speaker's projects tokens</div>
                  <Checkbox
                    toggle
                    onClick={this.handleClick}
                    checked={this.state.checked}
                    disabled ={this.state.loading > 0}
                  />
                </Form.Field>
                <Form.Field>
                  <Message error header="Oops!">
                    {this.state.errorMessage}
                    {this.state.adjustedPrice > this.props.state.web3Settings.ethBalance
                      ?
                      <a className={`text-indigo-800 a__underline__secondary`}
                      target="_blank"
                      href={this.state.chain.buy}> Buy ${this.state.chain.coin} here!</a>
                      :
                      <div></div>
                    }
                  </Message>
                  <Message warning icon >
                    <Message.Content>
                      <Message.Header>Pending user confirmation...</Message.Header>
                      {this.state.warningMessage}
                    </Message.Content>
                    <Icon name='circle notched' loading />
                  </Message>
                  <Message success header="Success!" content = {this.state.successMessage} />
                </Form.Field>

                <div className={`${styles.buttons__component}`}>
                  <button onClick = {this.onMint} className={`btn btn__primary`} disabled={this.state.loading > 0}>
                    {this.state.buttonLabel}
                  </button>
                  <button  className={`btn btn__alternative`} onClick = {this.fetchNFTList} disabled={this.state.loading > 0}>Update</button>
                </div>
              </Form>
              <br />
              <h3 className="text-center">Your ticket(s):</h3>
              {
                this.state.all.length == 0
                ?
                <div className="text-center">Sorry, no tickets found</div>
                :
                  <div style={{padding:"15px"}}>
                    <Card.Group itemsPerRow={3} stackable={true} doubling={true} centered items={this.state.all} />
                  </div>
                }
                {
                  /*
                  <h3 className="text-center">
                    <a className={`a__underline__primary`} target="_blank" href={this.props.state.lnk_how_to_access}>How to use the tickets to access the conference</a>
                  </h3>
                  */
                }
      </Container>
    )
  };
};
export default ClaimingForm;
