var Web3 = require('web3'),
  abi = require('./abi'),
  addr = require('./address');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const cc = web3.eth.contract(abi.abi);
const ci = cc.at(addr.contractAddress);

exports.addMember = (from, name, addr) => { 
  console.log(from, name, addr);
  return new Promise((resolve, reject) => {
    ci.addMember(
      addr,
      name,
      {from: from, gas:1000000},
      () => {
        resolve({ 'msg': 'User added.'});
      }
    );
  });
};

exports.getMembers = () => { 
  var mems = [];
  for(var i = 0; i < ci.memberCount.call(); i++) {
    mems.push(ci.getMember.call(i));
  }
  return mems;
};

exports.removeMember = (from, addr) => {
   return new Promise(resolve => {
    ci.deactivateMember(
      addr,
      {from: from, gas:1000000},
      () => {
        resolve('User removed.');
      }
    );
  });
}

exports.getAddress = i => {
  return web3.eth.accounts[i];
};

exports.getActivity = (actId) => {
  return ci.getActivity.call(actId);
}

exports.getActivities = () => { 
  var acts = [];
  for(var i = 0; i < ci.activityCount.call(); i++) {
    acts.push(ci.getActivity.call(i));
  }
  return acts;
};

exports.addActivity = (from, cost, title, description) => {
  return new Promise(resolve => {
    ci.addActivity(
      cost,
      title,
      description, 
      {from: from, gas:1000000},
      () => {
        resolve({ 'msg': 'Activity added.' });
      }
    );
  });
};

exports.getBudget = () => {
  return ci.getCoopBudget.call();
};

exports.distributeBudget = (from) => {
  return new Promise(resolve => {
    ci.distributeBudget({from: from, gas: 1000000}, () => {
      resolve('distributeBudget...done.');
    });
  });
};

exports.getParticipants = actId => {
  return ci.getParticipants.call(actId);
//    .map( p => {
//    parseInt(p.toString());
//  });
};

exports.addParticipant = (from, memId, actId) => {
  return new Promise(resolve => {
    ci.addParticipant(
      memId,
      actId, 
      {from: from, gas:1000000},
      () => {
        resolve('Participant added.');
      }
    );
  });
};

exports.removeParticipant = (from, memId, actId) => {
  return new Promise(resolve => {
    ci.removeParticipant(
      memId,
      actId, 
      {from: from, gas:1000000},
      () => {
        resolve('Participant removed.');
      }
    );
  });
};

exports.vote = (from, actId, prom, just) => {
  return new Promise(resolve => {
    ci.vote(
      actId,
      prom,
      just,
      {from: from, gas:1000000},
      () => {
        resolve('Vote added.');
      }
    );
  });
};

exports.finalize = (from, actId) => {
  return new Promise(resolve => {
    ci.finalize(
      actId,
      {from: from, gas:1000000},
      () => {
        resolve('Activity finalized.');
      }
    );
  });
};


exports.unlockAccount = (account, password) => { 
  web3.personal.unlockAccount(account, password);
};

