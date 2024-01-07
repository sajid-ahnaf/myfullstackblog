const readline = require('readline');
const prompt = require('prompt-sync')({
  autocomplete: undefined,
  sigint: true, // Exits the terminal command execution if prompt receives CTRL + C,
  history: undefined
});
const {
  createUser,
  getUserByUsername,
  changeUserPassword,
  deleteUser
} = require('../service/sqlite-service');

const { hashPassword } = require('./auth-utilities');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const usernameRequirements = [
  'Must be at least 3 characters long',
  'Can not contain white space'
];
const passwordRequirements = [
  'Must be at least 8 characters long',
  'Must contain at least one lowercase letter',
  'Must contain at least one uppercase letter',
  'Must contain at least one number',
  'Must contain at least one special character (!@#$%^&*)'
];

const hasWhiteSpace = (value) => {
  return value.indexOf(' ') >= 0;
}

const passwordMeetsRequirements = (value) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  return passwordRegex.test(value);
}

const createAdminUser = async () => {

  console.log("\x1b[36m Welcome to administrator user creation process! \x1b[0m")
  console.log(`\x1b[36m Username requirements: \x1b[0m`);
  console.group();
  for (let index = 0; index < usernameRequirements.length; index++) {
    console.log(`\x1b[36m ${usernameRequirements[index]}. \x1b[0m`);
  }
  console.groupEnd();
  console.log(`\x1b[36m Password requirements: \x1b[0m`)
  console.group();
  for (let index = 0; index < passwordRequirements.length; index++) {
    console.log(`\x1b[36m ${passwordRequirements[index]}. \x1b[0m`);
  }
  console.groupEnd();

  const username = await prompt("\x1b[33m Enter your username: \x1b[0m");
  if (username.length < 3 || hasWhiteSpace(username)) {
    console.log(`\x1b[31m Username does not meet the requirements. \x1b[0m`);
    return rl.close();
  }

  const user = getUserByUsername(username);
  if (user !== undefined) {
    console.log(`\x1b[31m User with a username ${username} already exists. \x1b[0m`);
    return rl.close();
  }

  const password = await prompt.hide("\x1b[33m Enter your password: \x1b[0m");
  if (!passwordMeetsRequirements(password)) {
    console.log(`\x1b[31m Password does not meet the requirements. \x1b[0m`);
    return rl.close();
  }

  const confirmPassword = await prompt.hide("\x1b[33m Confirm your password: \x1b[0m");
  if (password !== confirmPassword) {
    console.log(`\x1b[31m Password and Confirm Password inputs do not match. \x1b[0m`);
    return rl.close();
  }

  const hashPass = await hashPassword(password);
  const newUser = createUser(username, hashPass);
  if (!newUser.success) {
    console.log(`\x1b[31m ${newUser.error}. \x1b[0m`);
    console.log(`\x1b[31m ${newUser.msg}. \x1b[0m`);
    return rl.close();
  }

  console.log(`\x1b[32m ${newUser.msg} \x1b[0m`);
  return rl.close();
};

const changeAdminUserPassword = async () => {

  console.log("\x1b[36m Welcome to administrator user password change process! \x1b[0m");
  console.groupEnd();
  console.log(`\x1b[36m Password requirements: \x1b[0m`);
  console.group();
  for (let index = 0; index < passwordRequirements.length; index++) {
    console.log(`\x1b[36m ${passwordRequirements[index]}. \x1b[0m`);
  }
  console.groupEnd();
  
  const username = await prompt("\x1b[33m Enter your username: \x1b[0m");
  const user = getUserByUsername(username);
  if (user === undefined) {
    console.log(`\x1b[31m User with a username ${username} does not exist. \x1b[0m`);
    return rl.close();
  }

  const password = await prompt.hide("\x1b[33m Enter your new password: \x1b[0m");
  if (!passwordMeetsRequirements(password)) {
    console.log(`\x1b[31m Password does not meet the requirements. \x1b[0m`);
    return rl.close();
  }

  const confirmPassword = await prompt.hide("\x1b[33m Confirm your new password: \x1b[0m");
  if (password !== confirmPassword) {
    console.log(`\x1b[31m Password and Confirm Password inputs do not match. \x1b[0m`);
    return rl.close();
  }

  const hashPass = await hashPassword(password);
  const result = changeUserPassword(username, hashPass);
  if (!result.success) {
    console.log(`\x1b[31m ${result.error}. \x1b[0m`);
    console.log(`\x1b[31m ${result.msg}. \x1b[0m`);
    return rl.close();
  }

  console.log(`\x1b[32m ${result.msg} \x1b[0m`);
  return rl.close();
}

const deleteAdminUser = async () => {
  console.log("\x1b[36m Welcome to deletion of administrator user process! \x1b[0m");

  const username = await prompt("\x1b[33m Enter a username: \x1b[0m");
  const user = getUserByUsername(username);
  if (user === undefined) {
    console.log(`\x1b[31m User with a username ${username} does not exist. \x1b[0m`);
    return rl.close();
  }

  console.log(`\x1b[35m You are about to delete a user: ${username} \x1b[0m`);
  console.log("\x1b[35m Deleting a user is considered a dangerous action! \x1b[0m");
  const confirmationValue = await prompt("\x1b[33m Do you want to proceed? (To proceed, write yes)\x1b[0m");

  if (confirmationValue === 'yes') {
    const result = deleteUser(username);
    if (!result.success) {
      console.log(`\x1b[31m ${result.error}. \x1b[0m`);
      console.log(`\x1b[31m ${result.msg}. \x1b[0m`);
      return rl.close();
    }
  
    console.log(`\x1b[32m ${result.msg} \x1b[0m`);
    return rl.close();
  }
  return rl.close();
}

module.exports = {
  createAdminUser,
  changeAdminUserPassword,
  deleteAdminUser
}
