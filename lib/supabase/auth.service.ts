import { supabase } from './client'

// Función pura para iniciar sesión
export const iniciarSesion = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error de autenticación:', error.message)
    throw new Error('Credenciales incorrectas o usuario no encontrado.')
  }

  return data
}