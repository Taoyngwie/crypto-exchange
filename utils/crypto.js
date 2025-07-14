const crypto = require('crypto');

function generateWalletAddress(symbol) {
  const prefix = symbol.toLowerCase();
  const randomBytes = crypto.randomBytes(20).toString('hex');
  return `${prefix}_${randomBytes}`;
}

function generateTxHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateWalletAddress,
  generateTxHash
};
