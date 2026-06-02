import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, StatusBar, Alert, Dimensions, Modal, FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { pastasEmMemoria } from './home';

const { width } = Dimensions.get('window');

export default function VisualizarDocumentoScreen() {
  const { pastaId, docId } = useLocalSearchParams();

  const pasta = pastasEmMemoria.find(p => p.id === pastaId);
  const doc = pasta?.docs?.find((d: any) => d.id === docId);

  const [ladoVisivel, setLadoVisivel] = useState<'frente' | 'verso'>('frente');
  const [dataValidade, setDataValidade] = useState(doc?.dataValidade || '');
  const [favorito, setFavorito] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [pastaSelecionada, setPastaSelecionada] = useState<any>(pasta);

  if (!doc) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 40, color: '#999' }}>Documento não encontrado.</Text>
      </View>
    );
  }

  const handleExcluir = () => {
    Alert.alert(
      'Excluir Documento',
      `Tem certeza que deseja excluir "${doc.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (pasta) {
              pasta.docs = pasta.docs.filter((d: any) => d.id !== docId);
            }
            router.back();
          }
        }
      ]
    );
  };

  const handleMoverPasta = (novaPasta: any) => {
    if (pasta && novaPasta.id !== pasta.id) {
      pasta.docs = pasta.docs.filter((d: any) => d.id !== docId);
      novaPasta.docs.push(doc);
      setPastaSelecionada(novaPasta);
    }
    setDropdownVisivel(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo} numberOfLines={1}>{doc.nome}</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/perfil', params: { totalPastas: pastasEmMemoria.length } })}>
            <Image source={require('../assets/images/fotoPerfil.jpg')} style={styles.perfilImage} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Voltar */}
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#000" />
          <Text style={styles.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        {/* Carrossel frente/verso */}
        <View style={styles.carrosselContainer}>
          <TouchableOpacity
            style={styles.seta}
            onPress={() => setLadoVisivel('frente')}
            disabled={ladoVisivel === 'frente'}
          >
            <Feather name="chevron-left" size={28} color={ladoVisivel === 'frente' ? '#DDD' : '#333'} />
          </TouchableOpacity>

          <View style={styles.imagemCard}>
            <Feather name="image" size={48} color="#CCC" />
            <Text style={styles.imagemLabel}>{ladoVisivel === 'frente' ? 'Frente' : 'Verso'}</Text>
          </View>

          <TouchableOpacity
            style={styles.seta}
            onPress={() => setLadoVisivel('verso')}
            disabled={ladoVisivel === 'verso'}
          >
            <Feather name="chevron-right" size={28} color={ladoVisivel === 'verso' ? '#DDD' : '#333'} />
          </TouchableOpacity>
        </View>

        {/* Indicador frente/verso */}
        <View style={styles.indicadorRow}>
          <View style={[styles.indicador, ladoVisivel === 'frente' && styles.indicadorAtivo]} />
          <View style={[styles.indicador, ladoVisivel === 'verso' && styles.indicadorAtivo]} />
        </View>

        {/* Botão Baixar PDF */}
        <TouchableOpacity style={styles.btnBaixar}>
          <Feather name="download" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnBaixarTexto}>Baixar PDF</Text>
        </TouchableOpacity>

        {/* Alterar data de validade */}
        <Text style={styles.label}>Alterar data de validade</Text>
        <View style={styles.inputRow}>
          <Text style={[styles.inputTexto, !dataValidade && { color: '#999' }]}>
            {dataValidade || 'Data de validade'}
          </Text>
          <Feather name="calendar" size={18} color="#666" />
        </View>

        {/* Favoritar */}
        <Text style={styles.label}>Favoritar</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setFavorito(!favorito)}>
          <Text style={styles.inputTexto}>{favorito ? 'Sim' : 'Não'}</Text>
          <Feather name="chevron-right" size={18} color="#666" />
        </TouchableOpacity>

        {/* Alterar pasta */}
        <Text style={styles.label}>Alterar pasta</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setDropdownVisivel(true)}>
          <Text style={[styles.inputTexto, !pastaSelecionada && { color: '#999' }]}>
            {pastaSelecionada ? pastaSelecionada.nome : 'Selecionar pasta'}
          </Text>
          <Feather name="chevron-right" size={18} color="#666" />
        </TouchableOpacity>

        {/* Modal troca de pasta */}
        <Modal visible={dropdownVisivel} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisivel(false)}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitulo}>Mover para pasta</Text>
              {pastasEmMemoria.length === 0 ? (
                <Text style={styles.modalVazio}>Nenhuma pasta disponível.</Text>
              ) : (
                <FlatList
                  data={pastasEmMemoria}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => handleMoverPasta(item)}>
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

        {/* Excluir */}
        <TouchableOpacity style={styles.btnExcluir} onPress={handleExcluir}>
          <Text style={styles.btnExcluirTexto}>Excluir Documento</Text>
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
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/cadastroDocumento')}>
          <Feather name="plus-circle" size={20} color="#666" /><Text style={styles.tabText}>Documento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  fixedTop: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  logoTitulo: { fontSize: 22, fontWeight: '900', color: '#e95e07', flex: 1, marginRight: 10 },
  perfilImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 100 },

  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // Carrossel
  carrosselContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  seta: { padding: 8 },
  imagemCard: {
    flex: 1, height: 200, borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA',
  },
  imagemLabel: { marginTop: 8, color: '#AAA', fontSize: 13 },
  indicadorRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 6 },
  indicador: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD' },
  indicadorAtivo: { backgroundColor: '#e95e07', width: 20 },

  // Botão PDF
  btnBaixar: {
    backgroundColor: '#e95e07', height: 50, borderRadius: 8,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  btnBaixarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Campos
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 8,
    height: 50, paddingHorizontal: 15, marginBottom: 16, backgroundColor: '#FAFAFA',
  },
  inputTexto: { fontSize: 14, color: '#333' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 30 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: 350 },
  modalTitulo: { fontSize: 16, fontWeight: '900', color: '#e95e07', marginBottom: 16 },
  modalVazio: { fontSize: 13, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItemTexto: { fontSize: 15, fontWeight: '600', color: '#333' },

  // Excluir
  btnExcluir: {
    backgroundColor: '#e95e07', height: 50, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  btnExcluirTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});