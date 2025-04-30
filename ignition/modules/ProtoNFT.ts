import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const ProtoNFTModule = buildModule('ProtoNFTModule', m => {
  const protoNFT = m.contract('ProtoNFT')

  return { protoNFT }
})

export default ProtoNFTModule
