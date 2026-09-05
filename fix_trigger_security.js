const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function test() {
  try {
    const fn = await sql`
      SELECT pg_get_functiondef(oid) 
      FROM pg_proc 
      WHERE proname = 'handle_new_user_security';
    `;
    console.log(fn[0].pg_get_functiondef);
  } catch (err) {
    console.log("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
