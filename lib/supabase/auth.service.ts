import { createClient } from './client'

// Tipos de usuario permitidos en Bella Pizza.
export type UserRole = 'admin' | 'cliente'

// Función para iniciar sesión e identificar el tipo de usuario.
export const iniciarSesion = async (
  email: string,
  password: string,
) => {
  const supabase = createClient()

  // 1. Verificar las credenciales del usuario.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error de autenticación:', error.message)

    throw new Error(
      'Credenciales incorrectas o usuario no encontrado.',
    )
  }

  // 2. Consultar el rol asignado al usuario en la base de datos.
  const { data: perfil, error: perfilError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  // 3. Si no existe un perfil válido, cerrar la sesión.
  if (perfilError || !perfil) {
    await supabase.auth.signOut()

    console.error(
      'Error consultando el perfil:',
      perfilError?.message ?? 'El usuario no tiene un perfil registrado.',
    )

    throw new Error(
      'Tu cuenta no tiene un perfil válido. Contacta al administrador.',
    )
  }

  // 4. Aceptar únicamente los roles definidos para el sistema.
  if (perfil.role !== 'admin' && perfil.role !== 'cliente') {
    await supabase.auth.signOut()

    throw new Error(
      'Tu cuenta no tiene un rol válido para ingresar.',
    )
  }

  // 5. Devolver la sesión junto con el rol del usuario.
  return {
    ...data,
    role: perfil.role as UserRole,
  }
}