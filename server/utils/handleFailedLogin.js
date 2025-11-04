// handleFailedLogin.js
module.exports = async function handleFailedLogin(user) {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 minutes
    user.failedLoginAttempts = 0;
  }
  await user.save();
};
