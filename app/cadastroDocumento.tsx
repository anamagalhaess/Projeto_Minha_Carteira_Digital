import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, Image, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, Switch, Alert, Modal, FlatList, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { pastasEmMemoria } from './home';
import { userStore } from './userStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatarData = (date: Date) => {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

export default function CadastrarDocumentoScreen() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pastaSelecionada, setPastaSelecionada] = useState<any>(null);
  const [dataValidade, setDataValidade] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [avisoAutomatico, setAvisoAutomatico] = useState(true);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);

  const handleCadastrar = () => {
    if (!nome.trim() || !pastaSelecionada) {
      Alert.alert('Atenção', 'Por favor, preencha o nome do documento e selecione uma pasta.');
      return;
    }

    const novoDoc = {
      id: Date.now().toString(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      dataValidade: dataValidade ? formatarData(dataValidade) : null,
      avisoAutomatico,
    };

    const pasta = pastasEmMemoria.find(p => p.id === pastaSelecionada.id);
    if (pasta) pasta.docs.push(novoDoc);

    Alert.alert('Sucesso', 'Documento cadastrado com sucesso!', [
      { text: 'OK', onPress: () => router.replace('/home') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo}>Cadastrar Documento</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/perfil', params: { totalPastas: pastasEmMemoria.length } })}>
            <Image source={require('../assets/images/fotoPerfil.jpg')} style={styles.perfilImage} />
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

        {/* Dropdown de Pastas */}
        <TouchableOpacity style={styles.inputContainer} onPress={() => setDropdownVisivel(true)}>
          <Text style={[styles.inputFake, { flex: 1 }, !pastaSelecionada && { color: '#999' }]}>
            {pastaSelecionada ? pastaSelecionada.nome : 'Selecione uma pasta *'}
          </Text>
          <Feather name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Modal dropdown pastas */}
        <Modal visible={dropdownVisivel} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisivel(false)}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitulo}>Selecione uma pasta</Text>
              {pastasEmMemoria.length === 0 ? (
                <Text style={styles.modalVazio}>Nenhuma pasta criada ainda.</Text>
              ) : (
                <FlatList
                  data={pastasEmMemoria}
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

        <TouchableOpacity style={styles.uploadCard}>
          <Feather name="plus" size={24} color="#666" />
          <Text style={styles.uploadText}>Frente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadCard}>
          <Feather name="plus" size={24} color="#666" />
          <Text style={styles.uploadText}>Verso</Text>
        </TouchableOpacity>

        {/* Campo data de validade com calendário */}
        <TouchableOpacity style={styles.inputContainer} onPress={() => setMostrarCalendario(true)}>
          <Text style={[styles.inputFake, { flex: 1 }, !dataValidade && { color: '#999' }]}>
            {dataValidade ? formatarData(dataValidade) : 'Data de validade (opcional)'}
          </Text>
          <Feather name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        {/* Calendário — Android abre nativo, iOS abre em Modal */}
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
                <TouchableOpacity
                  style={[styles.button, { marginTop: 16 }]}
                  onPress={() => setMostrarCalendario(false)}
                >
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

        <TouchableOpacity style={styles.button} onPress={handleCadastrar}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* TabBar */}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  logoTitulo: { fontSize: 22, fontWeight: '900', color: '#e95e07' },
  perfilImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 100 },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  input: { borderWidth: 1.5, borderColor: '#000', borderRadius: 8, height: 50, paddingHorizontal: 15, marginBottom: 16, fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#000', borderRadius: 8, height: 50, paddingHorizontal: 15, marginBottom: 16 },
  inputFake: { fontSize: 14, color: '#000' },
  uploadCard: { height: 100, borderWidth: 1.5, borderColor: '#000', borderRadius: 8, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadText: { marginTop: 5, color: '#666' },
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