pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './Escrow.sol';
import './FluidEscrow.sol';
import './FluidToken.sol';
import './ImpactPromise.sol';

/**
 * @title Impact Futures
 * @dev Contract to manage social impact projects in a flexible way.
 *
 */
contract ImpactFutures {
    using SafeMath for uint256;

    event Funded(address indexed funder, uint256 amount);
    event Validated(uint256 amount);

    /**
     * @dev Throws if called by any account other than the Validator.
     */
    modifier onlyValidator() {
        require(msg.sender == validator, "The caller is not the validator");
        _;
    }

    /**
     * @dev Throws if called by any account other than the Manger.
     */
    modifier onlyManager() {
        require(msg.sender == manager, "The caller is not the manager");
        _;
    }


    ERC20 public paymentToken;
    ImpactPromise public impactPromise;
    FluidToken public impactCredit;

    Escrow public escrow;

    address public validator;
    address public manager;

    uint256 public outcomesNumber;
    uint256 public outcomePrice;
    uint256 public budget;

    constructor(ERC20 _paymentToken, uint256 _outcomesNumber, uint256 _outcomesPrice, address _validator, address _manager) public {
        paymentToken = _paymentToken;
        outcomesNumber = _outcomesNumber;
        outcomePrice = _outcomesPrice;
        budget = outcomePrice.mul(outcomesNumber);
        validator = _validator;
        manager = _manager;

        escrow = new FluidEscrow(_paymentToken, budget, address(this));
        impactPromise = new ImpactPromise();
        impactCredit = FluidToken(escrow.recipient());
        impactCredit.transfer(manager, budget);
    }


    function fund(uint256 _amount) public {
        require(paymentToken.balanceOf(address(escrow)).add(_amount) <= budget, "The funding amount exceed allowed impact budget");
        paymentToken.transferFrom(msg.sender, address(escrow), _amount);
        impactPromise.mint(msg.sender, _amount);

        emit Funded(msg.sender, _amount);
    }


    function validateOutcome() public onlyValidator {
        escrow.unlock(outcomePrice);
        emit Validated(outcomePrice);
    }


    function finalize(uint256 _amount) public onlyManager {
//        unlocked = unlocked.add(_amount);
//        require(unlocked <= capacity, "Cannot unlock more than the max capacity of the escrow");
//
//        emit Unlocked(_amount);
    }


    function refund(uint256 _amount) public onlyManager {
//        unlocked = unlocked.add(_amount);
//        require(unlocked <= capacity, "Cannot unlock more than the max capacity of the escrow");
//
//        emit Unlocked(_amount);
    }

}
