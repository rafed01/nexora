const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_error_123@example.com',
    password: 'password123',
    email_confirm: true
  });
  console.log("Signup Result:", error ? error.message : "Success");
  
  if (data && data.user) {
    // try to delete it
    await supabase.auth.admin.deleteUser(data.user.id);
  }
}
test();
