import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/Web3Sections/SponsorshipForm.module.scss";

class SponsorshipForm extends Component{
  state = {
    loading:0,
    errorMessage:"",
    coin:"",
    sponsorPrice:0,
    address:"0xc710e8e155d08F5c9b07722C02221E3f904BE518",
    checked:true,
    buttonLabel: "Sponsorize!",
    sponsorQuote:"",
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
            this.setState({buttonLabel:"Paused",loading: this.state.loading + 1});
            return false;
          }

          let totalSupply = parseInt(await instance.methods.totalSupply().call());
          let maxSupply = parseInt(await instance.methods.MAX_ID().call());
          let sponsorPrice = parseInt(await instance.methods.sponsorshipPrice().call());

          if (totalSupply >= maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Time ended",loading: this.state.loading + 1});
            return false;
          }

          //console.log("info retrieved, result: " + totalSupply + " " + maxSupply + " " + sponsorPrice + " " + paused);
          this.setState({totalSupply,maxSupply,sponsorPrice});

          this.setState({loading: this.state.loading - 1, errorMessage: ""});
          return sponsorPrice;
      } catch (err) {
        console.log(err);
          this.setState({loading: this.state.loading - 1, errorMessage: err.message});
          return false;
      }

      this.setState({loading: this.state.loading - 1, errorMessage: ""});
      return true;
  }


  onSponsorizing = async (event) => {
    event.preventDefault();
    console.log("sponsorizing");

    this.setState({loading:this.state.loading+1, errorMessage:''})
    try{
      const accounts= await this.props.state.web3.eth.getAccounts();
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.address );
      //console.log(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()));
      //await instance.methods.claimByPatrons(this.state.checked).send({from:accounts[0], value:(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()))});
      console.log("quote:" + this.state.sponsorQuote.toString() );
      await instance.methods.sponsorship(this.state.sponsorQuote.toString()).send({from:accounts[0], value:this.state.sponsorPrice.toString()});
      this.fetchNFTList();
      this.fetchInitialInfo();
    }
    catch(err){
      //console.log(err);
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
        let totalSupply = parseInt(await instance.methods.totalSupply().call());
        let all = [];
        for (let index = 1; index <= totalSupply; index++){
          let uri = await instance.methods.tokenURI(index).call()
          .then((result)=> {
            return JSON.parse(window.atob(result.split(',')[1]));

          })
          .catch((error)=>{
            console.log(error);
          });

          console.log("test"+uri);
          let element = {"header": uri.name,"image":uri.image};
          all.push(element);
          this.setState({all:all});
        }


      }catch(err){
        this.setState({errorMessage: err.message});
      }
      this.setState({loading:this.state.loading-1});
    }

  handleClick = (e, { checked }) => {
    //console.log("cheked: " + checked);
    this.setState({checked:!checked});
  }

  onChange(event){
    event.preventDefault();
    //console.log(event.target.value * this.state.coin.amount);
    this.setState({howManyLT: event.target.value});
  }

  handleChange = (e, { value }) => {
    this.setState({ sponsorQuote:value })
  }

render(){
  return (
    <Container>
    <h2 className="text-center ">Sponsorship Price: ${this.state.sponsorPrice} xDAI</h2>
    <br />
        <Form error={!!this.state.errorMessage} className= {`${styles.form}`}>
              <Form.Field>
              <h3>Insert your quote</h3>
              <Input
                  error = {true}
                  placeholder='Trips Community DAO'
                  onChange={this.handleChange}
              />
              </Form.Field>
              <Form.Field>
                <Message error header="Oops!" content = {this.state.errorMessage} />
              </Form.Field>

              <div className={`${styles.buttons__component}`}>

                <button onClick = {this.onSponsorizing} className={`btn btn__primary`} disabled={this.state.loading > 0 || this.state.sponsorQuote.length == 0 || this.state.sponsorQuote.length > 35}>
                  {this.state.buttonLabel}
                </button>
                <button  className={`btn btn__alternative`} onClick = {this.fetchNFTList} disabled={this.state.loading > 0} >View all</button>


              </div>
            </Form>
            <div style={{padding:"15px"}}>
              <Card.Group itemsPerRow={3} centered items={this.state.all} />
            </div>
    </Container>
  )
};
};
export default SponsorshipForm;
