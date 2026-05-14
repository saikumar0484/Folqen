import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash || passwordHash.startsWith("placeholder-")) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
