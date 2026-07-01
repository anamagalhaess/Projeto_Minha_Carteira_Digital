import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, View, Text, Image, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, Switch, Alert, Modal, FlatList, Platform, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const formatarData = (date: Date) => {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

const uploadImagem = async (uri: string, userId: string, nomeArquivo: string) => {
  const ext = uri.split('.').pop() || 'jpg';
  const path = `${userId}/${nomeArquivo}.${ext}`;
  const formData = new FormData();
  formData.append('file', { uri, name: path, type: `image/${ext}` } as any);

  const { error } = await supabase.storage
    .from('documentos')
    .upload(path, formData, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('documentos').getPublicUrl(path);
  return data.publicUrl;
};

export default function CadastrarDocumentoScreen() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pastaSelecionada, setPastaSelecionada] = useState<any>(null);
  const [dataValidade, setDataValidade] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [avisoAutomatico, setAvisoAutomatico] = useState(true);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [pastas, setPastas] = useState<any[]>([]);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [frenteUri, setFrenteUri] = useState<string | null>(null);
  const [versoUri, setVersoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: pastasData } = await supabase
          .from('pastas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (pastasData) setPastas(pastasData);

        const { data: perfil } = await supabase
          .from('perfis')
          .select('foto_url')
          .eq('id', user.id)
          .single();

        if (perfil) setFotoUri(perfil.foto_url);
      };
      carregar();
    }, [])
  );

  const escolherImagem = async (lado: 'frente' | 'verso') => {
    Alert.alert(
      'Adicionar imagem',
      'Como deseja adicionar a imagem?',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true, aspect: [4, 3], quality: 0.7,
            });
            if (!result.canceled) {
              lado === 'frente' ? setFrenteUri(result.assets[0].uri) : setVersoUri(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true, aspect: [4, 3], quality: 0.7,
            });
            if (!result.canceled) {
              lado === 'frente' ? setFrenteUri(result.assets[0].uri) : setVersoUri(result.assets[0].uri);
            }
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !pastaSelecionada) {
      Alert.alert('Atenção', 'Por favor, preencha o nome do documento e selecione uma pasta.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado.');

      const timestamp = Date.now();
      let frenteUrl = null;
      let versoUrl = null;

      if (frenteUri) frenteUrl = await uploadImagem(frenteUri, user.id, `frente_${timestamp}`);
      if (versoUri) versoUrl = await uploadImagem(versoUri, user.id, `verso_${timestamp}`);

      const { error } = await supabase.from('documentos').insert({
        user_id: user.id,
        pasta_id: pastaSelecionada.id,
        nome: nome.trim(),
        descricao: descricao.trim(),
        data_validade: dataValidade ? formatarData(dataValidade) : null,
        aviso_automatico: avisoAutomatico,
        frente_url: frenteUrl,
        verso_url: versoUrl,
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Documento cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/home') }
      ]);

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao cadastrar documento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo}>Cadastrar Documento</Text>
          <TouchableOpacity onPress={() => router.push('/perfil')}>
            <Image
              source={fotoUri ? { uri: fotoUri } : require('../assets/images/fotoPerfil.jpg')}
              style={styles.perfilImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#000" />
          <Text style={styles.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Nome do Documento *" placeholderTextColor="#999" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Descrição" placeholderTextColor="#999" value={descricao} onChangeText={setDescricao} />

        <TouchableOpacity style={styles.inputContainer} onPress={() => setDropdownVisivel(true)}>
          <Text style={[styles.inputFake, { flex: 1 }, !pastaSelecionada && { color: '#999' }]}>
            {pastaSelecionada ? pastaSelecionada.nome : 'Selecione uma pasta *'}
          </Text>
          <Feather name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Modal visible={dropdownVisivel} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisivel(false)}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitulo}>Selecione uma pasta</Text>
              {pastas.length === 0 ? (
                <Text style={styles.modalVazio}>Nenhuma pasta criada ainda.</Text>
              ) : (
                <FlatList
                  data={pastas}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => { setPastaSelecionada(item); setDropdownVisivel(false); }}
                    >
                      <Feather name="folder" size={18} color="#e95e07" style={{ marginRight: 10 }} />
                      <Text style={styles.modalItemTexto}>{item.nome}</Text>
                      {pastaSelecionada?.id === item.id && (
                        <Feather name="check" size={18} color="#e95e07" style={{ marginLeft: 'auto' }} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Upload Frente */}
        <TouchableOpacity style={styles.uploadCard} onPress={() => escolherImagem('frente')}>
          {frenteUri ? (
            <Image source={{ uri: frenteUri }} style={styles.uploadPreview} />
          ) : (
            <>
              <Feather name="camera" size={24} color="#666" />
              <Text style={styles.uploadText}>Frente</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Upload Verso */}
        <TouchableOpacity style={styles.uploadCard} onPress={() => escolherImagem('verso')}>
          {versoUri ? (
            <Image source={{ uri: versoUri }} style={styles.uploadPreview} />
          ) : (
            <>
              <Feather name="camera" size={24} color="#666" />
              <Text style={styles.uploadText}>Verso</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.inputContainer} onPress={() => setMostrarCalendario(true)}>
          <Text style={[styles.inputFake, { flex: 1 }, !dataValidade && { color: '#999' }]}>
            {dataValidade ? formatarData(dataValidade) : 'Data de validade (opcional)'}
          </Text>
          <Feather name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        {mostrarCalendario && Platform.OS === 'android' && (
          <DateTimePicker
            value={dataValidade || new Date()}
            mode="date"
            display="calendar"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setMostrarCalendario(false);
              if (event.type === 'set' && date) setDataValidade(date);
            }}
          />
        )}

        {Platform.OS === 'ios' && (
          <Modal visible={mostrarCalendario} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitulo}>Selecione a data</Text>
                <DateTimePicker
                  value={dataValidade || new Date()}
                  mode="date"
                  display="inline"
                  minimumDate={new Date()}
                  locale="pt-BR"
                  onChange={(_, date) => { if (date) setDataValidade(date); }}
                  accentColor="#e95e07"
                />
                <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => setMostrarCalendario(false)}>
                  <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        <View style={styles.toggleRow}>
          <Text style={styles.toggleTexto}>Gerar aviso automático</Text>
          <Switch value={avisoAutomatico} onValueChange={setAvisoAutomatico} trackColor={{ true: '#e95e07' }} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCadastrar} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/favoritos')}>
          <Feather name="star" size={20} color="#666" /><Text style={styles.tabText}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
          <Feather name="home" size={20} color="#666" /><Text style={styles.tabText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="plus-circle" size={20} color="#e95e07" /><Text style={[styles.tabText, { color: '#e95e07' }]}>Documento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  fixedTop: { paddingTop: (StatusBar.currentHeight ?? 20), paddingBottom: 20, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, marginTop: 30 },
  logoTitulo: { fontSize: 22, fontWeight: '900', color: '#e95e07' },
  perfilImage: { width: 50, height: 50, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 100 },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  input: { borderWidth: 1.5, borderColor: '#000', borderRadius: 8, height: 50, paddingHorizontal: 15, marginBottom: 16, fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#000', borderRadius: 8, height: 50, paddingHorizontal: 15, marginBottom: 16 },
  inputFake: { fontSize: 14, color: '#000' },
  uploadCard: { height: 150, borderWidth: 1.5, borderColor: '#000', borderRadius: 8, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  uploadPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadText: { marginTop: 8, color: '#666' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  toggleTexto: { fontWeight: 'bold' },
  button: { backgroundColor: '#e95e07', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 16 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, overflow: 'hidden', width: '100%' },
  modalTitulo: { fontSize: 16, fontWeight: '900', color: '#e95e07', marginBottom: 16 },
  modalVazio: { fontSize: 13, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItemTexto: { fontSize: 15, fontWeight: '600', color: '#333' },
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});