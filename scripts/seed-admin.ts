import bcrypt from "bcryptjs";

async function main() {
  const plainPassword = process.argv[2];
  if (!plainPassword || plainPassword.length < 8) {
    throw new Error("Pass a password with at least 8 characters. Example: npm run seed:admin -- MyStrongPass123");
  }

  const hash = await bcrypt.hash(plainPassword, 10);
  console.log("Use this hash as ADMIN_PASSWORD in your .env.local:");
  console.log(hash);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
