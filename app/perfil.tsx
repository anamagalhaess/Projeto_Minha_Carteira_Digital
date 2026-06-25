import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, Image, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

const CampoEditavel = ({ label, value, onChange, isPassword = false, keyboardType = 'default', onSave }: any) => {
  const [editando, setEditando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const salvar = () => {
    setEditando(false);
    if (onSave) onSave(value);
  };

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, !editando && styles.inputReadOnly]}
          value={editando ? value : (isPassword ? 'Alterar Senha' : value)}
          onChangeText={onChange}
          editable={editando}
          secureTextEntry={isPassword && !mostrarSenha}
          keyboardType={keyboardType}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        {editando ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isPassword && (
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={{ marginRight: 12 }}>
                <Feather name={mostrarSenha ? 'eye' : 'eye-off'} size={18} color="#666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={salvar}>
              <Feather name="check" size={18} color="#e95e07" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditando(true)}>
            <Feather name="edit-2" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default function PerfilScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [totalPastas, setTotalPastas] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Busca perfil
          const { data: perfil } = await supabase
            .from('perfis')
            .select('nome_completo, email, foto_url')
            .eq('id', user.id)
            .single();

          if (perfil) {
            setNome(perfil.nome_completo || '');
            setEmail(perfil.email || '');
            setFotoUri(perfil.foto_url);
          }

          // Estatísticas
          const { count: numPastas } = await supabase
            .from('pastas')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const { count: numDocs } = await supabase
            .from('documentos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          const { count: numFavoritos } = await supabase
            .from('documentos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('favorito', true);

          setTotalPastas(numPastas || 0);
          setTotalDocs(numDocs || 0);
          setTotalFavoritos(numFavoritos || 0);

        } catch (error) {
          console.log('Erro ao carregar perfil:', error);
        } finally {
          setLoading(false);
        }
      };
      carregar();
    }, [])
  );

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar sua foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFotoUri(uri);

      // Upload no Supabase Storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = uri.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const formData = new FormData();
      formData.append('file', { uri, name: path, type: `image/${ext}` } as any);

      const { error } = await supabase.storage.from('avatares').upload(path, formData, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('avatares').getPublicUrl(path);
        await supabase.from('perfis').update({ foto_url: data.publicUrl }).eq('id', user.id);
      }
    }
  };

  const salvarNome = async (novoNome: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('perfis').update({ nome_completo: novoNome }).eq('id', user.id);
    if (!error) Alert.alert('Salvo', 'Nome atualizado com sucesso!');
  };

  const salvarEmail = async (novoEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: novoEmail });
    if (!error) {
      await supabase.from('perfis').update({ email: novoEmail }).eq('id', (await supabase.auth.getUser()).data.user?.id);
      Alert.alert('Salvo', 'E-mail atualizado com sucesso!');
    }
  };

  const salvarSenha = async (novaSenha: string) => {
    if (novaSenha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (!error) Alert.alert('Salvo', 'Senha atualizada com sucesso!');
    else Alert.alert('Erro', 'Não foi possível atualizar a senha.');
  };

  const handleSair = () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/login');
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#e95e07" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />

        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#000" />
            <Text style={styles.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.tituloHeader}>Seu perfil</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Image
                source={fotoUri ? { uri: fotoUri } : require('../assets/images/fotoPerfil.jpg')}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.btnCamera} onPress={escolherFoto}>
                <Feather name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.nomeExibido}>{nome}</Text>
          </View>

          {/* Estatísticas reais do banco */}
          <View style={styles.statsRow}>
            {([[totalPastas.toString(), 'Pastas'], [totalDocs.toString(), 'Documentos'], [totalFavoritos.toString(), 'Favoritos']] as string[][]).map(([num, label], i, arr) => (
              <React.Fragment key={label}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumero}>{num}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>

          <CampoEditavel label="Nome Completo" value={nome} onChange={setNome} onSave={salvarNome} />
          <CampoEditavel label="Senha" value={senha} onChange={setSenha} isPassword onSave={salvarSenha} />
          <CampoEditavel label="E-mail" value={email} onChange={setEmail} keyboardType="email-address" onSave={salvarEmail} />

          <TouchableOpacity style={styles.btnSair} onPress={handleSair}>
            <Text style={styles.btnSairTexto}>Sair da Conta</Text>
          </TouchableOpacity>

        </ScrollView>

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/favoritos')}>
            <Feather name="star" size={20} color="#666" /><Text style={styles.tabText}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
            <Feather name="home" size={20} color="#666" /><Text style={styles.tabText}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/cadastroDocumento')}>
            <Feather name="plus-circle" size={20} color="#666" /><Text style={styles.tabText}>Documento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { paddingTop: (StatusBar.currentHeight ?? 20), paddingHorizontal: 30, paddingBottom: 16 },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  tituloHeader: { fontSize: 26, fontWeight: '900', color: '#000' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 110 },
  avatarWrapper: { alignItems: 'center', marginVertical: 24 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#e95e07' },
  btnCamera: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#e95e07', borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  nomeExibido: { fontSize: 20, fontWeight: '900', color: '#000' },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF8F4', borderRadius: 16, paddingVertical: 16, marginBottom: 28, borderWidth: 1, borderColor: '#FFE0CC' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumero: { fontSize: 22, fontWeight: '900', color: '#e95e07' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#FFD0B0' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#000', borderRadius: 8, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  input: { flex: 1, fontSize: 14, color: '#000' },
  inputReadOnly: { color: '#555' },
  btnSair: { backgroundColor: '#e95e07', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnSairTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});