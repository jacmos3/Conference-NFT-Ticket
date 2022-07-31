import React, {Component} from 'react';
import {Form,Field,Input,Message,Button,Container,Checkbox,Card,Image, Icon} from 'semantic-ui-react';
import Conference from '../../../ethereum/build/Conference.sol.json';
import styles from "../../../styles/components/Web3Sections/SponsorshipForm.module.scss";
import Ticket from '../../../public/img/Ticket.svg';
import confetti from 'canvas-confetti';

class SponsorshipForm extends Component{
  state = {
    account:"",
    loading:0,
    errorMessage:"",
    warningMessage:"",
    successMessage:'',
    chain:{},
    sponsorPrice:0,
    checked:true,
    buttonLabel: "Sponsor!",
    sponsorQuote:"",
    element:{image:"",header:""},
    all:[]
  }
  constructor(props){
    super(props);
  }

  async componentDidMount(){
    var myChain = this.props.state.web3Settings.chains
      .filter(chain => chain.id === this.props.state.web3Settings.networkId);

    const accounts= await this.props.state.web3.eth.getAccounts();
    this.setState({chain:myChain[0], account:accounts[0]});
    this.fetchInitialInfo();
  }

  happyShalala(){
    const confetti = require('canvas-confetti').default;

    var duration = 10 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }

  async fetchInitialInfo() {
      console.log("fetching ticket price");
      this.setState({loading: this.state.loading + 1, errorMessage: ''});
      try {
          const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.addr);
          let sponsorPrice = this.props.state.web3.utils.fromWei(await instance.methods.sponsorshipPrice().call());
          let currentSponsor = this.props.state.web3.utils.fromWei(await instance.methods.sponsorPayment().call());
          let paused = await instance.methods.paused().call();
          if (paused){
            console.log("minting paused");
            this.setState({sponsorPrice,currentSponsor,buttonLabel:"Paused",loading: this.state.loading + 1, errorMessage:"The sponsorship program has been paused. Come back later!"});
            return false;
          }

          if (sponsorPrice > this.props.state.web3Settings.ethBalance){
            console.log("You do not have enough money");
            this.setState({sponsorPrice,currentSponsor,loading: this.state.loading +1,
              errorMessage:`Becoming the new sponsor requires ${sponsorPrice} $${this.state.chain.coin} and in your address there are only ${this.props.state.web3Settings.ethBalance} $${this.state.chain.coin} right now.`});
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

  onSponsorship = async (event) => {
    event.preventDefault();
    console.log("Sponsorship");

    this.setState({loading:this.state.loading+1, errorMessage:'', warningMessage: "Confirm the transaction on your wallet and then wait for confirmation...", successMessage:""})
    try{
      const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.addr );
      await instance.methods.sponsorship(this.state.sponsorQuote.toString()).send({from:this.state.account, value:this.props.state.web3.utils.toWei(this.state.sponsorPrice.toString(),"ether")});
      this.setState({successMessage:"Sponsorship successfull! Your quote is now in all the conference NFT tickets!"});
      this.happyShalala();
    }
    catch(err){
      //console.log(err);
      this.setState({errorMessage: err.message,warningMessage:"",successMessage:''});
    }
    //this.fetchInitialInfo();
    this.fetchNFTList();
    this.setState({loading:this.state.loading-1, warningMessage:""});
  }

  replaceText(svg,string){
    let image = svg.split(',');
    let temp = window.atob(image[1]);
    return image[0] + "," + window.btoa(temp.replace(/(?<=SPONSOR: )(.*?)(?=<)/, string));
  }

  fetchNFTList = async () => {
      this.setState({loading:this.state.loading+1, errorMessage:''})
      try{
        const instance = new this.props.state.web3.eth.Contract(Conference.Web3InTravelNFTTicket.abi, this.state.chain.addr );
        let totalSupply = parseInt(await instance.methods.totalSupply().call());
        let all = [];
        for (let index = 1; index <= totalSupply && index <= 15; index++){
          let uri = await instance.methods.tokenURI(index).call()
          .then((result)=> {
            return JSON.parse(window.atob(result.split(',')[1]));
          })
          .catch((error)=>{
            console.log(error);
          });

          //console.log("test"+uri);
          let element = {
            "key": uri.name,
            "header": <div className="text-center">{uri.name}</div>,
            "image":uri.image,
            "extra":<div className="text-center"><a target="_blank" href={this.state.chain.marketCard.replace("[PH_ADDR]",this.state.chain.addr).replace("[PH_ID]",uri.name.replace("Ticket #",""))}>View on secondary market</a></div>,
          };
          all.push(element);
          this.setState({all:all});
        }

      }catch(err){
        this.setState({errorMessage: err.message});
      }
      this.setState({loading:this.state.loading-1});
    }

  handleChange = (e, { value }) => {
    const result = value.replace(/[^a-z0-9 _.,:;!?$()\[\]{}\-\+\*]/gi, '');
    this.setState({ sponsorQuote:result});
    try{
        let temp = this.replaceText(this.state.element.image,result);
        let element = {"header": this.state.element.header,"image":temp};
        this.setState({element});
    }catch(err){
      //this.setState({errorMessage: err.message});
      console.log(err.message);
    }
  }

  setChecked = (e, data) => {
    this.setState({understood:data.checked});
  }

render(){
  return (
          <Container>
          {
            !this.state.successMessage
            ? <div>
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
              <a className={`a__underline__primary`} target="_blank" href={this.props.state.lnk_spnsr_read_more}> Read more... </a>
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
                <p className="text-indigo-800">
                  <a className={`a__underline__primary`} target="_blank" href={this.state.chain.marketplace}>Check the entire collection </a>
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
              <Form error={!!this.state.errorMessage} warning={!!this.state.warningMessage} className= {`${styles.form}`}>
                    <Form.Field>
                    <h3 className="text-center">Sponsorship price: ${this.state.sponsorPrice} {this.state.chain.coin}</h3>
                    {this.state.currentSponsor != 0
                      ? <h4 className="text-center">(Previous sponsor paid: ${this.state.currentSponsor} {this.state.chain.coin})</h4>
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
                      <Message error header="Oops!">
                       {this.state.errorMessage}
                       {this.state.sponsorPrice > this.props.state.web3Settings.ethBalance
                         ?
                          <a className={`text-indigo-800 a__underline__secondary`}
                            target="_blank"
                            href={this.state.chain.buy}> Buy ${this.state.chain.coin} here!
                          </a>
                        : <div></div>
                       }

                      </Message>
                      <Message warning icon >
                        <Message.Content>
                          <Message.Header>Pending user confirmation...</Message.Header>
                          {this.state.warningMessage}
                        </Message.Content>
                        <Icon name='circle notched' loading />
                      </Message>


                    </Form.Field>
                    <div className="text-center">
                      By clicking the button below you are paying {this.state.sponsorPrice} {this.state.chain.coin} for the sponsorship
                      <button onClick = {this.onSponsorship} className={`btn btn__primary`} disabled={this.state.loading > 0 || this.state.sponsorQuote.length == 0 || this.state.sponsorQuote.length > 35 || !this.state.understood}>
                        {this.state.buttonLabel}
                      </button>
                    </div>
                  </Form>
                  </div>
        :
          <div>
            <Message
              success
              header="Success!"
              className="text-center"
            >
              {this.state.successMessage}
              <p>
                <a className={`a__underline__secondary`} target="_blank" href={this.state.chain.marketplace}>Click here to see the entire collection on the marketplace</a>
              </p>
            </Message>
            <h1 className="text-center">
              You are the new sponsor, congrats!
            </h1>
              <h3>Note:</h3>
              <p>1. you modified all the NFTs</p>
              <p>2. No new NFT has been minted</p>
              <p>3. Until you remain the current sponsor, all future NFTs will include your text too </p>
              <p>4. If someone else wants to become new Sponsor, they need to pay 20% more than you and their text will replace yours</p>
              <p>5. If 4. happens, you will get an immediate and automatic refund on the same address you used to sponsor now (no actions required from you).</p>
              <p>6. Your address is: {this.state.account}</p>
              <br />
              <h3>Follows the list of the conference attendees NFT tickets you modified:</h3>
            <div style={{padding:"15px"}}>
               <Card.Group itemsPerRow={3} stackable={true} doubling={true} centered items={this.state.all} />
            </div>
            <div className="text-center">
              <a className={`a__underline__primary`} target="_blank" href={this.state.chain.marketplace}>Click here to see the full collection</a>
            </div>
          </div>
        }
        </Container>
  )
}
};
export default SponsorshipForm;
