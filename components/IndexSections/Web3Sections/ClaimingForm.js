import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/Web3Sections/ClaimingForm.module.scss";

class ClaimingForm extends Component{
  state = {
    loading:0,
    errorMessage:"",
    warningMessage:"",
    successMessage:"",
    coin:"",
    price:0,
    address:"0x924c07526ed4d528f868bb82a164fb95a69e323a",
    checked:true,
    buttonLabel: "Mint",
    all:[],
    multiplier:1.2
  }
  constructor(props){
    super(props);
  }

  componentDidMount(){
    var coin = this.props.state.web3Settings.chains
      .filter(chain => chain.id === this.props.state.web3Settings.networkId)
      .map(chain => chain.options.coin)[0];
    console.log("filter done");
    console.log(coin);
    this.setState({coin:coin});

    this.fetchInitialInfo(true);
  }

  async fetchInitialInfo(firstFetch) {
      console.log("start initial Info");
      this.setState({loading: this.state.loading +1, errorMessage: '',successMessage:''});
      try {
          const accounts = await this.props.state.web3.eth.getAccounts();
          const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address);
          console.log("retrieving ticket price");
          let paused = await instance.methods.paused().call();
          if (paused){
            console.log("minting paused");
            this.setState({buttonLabel:"Minting paused",loading: this.state.loading +1});
            return false;
          }

          let totalSupply = parseInt(await instance.methods.totalSupply().call());
          let maxSupply = parseInt(await instance.methods.MAX_ID().call());
          let price = parseInt(await instance.methods.price().call());

          if (totalSupply >= maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Minting finished",loading: this.state.loading +1});
            return false;
          }

          //console.log("info retrieved, result: " + totalSupply + " " + maxSupply + " " + price + " " + paused);
          this.setState({loading: this.state.loading -1, errorMessage: "",totalSupply,maxSupply,price});
          console.log("end try Info - success");
          if (firstFetch){
            this.fetchNFTList();
          }
          return price;
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
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address );
      //console.log(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()));
      //await instance.methods.claimByPatrons(this.state.checked).send({from:accounts[0], value:(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()))});
      console.log(!this.state.checked ? Math.trunc(this.state.price *1.2).toString() : this.state.price.toString() );
      await instance.methods.claimByPatrons(!this.state.checked).send({from:accounts[0], value:(!this.state.checked ? Math.trunc(this.state.price *1.2).toString() : this.state.price.toString())});
      this.fetchNFTList();
      this.fetchInitialInfo(false);
      this.setState({successMessage:"Minting successfull! check your ticket below:"});
    }
    catch(err){
      this.setState({errorMessage: err.message,warningMessage: ""});
      this.fetchInitialInfo(false);
    }


    this.setState({loading:this.state.loading-1,warningMessage: ""});
    console.log("end mint");
  }

  fetchNFTList = async () => {
    console.log("start fetching");
      this.setState({loading:this.state.loading+1, errorMessage:'', warningMessage:'',successMessage:''})
      try{
        const accounts= await this.props.state.web3.eth.getAccounts();
        const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address );
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

          let element = {"header": <div className="text-center">{uri.name}</div>,"image":uri.image,"extra":<div className="text-center"><a href="https://epor.io/#">Trade on epor.io</a></div>};
          all.push(element);
          console.log(uri);
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
    console.log("cheked: " + checked);
    this.setState({checked:!checked});
  }

  onChange(event){
    event.preventDefault();
    console.log(event.target.value * this.state.coin.amount);
    this.setState({howManyLT: event.target.value});
  }

  render(){
    return (
      <Container>
      <h2 className="text-center">You are minting NFT ticket #{1 + 1 * this.state.totalSupply}</h2>
      <br />
          <Form error={!!this.state.errorMessage} warning={!!this.state.warningMessage} success={!!this.state.successMessage} className= {`${styles.form}`}>
                <Form.Field>
                <h3>Next ticket cost:</h3>
                <div className={`${styles.marginBottom}`} >The price increases following a <a className={`a__underline__primary`} href="#">bonding curve</a>.</div>
                <Input
                  label={{ basic: true, content: this.state.coin.name, id:"inputLabel" }}
                  labelPosition='right'
                  placeholder='Ether amount'
                  readOnly
                  value = {this.state.checked ? this.state.price : Math.trunc(this.state.price * this.state.multiplier)}
                />
                </Form.Field>
                <Form.Field className={`${styles.content}`} >

                <h3>Upgrade to <a className={`a__underline__primary`} href="#">AIRDROP TICKET</a>:</h3>
                <div>Pay 20% extra (optional) to get airdrops of the speaker's projects tokens</div>
                  <Checkbox
                    toggle
                    onClick={this.handleClick}
                  />
                </Form.Field>
                <Form.Field>
                  <Message error header="Oops!" content = {this.state.errorMessage} />
                  <Message warning header="Pending user confirmation..." content = {this.state.warningMessage} />
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
                <h3 className="text-center">
                  <a className={`a__underline__primary`} href="#">How to use the tickets to access the conference</a>
                </h3>
      </Container>
    )
  };
};
export default ClaimingForm;
