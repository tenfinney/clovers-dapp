import BN from 'bignumber.js'
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Reversi from './reversi'

let web3 = self && self.web3

class Clover extends Reversi {
  constructor (startVal) {
    super()
    this.ClubToken = false
    this.account = false
    this.accountInterval = false
    this.registeredBoards = []
  }


  initWeb3 () {
    let web3Provider
    if (web3) {
      // Use Mist/MetaMask's provider
      web3Provider = web3.currentProvider
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      // web3Provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/Q5I7AA6unRLULsLTYd6d')
      web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
    web3 = new Web3(web3Provider)
    this.setAccountInterval()
  }

  deloy () {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().catch((err) => {
      console.error(err)
    })
  }

  setAccountInterval () {
    this.account = web3.eth.accounts && web3.eth.accounts[0]
    if (this.accountInterval) {
      clearInterval(this.accountInterval)
    }
    this.accountInterval = setInterval(() => {
      this.account = web3.eth.accounts && web3.eth.accounts[0]
    }, 5000)
  }

  setContract () {
    this.initWeb3()
    this.ClubToken = contract(clubTokenArtifacts)
    this.ClubToken.setProvider(web3.currentProvider)
  }

  showGameDebug (byteFirst32Moves = 0, byteLastMoves = 0) {
    if (!this.ClubToken) this.setContract()
    if (!this.account) return
    this.ClubToken.deployed().then((instance) => {
      instance.showGameDebug(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account}).then((result) => {
        console.log(result)
      })
    })
  }

  showGameConstant (byteFirst32Moves = 0, byteLastMoves = 0) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.showGameConstant(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        console.log(result)
        return result
      })
    })
  }

  listClovers () {
    if (!this.ClubToken) this.setContract()
    this.ClubToken.deployed().then((instance) => {
      instance.getCloversCount().then((result) => {
        if (result.toNumber() !== this.registeredBoards.length) {
          this.registeredBoards = []
          for (let i = 0; i < result.toNumber(); i++) {
            instance.getCloverByKey(i).then((result) => {
              this.registeredBoards.splice(i, 1, result)
            })
          }
        }
      })
    })
  }

  buildString (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    if (!this.ClubToken) this.setContract()
    this.ClubToken.deployed().then((instance) => {
      // instance.returnAddress().then((result) => {
      //   console.log(result)
      // })
      instance.buildString(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        console.log(result);
      })
    })
  }

  buyClover (board = this.byteBoard) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.cloverExists.call(new BN(board, 16)).then((result) => {
        console.log(result)
        if (!result) {
          alert('game doesn\'t exist')
        } else {
          return instance.buyClover(new BN(board, 16), {from: this.account} ).then((result) => {
            console.log(result)
          }).catch((err) => {
            console.log('buyClover err', err.toString())
          })
        }
      })
    }).catch((err) => {
      console.log('deploy err', err)
    })
  }

  cloverExists (byteBoard = this.byteBoard) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.cloverExists(new BN(byteBoard, 16)).then(response => response)
    })
  }

  buildMovesString () {
    this.movesString = this.moves.map((move) => {
      return this.arrayToMove(move[0], move[1])
    }).join('')
  }

  pickRandomMove () {
    let validMoves = this.getValidMoves()
    if (!validMoves.length) {
      this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK
      validMoves = this.getValidMoves()
    }
    return validMoves.length !== 0 && validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  registerGameMovesString (moves = '', startPrice = 100) {
    moves = this.sliceMovesStringToBytes(moves)
    this.mineClover(moves[0], moves[1], startPrice)
  }

  mineClover (byteFirst32Moves = 0, byteLastMoves = 0, startPrice = 100) {
    this.playGameByteMoves(byteFirst32Moves, byteLastMoves)
    if (this.error) {
      alert('Game is not valid')
    } else if (!this.complete) {
      alert('Game is not complete')
    } else if (!this.symmetrical) {
      alert('Game is not symmetrical')
    } else {
      console.log(this)
      if (!this.ClubToken) this.setContract()
      return this.ClubToken.deployed().then((instance) => {
        return instance.mineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), startPrice, {from: this.account} ).then((result) => {
          console.log(result)
        }).catch((err) => {
          console.log('mineClover err', err.toString())
        })
      }).catch((err) => {
        console.log('deploy err', err)
      })
    }
  }

  adminRegisterGame (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, byteBoard = this.byteBoard, startPrice = 100) {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed().then((instance) => {
      return instance.adminRegisterGame(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), new BN(byteBoard, 16), new BN(startPrice, 10), {from: this.account})
    })
  }


  // Player Management


  listPlayerCount () {
    this.deploy().then((instance) => {
      return instance.listPlayerCount().then((count) => {
        console.log(count)
      }).catch((err) => {
        console.error(err)
      })
    })
  }

  playerAddressByKey (key = 0) {
    this.deploy().then((instance) => {
      return instance.playerAddressByKey(new BN(key, 10)).then((player) => {
        console.log(player)
      })
    })
  }

  // function playerAddressByKey(uint playerKey) public constant returns(address) {
  //   return playerKeys[playerKey];
  // }

  // function playerExists(address player) public constant returns(bool) {
  //   return players[player].exists;
  // }

  // function playerCurrentCount(address player) public constant returns(uint) {
  //   return players[player].currentCount;
  // }

  // function playerAllCount(address player) public constant returns(uint) {
  //   return players[player].cloverKeys.length;
  // }

  // function playerCloverByKey(address player, uint cloverKey) public constant returns(bytes16) {
  //   return players[player].cloverKeys[cloverKey];
  // }

  // function playerOwnsClover(address player, bytes16 board) public constant returns (bool) {
  //   return players[player].clovers[board];
  // }
}

export default Clover
