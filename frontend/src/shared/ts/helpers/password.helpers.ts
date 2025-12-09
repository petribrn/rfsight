export const generateRandomPassword = (length = 12) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specials = '#?!@$%^*-';

  const requiredChars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specials[Math.floor(Math.random() * specials.length)],
  ];

  const allChars = upper + lower + numbers + specials;
  const remainingLength = length - requiredChars.length;

  const result = [...requiredChars];

  for (let i = 0; i < remainingLength; i++) {
    result.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}
