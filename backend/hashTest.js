const bcrypt = require('bcrypt');

const generateHash = async () => {
  const hashed = await bcrypt.hash('password123', 10);
  console.log(hashed);
};

generateHash();