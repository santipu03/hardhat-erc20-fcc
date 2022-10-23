const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("SantipuToken Unit Test", function () {
      // 'amount' constant will be used through all these tests
      const amount = (20 * 10 ** 18).toString()
      let santipuToken, deployer, user1
      beforeEach(async function () {
        const accounts = await getNamedAccounts()
        deployer = accounts.deployer
        user1 = accounts.user1

        await deployments.fixture("all")
        santipuToken = await ethers.getContract("SantipuToken", deployer)
      })

      it("was deployed", async () => {
        assert(santipuToken.address)
      })

      describe("constructor", () => {
        it("should have correct INITIAL_SUPPLY of tokens", async () => {
          const totalSupply = await santipuToken.totalSupply()
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
        })
        it("initializes the token with the correct name and symbol", async () => {
          const name = await santipuToken.name()
          assert.equal(name.toString(), "SantipuToken")

          const symbol = await santipuToken.symbol()
          assert.equal(symbol.toString(), "SPT")
        })

        describe("transfers", () => {
          it("should be able to transfer tokens successfully to an address", async () => {
            await santipuToken.transfer(user1, amount)
            // use this syntax when adding 'await', assert.equal will return the raw promise
            expect(await santipuToken.balanceOf(user1)).to.equal(amount)
          })
          it("emit a transfer event when the transfer occurs", async () => {
            await expect(santipuToken.transfer(user1, amount)).to.emit(
              santipuToken,
              "Transfer"
            )
          })
        })

        describe("allowances", () => {
          let playerToken
          beforeEach(async () => {
            // We create an instance of the token from user1 perspective
            playerToken = await ethers.getContract("SantipuToken", user1)
          })

          it("should approve other address to spend token", async () => {
            // Deployer approve user1 to spend 'amount' of tokens
            await santipuToken.approve(user1, amount)
            // user1 transfer 'amount' tokens from deployer to himself
            await playerToken.transferFrom(deployer, user1, amount)
            expect(await santipuToken.balanceOf(user1)).to.equal(amount)
          })

          it("doesn't allow an unnaproved member to do transfers", async () => {
            await expect(
              playerToken.transferFrom(deployer, user1, amount)
            ).to.be.revertedWith("ERC20: insufficient allowance")
          })

          it("emits an approval event, when an approval occurs", async () => {
            await expect(santipuToken.approve(user1, amount)).to.emit(
              santipuToken,
              "Approval"
            )
          })

          it("the allowance being set is accurate", async () => {
            await santipuToken.approve(user1, amount)
            const allowance = await santipuToken.allowance(deployer, user1)
            assert.equal(allowance.toString(), amount)
          })

          it("won't allow a user go over the allowance", async () => {
            const tokensToApprove = ethers.utils.parseEther("19")
            await santipuToken.approve(user1, tokensToApprove)
            await expect(
              playerToken.transferFrom(deployer, user1, amount)
            ).to.be.revertedWith("ERC20: insufficient allowance")
          })
        })
      })
    })
