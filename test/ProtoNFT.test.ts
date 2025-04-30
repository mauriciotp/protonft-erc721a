import { expect } from 'chai'
import { ZeroAddress } from 'ethers'
import hre from 'hardhat'

describe('ProtoNFT', function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners()

    const ProtoNFT = await hre.ethers.getContractFactory('ProtoNFT')
    const protoNFT = await ProtoNFT.deploy()

    return { protoNFT, owner, otherAccount }
  }

  it('Should has name', async () => {
    const { protoNFT } = await deployFixture()

    expect(await protoNFT.name()).to.equal('ProtoNFT', "Can't get name")
  })

  it('Should has symbol', async () => {
    const { protoNFT } = await deployFixture()

    expect(await protoNFT.symbol()).to.equal('PNFT', "Can't get symbol")
  })

  it('Should mint', async () => {
    const { protoNFT, owner } = await deployFixture()

    await protoNFT.safeMint()

    const balance = await protoNFT.balanceOf(owner.address)
    const tokenId = await protoNFT.tokenByIndex(0)
    const ownerOf = await protoNFT.ownerOf(tokenId)
    const ownerTokenId = await protoNFT.tokenOfOwnerByIndex(owner.address, 0)
    const totalSupply = await protoNFT.totalSupply()

    expect(balance).to.equal(1, "Can't mint")
    expect(tokenId).to.equal(ownerTokenId, "Can't mint")
    expect(ownerOf).to.equal(owner.address, "Can't mint")
    expect(totalSupply).to.equal(1, "Can't mint")
  })

  it('Should burn', async () => {
    const { protoNFT, owner } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.burn(tokenId)

    const balance = await protoNFT.balanceOf(owner.address)
    const totalSupply = await protoNFT.totalSupply()

    expect(balance).to.equal(0, "Can't burn")
    expect(totalSupply).to.equal(0, "Can't burn")
  })

  it('Should burn (approved)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.approve(otherAccount.address, tokenId)
    const approved = await protoNFT.getApproved(tokenId)

    const instance = protoNFT.connect(otherAccount)
    await instance.burn(tokenId)

    const balance = await protoNFT.balanceOf(owner.address)
    const totalSupply = await protoNFT.totalSupply()

    expect(balance).to.equal(0, "Can't burn (approve)")
    expect(totalSupply).to.equal(0, "Can't burn (approve)")
    expect(approved).to.equal(otherAccount.address, "Can't burn (approve)")
  })

  it('Should burn (approved for all)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.setApprovalForAll(otherAccount.address, true)
    const approved = await protoNFT.isApprovedForAll(
      owner.address,
      otherAccount.address
    )

    const instance = protoNFT.connect(otherAccount)
    await instance.burn(tokenId)

    const balance = await protoNFT.balanceOf(owner.address)
    const totalSupply = await protoNFT.totalSupply()

    expect(balance).to.equal(0, "Can't burn (approve for all)")
    expect(totalSupply).to.equal(0, "Can't burn (approve for all)")
    expect(approved).to.equal(true, "Can't burn (approve for all)")
  })

  it('Should NOT burn (not exists)', async () => {
    const { protoNFT } = await deployFixture()

    await expect(protoNFT.burn(1)).to.be.revertedWithCustomError(
      protoNFT,
      'ERC721NonexistentToken'
    )
  })

  it('Should NOT burn (permission)', async () => {
    const { protoNFT, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    const instance = protoNFT.connect(otherAccount)

    await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(
      protoNFT,
      'ERC721InsufficientApproval'
    )
  })

  it('Should has URI metadata', async () => {
    const { protoNFT } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    expect(await protoNFT.tokenURI(tokenId)).to.equal(
      'https://www.calabreso.com.br/nfts/0.json',
      "Can't get URI metadata"
    )
  })

  it('Should NOT has URI metadata', async () => {
    const { protoNFT } = await deployFixture()

    await expect(protoNFT.tokenURI(1)).to.be.revertedWithCustomError(
      protoNFT,
      'ERC721NonexistentToken'
    )
  })

  it('Should transfer', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.transferFrom(owner.address, otherAccount.address, tokenId)

    const balanceFrom = await protoNFT.balanceOf(owner.address)
    const balanceTo = await protoNFT.balanceOf(otherAccount.address)

    const ownerOf = await protoNFT.ownerOf(tokenId)
    const ownerTokenId = await protoNFT.tokenOfOwnerByIndex(
      otherAccount.address,
      0
    )

    expect(balanceFrom).to.equal(0, "Can't transfer")
    expect(balanceTo).to.equal(1, "Can't transfer")
    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer")
    expect(tokenId).to.equal(ownerTokenId, "Can't transfer")
  })

  it('Should emit transfer', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await expect(
      protoNFT.transferFrom(owner.address, otherAccount.address, tokenId)
    )
      .to.emit(protoNFT, 'Transfer')
      .withArgs(owner.address, otherAccount.address, tokenId)
  })

  it('Should transfer (approved)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.approve(otherAccount.address, tokenId)
    const approved = await protoNFT.getApproved(tokenId)

    const instance = protoNFT.connect(otherAccount)
    await instance.transferFrom(owner.address, otherAccount.address, tokenId)

    const balanceFrom = await protoNFT.balanceOf(owner.address)
    const balanceTo = await protoNFT.balanceOf(otherAccount.address)

    const ownerOf = await protoNFT.ownerOf(tokenId)

    expect(balanceFrom).to.equal(0, "Can't transfer")
    expect(balanceTo).to.equal(1, "Can't transfer")
    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer")
    expect(approved).to.equal(otherAccount.address, "Can't transfer")
  })

  it('Should emit approval', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await expect(protoNFT.approve(otherAccount.address, tokenId))
      .to.emit(protoNFT, 'Approval')
      .withArgs(owner.address, otherAccount.address, tokenId)
  })

  it('Should clear approvals', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.approve(otherAccount.address, tokenId)

    await protoNFT.transferFrom(owner.address, otherAccount.address, tokenId)

    const approved = await protoNFT.getApproved(tokenId)

    expect(approved).to.equal(ZeroAddress, "Can't transfer")
  })

  it('Should transfer (approved for all)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    await protoNFT.setApprovalForAll(otherAccount.address, true)
    const approved = await protoNFT.isApprovedForAll(
      owner.address,
      otherAccount.address
    )

    const instance = protoNFT.connect(otherAccount)
    await instance.transferFrom(owner.address, otherAccount.address, tokenId)

    const ownerOf = await protoNFT.ownerOf(tokenId)

    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer")
    expect(approved).to.equal(true, "Can't transfer")
  })

  it('Should emit approval for all', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()

    await expect(protoNFT.setApprovalForAll(otherAccount.address, true))
      .to.emit(protoNFT, 'ApprovalForAll')
      .withArgs(owner.address, otherAccount.address, true)
  })

  it('Should NOT transfer (permission)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.safeMint()
    const tokenId = await protoNFT.tokenByIndex(0)

    const instance = protoNFT.connect(otherAccount)

    await expect(
      instance.transferFrom(owner.address, otherAccount.address, tokenId)
    ).to.be.revertedWithCustomError(protoNFT, 'ERC721InsufficientApproval')
  })

  it('Should NOT transfer (exists)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await expect(
      protoNFT.transferFrom(owner.address, otherAccount.address, 1)
    ).to.be.revertedWithCustomError(protoNFT, 'ERC721NonexistentToken')
  })

  it('Should supports interface', async () => {
    const { protoNFT } = await deployFixture()

    expect(await protoNFT.supportsInterface('0x80ac58cd')).to.equal(
      true,
      "Can't support interface"
    )
  })
})
