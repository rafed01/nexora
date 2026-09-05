const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function test() {
  try {
    const columns = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND table_schema = 'public';
    `;
    console.log(columns);
  } catch (err) {
    console.log("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
