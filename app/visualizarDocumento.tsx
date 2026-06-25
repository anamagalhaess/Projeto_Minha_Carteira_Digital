import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, StatusBar, Alert, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function VisualizarDocumentoScreen() {
  const { docId } = useLocalSearchParams();
  const [doc, setDoc] = useState<any>(null);
  const [pastas, setPastas] = useState<any[]>([]);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [ladoVisivel, setLadoVisivel] = useState<'frente' | 'verso'>('frente');
  const [favorito, setFavorito] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: docData } = await supabase
          .from('documentos').select('*, pastas(nome)').eq('id', docId).single();
        if (docData) { setDoc(docData); setFavorito(docData.favorito || false); }

        const { data: pastasData } = await supabase
          .from('pastas').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
        if (pastasData) setPastas(pastasData);

        const { data: perfil } = await supabase
          .from('perfis').select('foto_url').eq('id', user.id).single();
        if (perfil) setFotoUri(perfil.foto_url);

      } catch (error) {
        console.log('Erro ao carregar documento:', error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [docId]));

  const toggleFavorito = async () => {
    const novoValor = !favorito;
    setFavorito(novoValor);
    await supabase.from('documentos').update({ favorito: novoValor }).eq('id', docId);
  };

  const handleMoverPasta = async (novaPasta: any) => {
    if (novaPasta.id === doc?.pasta_id) { setDropdownVisivel(false); return; }
    const { error } = await supabase.from('documentos').update({ pasta_id: novaPasta.id }).eq('id', docId);
    if (!error) {
      setDoc({ ...doc, pasta_id: novaPasta.id, pastas: { nome: novaPasta.nome } });
      Alert.alert('Sucesso', `Documento movido para "${novaPasta.nome}"!`);
    }
    setDropdownVisivel(false);
  };

  const handleExcluir = () => {
    Alert.alert('Excluir Documento', `Tem certeza que deseja excluir "${doc?.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await supabase.from('documentos').delete().eq('id', docId);
        router.back();
      }}
    ]);
  };

  const handleBaixarPDF = async () => {
    if (!doc.frente_url && !doc.verso_url) {
      Alert.alert('Atenção', 'Este documento não possui imagens para gerar o PDF.');
      return;
    }
    try {
      const html = `
        <html><body style="font-family:Arial;padding:24px;">
          <h2 style="color:#e95e07;">${doc.nome}</h2>
          ${doc.descricao ? `<p>${doc.descricao}</p>` : ''}
          ${doc.data_validade ? `<p><strong>Validade:</strong> ${doc.data_validade}</p>` : ''}
          <hr/>
          <h3>Frente</h3>
          ${doc.frente_url ? `<img src="${doc.frente_url}" style="width:100%;"/>` : '<p>Sem imagem</p>'}
          <h3>Verso</h3>
          ${doc.verso_url ? `<img src="${doc.verso_url}" style="width:100%;"/>` : '<p>Sem imagem</p>'}
        </body></html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Salvar ${doc.nome}`,
        UTI: 'com.adobe.pdf',
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#e95e07" />
    </View>
  );

  if (!doc) return (
    <View style={styles.container}>
      <Text style={{ padding: 40, color: '#999' }}>Documento não encontrado.</Text>
    </View>
  );

  const imagemAtual = ladoVisivel === 'frente' ? doc.frente_url : doc.verso_url;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo} numberOfLines={1}>{doc.nome}</Text>
          <TouchableOpacity onPress={() => router.push('/perfil')}>
            <Image source={fotoUri ? { uri: fotoUri } : require('../assets/images/fotoPerfil.jpg')} style={styles.perfilImage} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#000" />
          <Text style={styles.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.carrosselContainer}>
          <TouchableOpacity style={styles.seta} onPress={() => setLadoVisivel('frente')} disabled={ladoVisivel === 'frente'}>
            <Feather name="chevron-left" size={28} color={ladoVisivel === 'frente' ? '#DDD' : '#333'} />
          </TouchableOpacity>
          <View style={styles.imagemCard}>
            {imagemAtual
              ? <Image source={{ uri: imagemAtual }} style={styles.imagemReal} />
              : <><Feather name="image" size={48} color="#CCC" /><Text style={styles.imagemLabel}>{ladoVisivel === 'frente' ? 'Frente' : 'Verso'}</Text></>
            }
          </View>
          <TouchableOpacity style={styles.seta} onPress={() => setLadoVisivel('verso')} disabled={ladoVisivel === 'verso'}>
            <Feather name="chevron-right" size={28} color={ladoVisivel === 'verso' ? '#DDD' : '#333'} />
          </TouchableOpacity>
        </View>

        <View style={styles.indicadorRow}>
          <View style={[styles.indicador, ladoVisivel === 'frente' && styles.indicadorAtivo]} />
          <View style={[styles.indicador, ladoVisivel === 'verso' && styles.indicadorAtivo]} />
        </View>

        <TouchableOpacity style={styles.btnBaixar} onPress={handleBaixarPDF}>
          <Feather name="download" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnBaixarTexto}>Baixar PDF</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Data de validade</Text>
        <View style={styles.inputRow}>
          <Text style={[styles.inputTexto, !doc.data_validade && { color: '#999' }]}>
            {doc.data_validade || 'Sem data de validade'}
          </Text>
          <Feather name="calendar" size={18} color="#666" />
        </View>

        <Text style={styles.label}>Favoritar</Text>
        <TouchableOpacity style={styles.inputRow} onPress={toggleFavorito}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Feather name="star" size={16} color={favorito ? '#e95e07' : '#999'} style={{ marginRight: 8 }} />
            <Text style={[styles.inputTexto, { color: favorito ? '#e95e07' : '#333' }]}>{favorito ? 'Sim' : 'Não'}</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Alterar pasta</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setDropdownVisivel(true)}>
          <Text style={styles.inputTexto}>{doc.pastas?.nome || 'Selecionar pasta'}</Text>
          <Feather name="chevron-right" size={18} color="#666" />
        </TouchableOpacity>

        <Modal visible={dropdownVisivel} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisivel(false)}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitulo}>Mover para pasta</Text>
              {pastas.length === 0
                ? <Text style={styles.modalVazio}>Nenhuma pasta disponível.</Text>
                : <FlatList
                    data={pastas}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.modalItem} onPress={() => handleMoverPasta(item)}>
                        <Feather name="folder" size={18} color="#e95e07" style={{ marginRight: 10 }} />
                        <Text style={styles.modalItemTexto}>{item.nome}</Text>
                        {doc.pasta_id === item.id && <Feather name="check" size={18} color="#e95e07" style={{ marginLeft: 'auto' }} />}
                      </TouchableOpacity>
                    )}
                  />
              }
            </View>
          </TouchableOpacity>
        </Modal>

        <TouchableOpacity style={styles.btnExcluir} onPress={handleExcluir}>
          <Text style={styles.btnExcluirTexto}>Excluir Documento</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  fixedTop: { paddingTop: (StatusBar.currentHeight ?? 20), paddingBottom: 20, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  logoTitulo: { fontSize: 22, fontWeight: '900', color: '#e95e07', flex: 1, marginRight: 10 },
  perfilImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 100 },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  carrosselContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  seta: { padding: 8 },
  imagemCard: { flex: 1, height: 200, borderWidth: 1.5, borderColor: '#DDD', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA', overflow: 'hidden' },
  imagemReal: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagemLabel: { marginTop: 8, color: '#AAA', fontSize: 13 },
  indicadorRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 6 },
  indicador: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD' },
  indicadorAtivo: { backgroundColor: '#e95e07', width: 20 },
  btnBaixar: { backgroundColor: '#e95e07', height: 50, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  btnBaixarTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 8, height: 50, paddingHorizontal: 15, marginBottom: 16, backgroundColor: '#FAFAFA' },
  inputTexto: { fontSize: 14, color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 30 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: 350 },
  modalTitulo: { fontSize: 16, fontWeight: '900', color: '#e95e07', marginBottom: 16 },
  modalVazio: { fontSize: 13, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItemTexto: { fontSize: 15, fontWeight: '600', color: '#333' },
  btnExcluir: { backgroundColor: '#e95e07', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnExcluirTexto: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});