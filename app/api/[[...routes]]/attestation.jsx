const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

const privateKey = "0x2ec0718fe60e884f26f6a787a44c1e578cca6726aa7a151f27eccd5c243ffac1";
const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.scrollSepolia,
  account: privateKeyToAccount(privateKey), // Optional, depending on environment
});

const signer = "0x8d0B70292ca6ea1a2Ea97A57C17e9Bb336fa291f";

export const createTicketAttestation = async (theatre, movie, showTime, seats, amount) => {
    const res = await client.createAttestation({
        schemaId: "0x45",
        data: {
           movie, 
           theatre,
           showTime,
           seats,
           amount
        },
        indexingValue: signer.toLowerCase()
    })

    return res
}