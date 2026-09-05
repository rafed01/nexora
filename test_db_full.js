const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function test() {
  try {
    // Insert into auth.users directly to see the error
    await sql`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password)
      VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'test_direct2@example.com', 'test');
    `;
    console.log("Success");
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(0);
  }
}
test();
