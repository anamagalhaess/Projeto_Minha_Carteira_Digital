import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { pastasEmMemoria } from './home';

export default function FavoritosScreen() {
  // Coleta todos os docs favoritados de todas as pastas
  const docsFavoritados = () => {
    const resultado: { doc: any; pasta: any }[] = [];
    pastasEmMemoria.forEach(pasta => {
      (pasta.docs || []).forEach((doc: any) => {
        if (doc.favorito) resultado.push({ doc, pasta });
      });
    });
    return resultado;
  };

  const favoritos = docsFavoritados();

  // Agrupa por pasta
  const porPasta = pastasEmMemoria
    .map(pasta => ({
      pasta,
      docs: (pasta.docs || []).filter((d: any) => d.favorito),
    }))
    .filter(item => item.docs.length > 0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo}>Favoritos</Text>
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

        {porPasta.length === 0 ? (
          /* Estado vazio */
          <View style={styles.vazio}>
            <Feather name="star" size={52} color="#DDD" />
            <Text style={styles.vazioTitulo}>Nenhum favorito ainda</Text>
            <Text style={styles.vazioTexto}>
              Abra um documento e toque em "Favoritar" para ele aparecer aqui.
            </Text>
          </View>
        ) : (
          porPasta.map(({ pasta, docs }) => (
            <View key={pasta.id} style={styles.grupoContainer}>

              {/* Badge da pasta */}
              <View style={styles.pastaBadge}>
                <Text style={styles.pastaBadgeTexto}>{pasta.nome}</Text>
              </View>

              {/* Documentos da pasta */}
              {docs.map((doc: any) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docCard}
                  onPress={() => router.push({ pathname: '/visualizarDocumento', params: { pastaId: pasta.id, docId: doc.id } })}
                >
                  <View style={styles.docIcone}>
                    <Feather name="file-text" size={22} color="#e95e07" />
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
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* TabBar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="star" size={20} color="#e95e07" />
          <Text style={[styles.tabText, { color: '#e95e07' }]}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
          <Feather name="home" size={20} color="#666" />
          <Text style={styles.tabText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/cadastroDocumento')}>
          <Feather name="plus-circle" size={20} color="#666" />
          <Text style={styles.tabText}>Documento</Text>
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

  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // Estado vazio
  vazio: { alignItems: 'center', marginTop: 80 },
  vazioTitulo: { fontSize: 18, fontWeight: '800', color: '#333', marginTop: 20, marginBottom: 10 },
  vazioTexto: { fontSize: 13, color: '#AAA', textAlign: 'center', lineHeight: 20 },

  // Grupo por pasta
  grupoContainer: { marginBottom: 24 },
  pastaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e95e07',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 12,
  },
  pastaBadgeTexto: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  // Card do documento
  docCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#F0F0F0', borderRadius: 12,
    padding: 16, marginBottom: 10, backgroundColor: '#FAFAFA',
  },
  docIcone: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  docInfo: { flex: 1 },
  docNome: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 2 },
  docDescricao: { fontSize: 12, color: '#999' },
  docValidade: { fontSize: 11, color: '#e95e07', marginTop: 3, fontWeight: '600' },

  // TabBar
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});