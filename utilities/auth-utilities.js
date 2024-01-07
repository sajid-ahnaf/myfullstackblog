require('dotenv').config({ path: '/opt/w3s/config/.config' });
const {getUserByUsernameAndPassword} = require('../service/sqlite-service');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const hashPassword = async (password) => {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (error) {
    console.error(error);
  }
};

const generateAccessToken = async (tokenData) => {
  try {
    const user = await getUserByUsernameAndPassword(tokenData.username, tokenData.password, false);
    if (user.success) {
      tokenData.password = user.data.password;
      return jwt.sign(
        { data: tokenData },
        process.env.COOKIE_SECRET,
        { expiresIn: '12h' }
      );
      
    } else {
      return {
        error: 'Incorrect username or password.',
      };
    }
  } catch (error) {
    return { error };
  }
};

const ifAdminIsAuthenticated = async (cookie, cookieName, res) => {
  try {
    const decoded = jwt.verify(cookie, process.env.COOKIE_SECRET);
    const user = await getUserByUsernameAndPassword(decoded.data.username, decoded.data.password, true);
    const isVerified = decoded.data.password === user.data.password ? true : false;
    if (!isVerified) res.clearCookie(cookieName);
    return isVerified;
  } catch (error) {
    // console.log(error)
    res.clearCookie(cookieName);
    return false;
  }
};

module.exports = {
  generateAccessToken,
  hashPassword,
  ifAdminIsAuthenticated
};