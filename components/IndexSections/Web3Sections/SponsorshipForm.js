import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/Web3Sections/SponsorshipForm.module.scss";

class SponsorshipForm extends Component{
  state = {
    loading:0,
    errorMessage:"",
    warningMessage:"",
    successMessage:'',
    coin:"",
    sponsorPrice:0,
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
          const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.props.state.web3Settings.contractAddress);
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
          let currentSponsor = parseInt(await instance.methods.sponsorPayment().call())

          if (totalSupply >= maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Time ended",loading:this.state.loading + 1});
            return false;
          }

          //console.log("info retrieved, result: " + totalSupply + " " + maxSupply + " " + sponsorPrice + " " + paused);
          this.setState({totalSupply,maxSupply,sponsorPrice,currentSponsor,loading: this.state.loading - 1, errorMessage: ""});
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

    this.setState({loading:this.state.loading+1, errorMessage:'', warningMessage: "Confirm the transaction on your wallet and then wait for confirmation...", successMessage:""})
    try{
      const accounts= await this.props.state.web3.eth.getAccounts();
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.props.state.web3Settings.contractAddress );
      //console.log(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()));
      //await instance.methods.claimByPatrons(this.state.checked).send({from:accounts[0], value:(this.props.state.web3.utils.fromWei(this.state.checked ? this.state.price.toString() : Math.trunc(this.state.price *1.2).toString()))});
      console.log("quote:" + this.state.sponsorQuote.toString() );
      await instance.methods.sponsorship(this.state.sponsorQuote.toString()).send({from:accounts[0], value:this.state.sponsorPrice.toString()});
      this.fetchNFTList();
      this.fetchInitialInfo();
      this.setState({successMessage:"Sponsorizing successfull! check the result below:"});
    }
    catch(err){
      //console.log(err);
      this.setState({errorMessage: err.message,warningMessage:"",successMessage:''});
      this.fetchInitialInfo();
    }
    this.setState({loading:this.state.loading-1, warningMessage:""});
  }

  fetchNFTList = async () => {
      this.setState({loading:this.state.loading+1, errorMessage:'',successMessage:''})
      try{
        const accounts= await this.props.state.web3.eth.getAccounts();
        const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.props.state.web3Settings.contractAddress );
        let totalSupply = parseInt(await instance.methods.totalSupply().call());
        let all = [];
        let start = totalSupply == 0 ? 0 : 1;

        for (let index = start; index <= totalSupply && index <= 20; index++){
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
    const result = value.replace(/[^a-z0-9 _]/gi, '');
    this.setState({ sponsorQuote:result});
  }

  setChecked = (e, data) => {
    this.setState({understood:data.checked});
  }

render(){
  return (
    <Container>
    <h1 className="text-center">Self-sponsorship auction</h1>
    <div className={`${styles.text__description}  text-center border-solid border-4 border-indigo-800 `}>
           <h3 className="text-center text-trips-1">Rules</h3>
      <p className="text-indigo-800">
        <strong>The sponsorship is an ongoing auction.</strong>
      </p>
      <p className= "text-indigo-800">By purchasing it, <strong>you can write a sentence </strong> (usually your company name)
        into the NFT conference tickets.
      </p>
      <p className= "text-indigo-800">
        During the auction period, any new Sponsor can decide to pay 20% more than what you paid,
        <br />In this case their sentence will replace yours <strong>in all the NFT tickets </strong> (those already minted and those that will be minted).
      </p>
      <p className="text-indigo-800">As soon as a new Sponsor pays the upgraded price for acquiring the sponsorship rights, you will:
        <br /><strong>- instantly lose the Sponsor title</strong>
        <br /><strong>- be 100% refunded.</strong>
      </p>
      <p className="text-indigo-800"><strong>The refund happens automatically</strong>, in the same blockchain transaction of the new Sponsor payment.
      </p>
      <p className="text-indigo-800">If it happens, you got free exposure for the period that passed
        <br />between your purchase and the new Sponsor purchase,
        <br />resulting as a temporary free advertisement!
      </p>
      <p className="text-indigo-800">
        <a className={`a__underline__primary`} href={this.props.state.web3Settings.lnk_spnsr_read_more}> Read more... </a>
      </p>
    <br />
     <h3 className="text-center text-trips-1">Invoice</h3>
       <p className="text-indigo-800">
         The auction ends at midnight UTC 30th of September.
         <br />The last standing sponsor can ask for an invoice.
         <br />The other temporary sponsors will have spent nothing and no receipts are needed.
       </p>
       <a href ="#Sponsorize">
       <Checkbox
          className={`${styles.checkbox} `}
          label='I have read and understood!'
          onChange={this.setChecked}
        />
        </a>
    </div>
    <h2 id="Sponsorize" className="text-center">Become the Sponsor</h2>
        <Form error={!!this.state.errorMessage} warning={!!this.state.warningMessage} success={!!this.state.successMessage} className= {`${styles.form}`}>
              <Form.Field>
              <Input
                  error = {true}
                  placeholder='[Insert your company name or your sponsor sentence. Max 35 length]'
                  onChange={this.handleChange}
                  maxLength="35"
                  value = {this.state.sponsorQuote}
                  disabled = {!this.state.understood}
              />
              </Form.Field>
              <Form.Field>
                <Message error header="Oops!" content = {this.state.errorMessage} />
                <Message warning header="Pending user confirmation..." content = {this.state.warningMessage} />
                <Message success header="Success!" content = {this.state.successMessage} />
              </Form.Field>
                  <h3 className="text-center">Sponsorship price: ${this.state.sponsorPrice} xDAI</h3>
                  {this.state.currentSponsor != 0
                    ? <h4 className="text-center">(Old sponsor paid: ${this.state.currentSponsor} xDAI)</h4>
                    : <div></div>
                  }


              <div className={`${styles.buttons__component}`}>
                <button onClick = {this.onSponsorizing} className={`btn btn__primary`} disabled={this.state.loading > 0 || this.state.sponsorQuote.length == 0 || this.state.sponsorQuote.length > 35 || !this.state.understood}>
                  {this.state.buttonLabel}
                </button>
                <button  className={`btn btn__alternative`} onClick = {this.fetchNFTList} disabled={this.state.loading > 0 || !this.state.understood} >Example</button>

              </div>
            </Form>

            <div style={{padding:"15px"}}>
              <Card.Group itemsPerRow={3} stackable={true} doubling={true} centered items={this.state.all} />
            </div>
    </Container>
  )
};
};
export default SponsorshipForm;
