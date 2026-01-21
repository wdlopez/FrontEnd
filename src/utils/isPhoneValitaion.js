export const isValidPhoneNumber = (phone) => {
  const regex = /^\+\d{10,15}$/;
  return regex.test(phone);
};

