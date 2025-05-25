const balances = new Map();

export async function getBalance(userId) {
  return balances.get(userId) || 0;
}

export async function addBalance(userId, amount) {
  const current = await getBalance(userId);
  balances.set(userId, current + amount);
}

export async function removeBalance(userId, amount) {
  const current = await getBalance(userId);
  balances.set(userId, current - amount);
}
