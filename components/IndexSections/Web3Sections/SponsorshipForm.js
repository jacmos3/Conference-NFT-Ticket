import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card,Image} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/Web3Sections/SponsorshipForm.module.scss";
import Ticket from '../../../public/img/Ticket.svg'
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
    element:{image:"",header:""}
  }
  constructor(props){
    super(props);
  }

  componentDidMount(){
    var myChain = this.props.state.web3Settings.chains
      .filter(chain => chain.id === this.props.state.web3Settings.networkId);

    this.setState({coin:myChain[0].coin, contractAddress:myChain[0].addr});
    this.fetchInitialInfo();
  }

  async fetchInitialInfo() {
      console.log("fetching ticket price");
      this.setState({loading: this.state.loading + 1, errorMessage: ''});
      try {
          const accounts = await this.props.state.web3.eth.getAccounts();
          const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.contractAddress);
          let sponsorPrice = parseInt(this.props.state.web3.utils.fromWei(await instance.methods.sponsorshipPrice().call()));
          let currentSponsor = parseInt(this.props.state.web3.utils.fromWei(await instance.methods.sponsorPayment().call()));
          let paused = await instance.methods.paused().call();
          if (paused){
            console.log("minting paused");
            this.setState({sponsorPrice,currentSponsor,buttonLabel:"Paused",loading: this.state.loading + 1, errorMessage:"The sponsorship program has been paused. Come back later!"});
            return false;
          }

          let totalSupply = parseInt(await instance.methods.totalSupply().call());
          let maxSupply = parseInt(await instance.methods.MAX_ID().call());

          let uri = await instance.methods.tokenURI(0).call()
          .then((result)=> {
            return JSON.parse(window.atob(result.split(',')[1]));
          })
          .catch((error)=>{
            console.log(error);
          });

          let element = {"header":"FAC-SIMILE NFT TICKET","image":uri.image};
          this.setState({element});

          if (totalSupply >= maxSupply){
            console.log("minting finished");
            this.setState({buttonLabel:"Time ended",loading:this.state.loading + 1});
            return false;
          }

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
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.contractAddress );
      await instance.methods.sponsorship(this.state.sponsorQuote.toString()).send({from:accounts[0], value:this.props.state.web3.utils.toWei(this.state.sponsorPrice.toString(),"ether")});
      this.setState({successMessage:"Sponsorizing successfull! Your quote is now in all the conference NFT tickets!"});
    }
    catch(err){
      //console.log(err);
      this.setState({errorMessage: err.message,warningMessage:"",successMessage:''});
    }
    this.fetchInitialInfo();
    this.setState({loading:this.state.loading-1, warningMessage:""});
  }

  replaceText(svg,string){
    let image = svg.split(',');
    let temp = window.atob(image[1]);
    return image[0] + "," + window.btoa(temp.replace(/(?<=SPONSOR: )(.*?)(?=<)/, string));
  }

  handleChange = (e, { value }) => {
    const result = value.replace(/[^a-z0-9 _.,:;!?$()\[\]{}\-\+\*]/gi, '');
    this.setState({ sponsorQuote:result});
    try{

        let temp = this.replaceText(this.state.element.image,result);
        let element = {"header": this.state.element.header,"image":temp};
        this.setState({element});
    }catch(err){
      this.setState({errorMessage: err.message});
    }
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
        <div>
          <h3 className="text-center text-trips-1">Preview</h3>
          <p className="text-indigo-800">
          This is a fac-simile NFT ticket containing the current sponsor quote.
          <br />Please note: this is an example NFT. By becoming a sponsor you are <strong>not</strong> going to mint any NFT.
          <br /><strong>Becoming Sponsor</strong> means <strong>replacing</strong> the current Sponsor quote <strong>with your Company Name</strong> (or quote) into the NFTs.
          <br />Your sentence will appear in all the {this.state.totalSupply} Conference Ticket NFTs already minted and in any NFT ticket that will be minted.

          </p>
          <div className={`${styles.centerCard}`}>
            {this.state.element.header.length > 0
              ? <Card >
              <Image src={this.state.element.image} wrapped ui={false} />
                <Card.Content>
                  <Card.Header>{this.state.element.header}</Card.Header>
                  </Card.Content>
              </Card>
              :<span></span>
            }
        </div>

        <a href ="#Sponsorize">
        <Checkbox
           className={`${styles.checkbox} `}
           label='I have read and understood!'
           onChange={this.setChecked}
         />
         </a>

      </div>
    </div>
    <h2 id="Sponsorize" className="text-center">Become the new Sponsor</h2>
        <Form error={!!this.state.errorMessage} warning={!!this.state.warningMessage} success={!!this.state.successMessage} className= {`${styles.form}`}>
              <Form.Field>
              <h3 className="text-center">Sponsorship price: ${this.state.sponsorPrice} {this.state.coin}</h3>
              {this.state.currentSponsor != 0
                ? <h4 className="text-center">(Old sponsor paid: ${this.state.currentSponsor} {this.state.coin})</h4>
                : <div></div>
              }
              <Input
                  className = {`${styles.padding}`}
                  error = {true}
                  placeholder='[Insert your company name or your sponsor sentence. Max 32 length]'
                  onChange={this.handleChange}
                  maxLength="32"
                  value = {this.state.sponsorQuote}
                  disabled = {!this.state.understood}
              />
              </Form.Field>
              <Form.Field>
                <Message error header="Oops!" content = {this.state.errorMessage} />
                <Message warning header="Pending user confirmation..." content = {this.state.warningMessage} />
                <Message success header="Success!" content = {this.state.successMessage} />
              </Form.Field>
              <div className="text-center">
                By clicking the button below you are offering {this.state.sponsorPrice} {this.state.coin} for the sponsorship
                <button onClick = {this.onSponsorizing} className={`btn btn__primary`} disabled={this.state.loading > 0 || this.state.sponsorQuote.length == 0 || this.state.sponsorQuote.length > 35 || !this.state.understood}>
                  {this.state.buttonLabel}
                </button>
              </div>
            </Form>
    </Container>
  )
};
};
export default SponsorshipForm;
