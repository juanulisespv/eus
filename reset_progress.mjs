import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://okoqgrrspwxaonbyfkxf.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not defined in the environment.')
  console.error('Por favor ejecuta el script con: npm run db:reset')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('🧹 Limpiando datos de progreso y sesiones de test...')

const { error: progressError } = await supabase
  .from('user_word_progress')
  .delete()
  .neq('user_id', '00000000-0000-0000-0000-000000000000') // Elimina todos los registros de progreso

if (progressError) {
  console.error('❌ Error al limpiar progreso:', progressError.message)
} else {
  console.log('✅ Historial de progreso de palabras eliminado con éxito.')
}

const { error: sessionsError } = await supabase
  .from('sessions')
  .delete()
  .neq('user_id', '00000000-0000-0000-0000-000000000000') // Elimina todas las sesiones

if (sessionsError) {
  console.error('❌ Error al limpiar sesiones:', sessionsError.message)
} else {
  console.log('✅ Historial de sesiones eliminado con éxito.')
}

console.log('🎉 Limpieza completada.')
