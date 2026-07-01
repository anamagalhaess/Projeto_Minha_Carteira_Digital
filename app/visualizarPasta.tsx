import React, { useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function VisualizarPastaScreen() {
  const { pastaId } = useLocalSearchParams();
  const [pasta, setPasta] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: pastaData } = await supabase
            .from('pastas')
            .select('*')
            .eq('id', pastaId)
            .single();

          if (pastaData) setPasta(pastaData);

          const { data: docsData } = await supabase
            .from('documentos')
            .select('*')
            .eq('pasta_id', pastaId)
            .order('created_at', { ascending: true });

          if (docsData) setDocs(docsData);

          const { data: perfil } = await supabase
            .from('perfis')
            .select('foto_url')
            .eq('id', user.id)
            .single();

          if (perfil) setFotoUri(perfil.foto_url);

        } catch (error) {
          console.log('Erro ao carregar pasta:', error);
        } finally {
          setLoading(false);
        }
      };
      carregar();
    }, [pastaId])
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#e95e07" />
      </View>
    );
  }

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

      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Text style={styles.logoTitulo}>{pasta.nome}</Text>
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

        {pasta.descricao ? (
          <Text style={styles.descricaoPasta}>{pasta.descricao}</Text>
        ) : null}

        {docs.length > 0 ? (
          docs.map((doc: any) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.docCard}
              onPress={() => router.push({ pathname: '/visualizarDocumento', params: { docId: doc.id } })}
            >
              <View style={styles.docIcone}>
                {doc.frente_url ? (
                  <Image source={{ uri: doc.frente_url }} style={styles.docThumb} />
                ) : (
                  <Feather name="file-text" size={24} color="#e95e07" />
                )}
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docNome}>{doc.nome}</Text>
                {doc.descricao ? (
                  <Text style={styles.docDescricao} numberOfLines={1}>{doc.descricao}</Text>
                ) : null}
                {doc.data_validade ? (
                  <Text style={styles.docValidade}>Validade: {doc.data_validade}</Text>
                ) : null}
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.vazio}>
            <Feather name="folder" size={48} color="#DDD" />
            <Text style={styles.vazioTexto}>Nenhum documento nesta pasta</Text>
            <TouchableOpacity style={styles.btnAdicionarDoc} onPress={() => router.push('/cadastroDocumento')}>
              <Text style={styles.btnAdicionarDocTexto}>+ Adicionar documento</Text>
            </TouchableOpacity>
          </View>
        )}

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, marginTop:30 },
  logoTitulo: { fontSize: 22, fontWeight: '900', color: '#e95e07', flex: 1, marginRight: 10 },
  perfilImage: { width: 50, height: 50, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 100 },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  descricaoPasta: { fontSize: 13, color: '#888', marginBottom: 20, fontStyle: 'italic' },
  docCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#F0F0F0', borderRadius: 12, padding: 16, marginBottom: 12, backgroundColor: '#FAFAFA' },
  docIcone: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
  docThumb: { width: 44, height: 44, borderRadius: 10 },
  docInfo: { flex: 1 },
  docNome: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 2 },
  docDescricao: { fontSize: 12, color: '#999' },
  docValidade: { fontSize: 11, color: '#e95e07', marginTop: 3, fontWeight: '600' },
  vazio: { alignItems: 'center', marginTop: 60 },
  vazioTexto: { fontSize: 14, color: '#AAA', marginTop: 16, marginBottom: 24 },
  btnAdicionarDoc: { borderWidth: 1.5, borderColor: '#e95e07', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  btnAdicionarDocTexto: { color: '#e95e07', fontWeight: '700', fontSize: 14 },
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});