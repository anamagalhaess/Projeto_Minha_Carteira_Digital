import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setEnviado(true);
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>

        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#000" />
          <Text style={styles.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.conteudo}>
          {!enviado ? (
            <>
              <View style={styles.iconeContainer}>
                <Feather name="lock" size={48} color="#e95e07" />
              </View>
              <Text style={styles.titulo}>Esqueceu sua senha?</Text>
              <Text style={styles.descricao}>
                Digite o e-mail cadastrado e enviaremos um link para você redefinir sua senha.
              </Text>

              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#666" style={styles.leftIcon} />
                <TextInput
                  style={[styles.input, { outlineStyle: 'none' as any }]}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity style={styles.btnEnviar} onPress={handleEnviar} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.btnEnviarTexto}>Enviar link de redefinição</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.sucessoContainer}>
              <View style={styles.sucessoIcone}>
                <Feather name="check-circle" size={56} color="#e95e07" />
              </View>
              <Text style={styles.sucessoTitulo}>E-mail enviado!</Text>
              <Text style={styles.sucessoTexto}>
                Verifique sua caixa de entrada em{' '}
                <Text style={{ fontWeight: 'bold', color: '#e95e07' }}>{email}</Text>
                {' '}e clique no link para redefinir sua senha.
              </Text>
              <Text style={styles.sucessoDica}>Não encontrou? Verifique a pasta de spam.</Text>
              <TouchableOpacity style={styles.btnVoltar2} onPress={() => router.replace('/login')}>
                <Text style={styles.btnVoltar2Texto}>Voltar para o login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!enviado && (
          <View style={styles.footer}>
            <View style={styles.linhaSeparadora} />
            <Text style={styles.footerTexto}>
              Lembrou a senha?{' '}
              <Text style={styles.footerLink} onPress={() => router.replace('/login')}>Faça Login</Text>
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 30, marginBottom: 8 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  conteudo: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  iconeContainer: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#FFE0CC' },
  titulo: { fontSize: 26, fontWeight: '900', color: '#000', textAlign: 'center', marginBottom: 12 },
  descricao: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#000', borderRadius: 8, paddingHorizontal: 12, height: 50, marginBottom: 20 },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#000', height: '100%' },
  btnEnviar: { backgroundColor: '#e95e07', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnEnviarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  sucessoContainer: { alignItems: 'center' },
  sucessoIcone: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#FFE0CC' },
  sucessoTitulo: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 12 },
  sucessoTexto: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  sucessoDica: { fontSize: 12, color: '#AAA', textAlign: 'center', marginBottom: 32 },
  btnVoltar2: { borderWidth: 1.5, borderColor: '#e95e07', borderRadius: 8, paddingHorizontal: 32, paddingVertical: 14 },
  btnVoltar2Texto: { color: '#e95e07', fontWeight: '700', fontSize: 15 },
  footer: { paddingBottom: 30, alignItems: 'center' },
  linhaSeparadora: { width: '100%', height: 1.5, backgroundColor: '#000', marginBottom: 15 },
  footerTexto: { fontSize: 15, color: '#333' },
  footerLink: { color: '#283593', fontWeight: 'bold' },
});