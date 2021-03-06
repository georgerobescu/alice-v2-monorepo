var FluidEscrow = artifacts.require("FluidEscrow");
var FluidToken = artifacts.require("FluidToken");
var GBP = artifacts.require("AliceUSD");

require("./test-setup");

contract('Fluid Token', function ([owner, operator, receiver, unauthorised]) {
  var escrow;
  var gbp;
  var fluidToken;

  before("deploy fluid escrow and token contracts", async function () {
    gbp = await GBP.new();
    escrow = await FluidEscrow.new(gbp.address, 1000, operator);
    fluidToken = await FluidToken.at(await escrow.paymentRights());

    (await escrow.capacity()).should.be.bignumber.equal('1000');
    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('1000');
  });


  it("should deposit", async function () {
    await gbp.mint(escrow.address, 500);
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('500');
    (await escrow.funded()).should.be.bignumber.equal('500');
  });


  it("should distribute payment rights", async function () {
    await fluidToken.transfer(receiver, 100, {from: owner});

    (await fluidToken.balanceOf(owner)).should.be.bignumber.equal('900');
    (await fluidToken.balanceOf(receiver)).should.be.bignumber.equal('100');
  });


  it("should unlock", async function () {
    await escrow.unlock(100, {from: operator});

    (await escrow.unlocked()).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('90');
    (await fluidToken.getAvailableToRedeem({from: receiver})).should.be.bignumber.equal('10');
  });


  it("should not redeem from unauthorised", async function () {
    await fluidToken.redeem(10, {from: unauthorised}).shouldBeReverted();
  });


  it("should not redeem more than owned", async function () {
    await fluidToken.redeem(20, {from: receiver}).shouldBeReverted();
  });


  it("should redeem part of funds", async function () {
    await fluidToken.redeem(5, {from: receiver});

    (await fluidToken.balanceOf(receiver)).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: receiver})).should.be.bignumber.equal('5');

    (await gbp.balanceOf(receiver)).should.be.bignumber.equal('5');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('495');
  });


  it("should redeem rest of the funds", async function () {
    await fluidToken.redeem(5, {from: receiver});

    (await fluidToken.balanceOf(receiver)).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: receiver})).should.be.bignumber.equal('0');

    (await gbp.balanceOf(receiver)).should.be.bignumber.equal('10');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('490');
  });


  it("should unlock more tokens", async function () {
    await escrow.unlock(200, {from: operator});

    (await escrow.unlocked()).should.be.bignumber.equal('300');
    (await fluidToken.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('270');
    (await fluidToken.getAvailableToRedeem({from: receiver})).should.be.bignumber.equal('20');
  });


  it("should redeem after 2nd unlocking", async function () {
    await fluidToken.redeem(20, {from: receiver});

    (await fluidToken.balanceOf(receiver)).should.be.bignumber.equal('100');
    (await fluidToken.getAvailableToRedeem({from: receiver})).should.be.bignumber.equal('0');

    (await gbp.balanceOf(receiver)).should.be.bignumber.equal('30');
    (await gbp.balanceOf(escrow.address)).should.be.bignumber.equal('470');
  });

  it("should unlock more than escrow balance", async function () {
    await escrow.unlock(300, {from: operator});

    (await escrow.unlocked()).should.be.bignumber.equal('600');
    (await fluidToken.getAvailableToRedeem({from: owner})).should.be.bignumber.equal('450');
    (await fluidToken.getAvailableToRedeem({from: receiver})).should.be.bignumber.equal('20');
  });


});



