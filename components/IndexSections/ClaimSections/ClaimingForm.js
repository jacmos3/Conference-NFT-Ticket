import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/claimSections/ClaimingForm.module.scss";

class ClaimWithEther extends Component{
  state = {
    loading:0,
    errorMessage:"",
    coin:"",
    price:0,
    address:"0xc710e8e155d08F5c9b07722C02221E3f904BE518",
    checked:true,
    buttonLabel: "Mint",
    all:[]
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

      this.setState({loading: this.state.loading + 1, errorMessage: ''});
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

          if (totalSupply > maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Minting finished",loading: this.state.loading + 1});
            return false;
          }

          console.log("info retrieved, result: " + totalSupply + " " + maxSupply + " " + price + " " + paused);
          //let checkAllowance = parseInt(this.props.state.web3.utils.fromWei(allowanceAmount, 'ether')) >= this.state.howMuchTrips;
          this.setState({totalSupply,maxSupply,price});
          //console.log("allowanceAmount: " + checkAllowance + ", trips: " + this.state.howMuchTrips);

          this.setState({loading: this.state.loading - 1, errorMessage: ""});
          return price;
      } catch (err) {
        console.log(err);
          this.setState({loading: this.state.loading - 1, errorMessage: err.message});
          this.fetchInitialInfo();
          return false;
      }

      this.setState({loading: this.state.loading - 1, errorMessage: ""});
      return true;
  }


  onMint = async (event) => {
    event.preventDefault();
    console.log("mint");

    this.setState({loading:this.state.loading+1, errorMessage:''})
    try{
      const accounts= await this.props.state.web3.eth.getAccounts();
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address );
      //console.log(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()));
      //await instance.methods.claimByPatrons(this.state.checked).send({from:accounts[0], value:(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()))});
      console.log(!this.state.checked ? Math.trunc(this.state.price *1.2).toString() : this.state.price.toString() );
      await instance.methods.claimByPatrons(!this.state.checked).send({from:accounts[0], value:(!this.state.checked ? Math.trunc(this.state.price *1.2).toString() : this.state.price.toString())});
      this.fetchNFTList();
      this.fetchInitialInfo();
    }
    catch(err){
      this.setState({errorMessage: err.message});
      this.fetchInitialInfo();
    }
    this.setState({loading:this.state.loading-1});
  }

  fetchNFTList = async () => {
      this.setState({loading:this.state.loading+1, errorMessage:''})
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

          let element = {"header": uri.name,/*"description":uri.description,*/"image":uri.image};
          all.push(element);
          console.log(uri);
          this.setState({all:all});
        }
        this.setState({minted:true});
        //console.log(this.state.all.description);

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
        <Form error={!!this.state.errorMessage} className= {`${styles.form}`}>
              <Form.Field>
              <h3>Next ticket cost:</h3>
              <Input
                label={{ basic: true, content: this.state.coin.name, id:"inputLabel" }}
                labelPosition='right'
                placeholder='Ether amount'
                readOnly
                value = {this.state.checked ? this.state.price : Math.trunc(this.state.price *1.2)}
              />
              </Form.Field>
              <Form.Field className={`${styles.content}`} >
              <h3>Airdrop:</h3>
                <Checkbox
                toggle
                onClick={this.handleClick}
                  />
              </Form.Field>
              <Form.Field>
                <Message error header="Oops!" content = {this.state.errorMessage} />
              </Form.Field>

              <div className={`${styles.buttons__component}`}>

                <button onClick = {this.onMint} className={`btn btn__primary`} disabled={this.state.loading > 0}>
                  {this.state.buttonLabel}
                </button>
                <button  className={`btn btn__alternative`} onClick = {this.fetchNFTList} disabled={this.state.loading > 0} >Refresh</button>

              </div>
            </Form>
            <div style={{padding:"15px"}}>
              <Card.Group itemsPerRow={3} centered items={this.state.all} />
            </div>
    </Container>
  )
};
};
export default ClaimWithEther;
