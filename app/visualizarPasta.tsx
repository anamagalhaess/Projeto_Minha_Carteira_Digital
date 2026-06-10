import React from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { pastasEmMemoria } from './home';
import { userStore } from './userStore';

export default function VisualizarPastaScreen() {
  const { pastaId } = useLocalSearchParams();

  const pasta = pastasEmMemoria.find(p => p.id === pastaId);

  if (!pasta) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 40, color: '#999' }}>Pasta não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo}>{pasta.nome}</Text>
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

        {/* Descrição da pasta */}
        {pasta.descricao ? (
          <Text style={styles.descricaoPasta}>{pasta.descricao}</Text>
        ) : null}

        {/* Lista de documentos */}
        {pasta.docs && pasta.docs.length > 0 ? (
          pasta.docs.map((doc: any) => (
            <TouchableOpacity key={doc.id} style={styles.docCard} onPress={() => router.push({ pathname: '/visualizarDocumento', params: { pastaId: pasta.id, docId: doc.id } })}>
              <View style={styles.docIcone}>
                <Feather name="file-text" size={24} color="#e95e07" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docNome}>{doc.nome}</Text>
                {doc.descricao ? (
                  <Text style={styles.docDescricao} numberOfLines={1}>{doc.descricao}</Text>
                ) : null}
                {doc.dataValidade ? (
                  <Text style={styles.docValidade}>Validade: {doc.dataValidade}</Text>
                ) : null}
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.vazio}>
            <Feather name="folder" size={48} color="#DDD" />
            <Text style={styles.vazioTexto}>Nenhum documento nesta pasta</Text>
            <TouchableOpacity
              style={styles.btnAdicionarDoc}
              onPress={() => router.push('/cadastroDocumento')}
            >
              <Text style={styles.btnAdicionarDocTexto}>+ Adicionar documento</Text>
            </TouchableOpacity>
          </View>
        )}

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
  fixedTop: { paddingTop: (StatusBar.currentHeight ?? 20), paddingBottom: 20, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  logoTitulo: { fontSize: 22, fontWeight: '900', color: '#e95e07', flex: 1, marginRight: 10 },
  perfilImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 100 },

  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  descricaoPasta: { fontSize: 13, color: '#888', marginBottom: 20, fontStyle: 'italic' },

  docCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F0F0F0', borderRadius: 12,
    padding: 16, marginBottom: 12, backgroundColor: '#FAFAFA',
  },
  docIcone: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  docInfo: { flex: 1 },
  docNome: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 2 },
  docDescricao: { fontSize: 12, color: '#999' },
  docValidade: { fontSize: 11, color: '#e95e07', marginTop: 3, fontWeight: '600' },

  vazio: { alignItems: 'center', marginTop: 60 },
  vazioTexto: { fontSize: 14, color: '#AAA', marginTop: 16, marginBottom: 24 },
  btnAdicionarDoc: {
    borderWidth: 1.5, borderColor: '#e95e07', borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  btnAdicionarDocTexto: { color: '#e95e07', fontWeight: '700', fontSize: 14 },

  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});