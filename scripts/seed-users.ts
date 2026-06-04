import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const emails = ['admin@mosaico.app', 'aluno@mosaico.app'];
  const roles = ['admin', 'student'];
  const names = ['Admin Mosaico', 'Aluno Teste'];
  const PASSWORD = 'Mosaico@2026';

  // List users to find existing ones
  const { data: users, error: ue } = await supabase.auth.admin.listUsers();
  if (ue) { console.error('Erro ao listar:', ue.message); return; }

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const existing = users.users.find(u => u.email === email);

    if (existing) {
      // Confirm existing user
      const { error: ce } = await supabase.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
      });
      if (ce) console.log(`${email}: ${ce.message}`);
      else console.log(`✓ ${email} confirmado`);
    } else {
      // Create new
      const { data, error: ce } = await supabase.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
      });
      if (ce) console.log(`${email}: ${ce.message}`);
      else console.log(`✓ ${email} criado: ${data.user?.id}`);
    }

    // Upsert profile
    const existingUser = existing || (await supabase.auth.admin.listUsers()).data?.users.find(u => u.email === email);
    if (existingUser?.id) {
      const { error: pe } = await supabase.from('profiles').upsert({
        id: existingUser.id,
        email,
        full_name: names[i],
        role: roles[i],
      });
      if (pe) console.log(`  Perfil: ${pe.message}`);
      else console.log(`  ✓ Perfil ${roles[i]} OK`);
    }
  }

  console.log('\n=== Credenciais ===');
  console.log('Admin:  admin@mosaico.app / Mosaico@2026');
  console.log('Aluno:  aluno@mosaico.app / Mosaico@2026');
}

main().catch(console.error);
