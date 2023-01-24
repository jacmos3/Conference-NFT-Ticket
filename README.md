# Conference-NFT-Ticket
Smart Contract and dApp for the minting of the NFT Ticket for the "Web3 in Travel" Summit.

This dApp is great for those who are planning to organize a IRL (In Real Life) event.

It provides a basic interface written in react.js and the smart contract in solidity.

## MINTING
Once setup and deployed, the dApp could be used from users to mint (buy) NFT tickets for the conference.

The smart contract has been deployed on Polygon Chain and the price of the ticket minting is following a bounding curve to incentivize the first minters to get huge discount.

Price increases for every new minting, until it reaches the intended target price. This means that the first tickets are in high discount price to incentivize users.

## LITTLE TRAVELER DISCOUNT
Users holding  a Little Traveler on polygon ( https://littletraveler.org/ ), will receive a big discount on Conference Ticket. The default discount is 50%, but it may be changed.

## SPONSORSHIP
Partners could use the dApp for buying a sponsorship for the event!
The smart contract allows permissionless sponsorships!
This is an innovation in the field because it opens an interesting scenario, where sponsor do not need to get in contract
with the organizer, but they can be autonomous if they want to be the sponsor of the event.

The sponsorship system works as follow:
- Anytime anyone could become a sponsor;
- There will be only 1 sponsor per time;
- Sponsor will be printing its name or 32-length sentence into all the NFT tickets already minted and that will be minted from that moment ahead. Yes also already minted NFT will change the metadata and will be instantly affected! (it could happens that some marketplace do not show the edits since they cache the NFT images in their own servers.
- Everybody could become a new sponsor even if there was one already: Each new sponsor removes the sponsor rights to the previous sponsor.
- When a new sponsor comes, the old sponsor is FULLY and INSTANTLY reimbursed in the same blockchain transaction, as soon as the new sponsor pays a 20% increased value. Old sponsor will get back 100% what it paid and the sponsored event gets the 20% more as the new Sponsor decided to sponzorize the event by paying the increased price. In this case the old sponsor basically had free exposure for all the period which passed from its sponsorship and the new one. Not bad, right?

This is no possible with traditional systems and it's an interesting innovation in the conference and ticketing sector.

Podcasters could also fork this project to allow donation from their community, like Luca De Giglio did with his Web3InTravel Podcast:
https://podcast.web3intravel.com/

I invite everybody who wants to fork this project to do so and contact me to be added in the list as use case example
