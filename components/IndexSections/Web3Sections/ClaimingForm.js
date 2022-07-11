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
    address:"0xc710e8e155d08F5c9b07722C02221E3f904BE518",
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

    this.fetchInitialInfo();
  }

  async fetchInitialInfo() {
      console.log("fetching ticket price");

      this.setState({loading: this.state.loading + 1, errorMessage: '',successMessage:''});
      try {
          const accounts = await this.props.state.web3.eth.getAccounts();
          const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address);
          console.log("retrieving ticket price");
          let paused = await instance.methods.paused().call();
          if (paused){
            console.log("minting paused");
            this.setState({buttonLabel:"Minting paused",loading: this.state.loading + 1});
            return false;
          }

          let totalSupply = parseInt(await instance.methods.totalSupply().call());
          let maxSupply = parseInt(await instance.methods.MAX_ID().call());
          let price = parseInt(await instance.methods.price().call());

          if (totalSupply >= maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Minting finished",loading: this.state.loading + 1});
            return false;
          }

          //console.log("info retrieved, result: " + totalSupply + " " + maxSupply + " " + price + " " + paused);
          this.setState({totalSupply,maxSupply,price});

          this.setState({loading: this.state.loading - 1, errorMessage: ""});
          return price;
      } catch (err) {
        console.log(err);
          this.setState({loading: this.state.loading - 1, errorMessage: err.message});
          return false;
      }

      this.setState({loading: this.state.loading - 1, errorMessage: ""});
      return true;
  }


  onMint = async (event) => {
    event.preventDefault();
    console.log("mint");

    this.setState({loading:this.state.loading+1, errorMessage:'',warningMessage: "wait please...",successMessage:''})
    try{
      const accounts= await this.props.state.web3.eth.getAccounts();
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address );
      //console.log(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()));
      //await instance.methods.claimByPatrons(this.state.checked).send({from:accounts[0], value:(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()))});
      console.log(!this.state.checked ? Math.trunc(this.state.price *1.2).toString() : this.state.price.toString() );
      await instance.methods.claimByPatrons(!this.state.checked).send({from:accounts[0], value:(!this.state.checked ? Math.trunc(this.state.price *1.2).toString() : this.state.price.toString())});
      this.fetchNFTList();
      this.fetchInitialInfo();
      this.setState({successMessage:"Minting successfull! check your ticket below:"});
    }
    catch(err){
      this.setState({errorMessage: err.message,warningMessage: ""});
      this.fetchInitialInfo();
    }
    this.setState({loading:this.state.loading-1,warningMessage: ""});
  }

  fetchNFTList = async () => {
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

          let element = {"header": uri.name,"image":uri.image};
          all.push(element);
          console.log(uri);
          this.setState({all:all});
        }
        this.setState({minted:true});
      }catch(err){
        this.setState({errorMessage: err.message});
      }
      this.setState({loading:this.state.loading-1});
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
      <h2 className="text-center">NFT ticket #{this.state.totalSupply} out of {this.state.maxSupply}</h2>
      <br />
          <Form error={!!this.state.errorMessage} warning={!!this.state.warningMessage} success={!!this.state.successMessage} className= {`${styles.form}`}>
                <Form.Field>
                <h3>Next ticket cost:</h3>
                <div >The price increases after every purchase following a bounding curve.</div>
                <Input
                  label={{ basic: true, content: this.state.coin.name, id:"inputLabel" }}
                  labelPosition='right'
                  placeholder='Ether amount'
                  readOnly
                  value = {this.state.checked ? this.state.price : Math.trunc(this.state.price * this.state.multiplier)}
                />
                </Form.Field>
                <Form.Field className={`${styles.content}`} >

                <h3>Airdrop:</h3>
                <div>Select this option for airdrop rights after the conference.</div>
                  <Checkbox
                    toggle
                    onClick={this.handleClick}
                  />
                </Form.Field>
                <Form.Field>
                  <Message error header="Oops!" content = {this.state.errorMessage} />
                  <Message warning header="Pending..." content = {this.state.warningMessage} />
                  <Message success header="Pending..." content = {this.state.successMessage} />
                </Form.Field>

                <div className={`${styles.buttons__component}`}>
                  <button onClick = {this.onMint} className={`btn btn__primary`} disabled={this.state.loading > 0}>
                    {this.state.buttonLabel}
                  </button>
                  <button  className={`btn btn__alternative`} onClick = {this.fetchNFTList} disabled={this.state.loading > 0}>Refresh</button>
                </div>
              </Form>
              <div style={{padding:"15px"}}>
                <Card.Group itemsPerRow={3} centered items={this.state.all} />
              </div>
      </Container>
    )
  };
};
export default ClaimingForm;
