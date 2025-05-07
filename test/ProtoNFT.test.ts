import { expect } from 'chai'
import { ZeroAddress, parseEther } from 'ethers'
import hre, { ethers } from 'hardhat'

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

    await protoNFT.mint(1, { value: parseEther('0.01') })

    const balance = await protoNFT.balanceOf(owner.address)
    const tokenId = 0
    const ownerOf = await protoNFT.ownerOf(tokenId)
    const totalSupply = await protoNFT.totalSupply()

    expect(balance).to.equal(1, "Can't mint")
    expect(ownerOf).to.equal(owner.address, "Can't mint")
    expect(totalSupply).to.equal(1, "Can't mint")
  })

  it('Should NOT mint', async () => {
    const { protoNFT } = await deployFixture()

    await expect(protoNFT.mint(1)).to.be.revertedWith('Insufficient payment')
  })

  it('Should burn', async () => {
    const { protoNFT, owner } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    await protoNFT.burn(tokenId)

    const balance = await protoNFT.balanceOf(owner.address)
    const totalSupply = await protoNFT.totalSupply()

    expect(balance).to.equal(0, "Can't burn")
    expect(totalSupply).to.equal(0, "Can't burn")
  })

  it('Should burn (approved)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

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

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

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
      'OwnerQueryForNonexistentToken'
    )
  })

  it('Should NOT burn (permission)', async () => {
    const { protoNFT, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    const instance = protoNFT.connect(otherAccount)

    await expect(instance.burn(tokenId)).to.be.revertedWithCustomError(
      protoNFT,
      'TransferCallerNotOwnerNorApproved'
    )
  })

  it('Should has URI metadata', async () => {
    const { protoNFT } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    expect(await protoNFT.tokenURI(tokenId)).to.equal(
      'https://www.calabreso.com.br/nfts/0.json',
      "Can't get URI metadata"
    )
  })

  it('Should NOT has URI metadata', async () => {
    const { protoNFT } = await deployFixture()

    await expect(protoNFT.tokenURI(1)).to.be.revertedWithCustomError(
      protoNFT,
      'URIQueryForNonexistentToken'
    )
  })

  it('Should transfer', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    await protoNFT.transferFrom(owner.address, otherAccount.address, tokenId)

    const balanceFrom = await protoNFT.balanceOf(owner.address)
    const balanceTo = await protoNFT.balanceOf(otherAccount.address)

    const ownerOf = await protoNFT.ownerOf(tokenId)

    expect(balanceFrom).to.equal(0, "Can't transfer")
    expect(balanceTo).to.equal(1, "Can't transfer")
    expect(ownerOf).to.equal(otherAccount.address, "Can't transfer")
  })

  it('Should emit transfer', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    await expect(
      protoNFT.transferFrom(owner.address, otherAccount.address, tokenId)
    )
      .to.emit(protoNFT, 'Transfer')
      .withArgs(owner.address, otherAccount.address, tokenId)
  })

  it('Should transfer (approved)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

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

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    await expect(protoNFT.approve(otherAccount.address, tokenId))
      .to.emit(protoNFT, 'Approval')
      .withArgs(owner.address, otherAccount.address, tokenId)
  })

  it('Should clear approvals', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    await protoNFT.approve(otherAccount.address, tokenId)

    await protoNFT.transferFrom(owner.address, otherAccount.address, tokenId)

    const approved = await protoNFT.getApproved(tokenId)

    expect(approved).to.equal(ZeroAddress, "Can't transfer")
  })

  it('Should transfer (approved for all)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

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

    await protoNFT.mint(1, { value: parseEther('0.01') })

    await expect(protoNFT.setApprovalForAll(otherAccount.address, true))
      .to.emit(protoNFT, 'ApprovalForAll')
      .withArgs(owner.address, otherAccount.address, true)
  })

  it('Should NOT transfer (permission)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await protoNFT.mint(1, { value: parseEther('0.01') })
    const tokenId = 0

    const instance = protoNFT.connect(otherAccount)

    await expect(
      instance.transferFrom(owner.address, otherAccount.address, tokenId)
    ).to.be.revertedWithCustomError(
      protoNFT,
      'TransferCallerNotOwnerNorApproved'
    )
  })

  it('Should NOT transfer (exists)', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    await expect(
      protoNFT.transferFrom(owner.address, otherAccount.address, 1)
    ).to.be.revertedWithCustomError(protoNFT, 'OwnerQueryForNonexistentToken')
  })

  it('Should supports interface', async () => {
    const { protoNFT } = await deployFixture()

    expect(await protoNFT.supportsInterface('0x80ac58cd')).to.equal(
      true,
      "Can't support interface"
    )
  })

  it('Should withdraw', async () => {
    const { protoNFT, owner, otherAccount } = await deployFixture()

    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address)

    const instance = protoNFT.connect(otherAccount)
    await instance.mint(1, { value: parseEther('0.01') })

    await protoNFT.withdraw()

    const contractAddress = await protoNFT.getAddress()

    const contractBalance = await ethers.provider.getBalance(contractAddress)
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address)

    expect(contractBalance).to.equal(0, "Can't withdraw")
    expect(ownerBalanceAfter).to.greaterThan(
      ownerBalanceBefore,
      "Can't withdraw"
    )
  })

  it('Should NOT withdraw (permission)', async () => {
    const { protoNFT, otherAccount } = await deployFixture()

    const instance = protoNFT.connect(otherAccount)

    await expect(instance.withdraw()).to.be.revertedWith(
      'You do not have permission'
    )
  })
})
