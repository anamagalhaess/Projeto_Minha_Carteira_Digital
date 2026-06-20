import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  useEffect(() => {
    // Verifica sessão ao iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastroPerfil" />
      <Stack.Screen name="home" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="cadastroPasta" />
      <Stack.Screen name="cadastroDocumento" />
      <Stack.Screen name="visualizarPasta" />
      <Stack.Screen name="visualizarDocumento" />
      <Stack.Screen name="favoritos" />
    </Stack>
  );
}