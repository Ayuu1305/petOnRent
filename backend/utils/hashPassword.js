import bcrypt from "bcrypt";

// Function to hash a password
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Function to compare passwords
export const comparePassword = async (enteredPassword, storedHashedPassword) => {
  return await bcrypt.compare(enteredPassword, storedHashedPassword);
};
