import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, View, Text, Image, TextInput, TouchableOpacity, 
  ScrollView, Dimensions, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const ACESSO_RAPIDO_KEY = 'acesso_rapido';

export default function HomeScreen() {
  const [acessoRapido, setAcessoRapido] = useState<any[]>([]);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [minhasPastas, setMinhasPastas] = useState<any[]>([]);
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from('perfis').select('nome_completo, foto_url').eq('id', user.id).single();
      if (perfil) {
        setPrimeiroNome(perfil.nome_completo?.split(' ')[0] || '');
        setFotoUri(perfil.foto_url);
      }

      const { data: pastas } = await supabase
        .from('pastas').select('*, documentos(*)').eq('user_id', user.id).order('created_at', { ascending: true });
      if (pastas) {
        setMinhasPastas(pastas.map((p: any) => ({ ...p, docs: p.documentos || [] })));
      }

      // Carrega acesso rápido do AsyncStorage
      const salvo = await AsyncStorage.getItem(ACESSO_RAPIDO_KEY);
      if (salvo) setAcessoRapido(JSON.parse(salvo));

    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { carregarDados(); }, []));

  const salvarAcessoRapido = async (lista: any[]) => {
    setAcessoRapido(lista);
    await AsyncStorage.setItem(ACESSO_RAPIDO_KEY, JSON.stringify(lista));
  };

  const adicionarDoc = (doc: any, pastaId: string) => {
    const jaAdicionado = acessoRapido.find(item => item.id === doc.id);
    if (!jaAdicionado && acessoRapido.length < 3) {
      const novaLista = [...acessoRapido, { ...doc, pastaId }];
      salvarAcessoRapido(novaLista);
      setMenuVisivel(false);
    }
  };

  const removerDoAcessoRapido = (id: string) => {
    Alert.alert(
      'Acesso Rápido',
      'Deseja remover este documento do Acesso Rápido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => {
          const novaLista = acessoRapido.filter(item => item.id !== id);
          salvarAcessoRapido(novaLista);
        }}
      ]
    );
  };

  const resultadosBusca = () => {
    if (!busca.trim()) return null;
    const termo = busca.toLowerCase();
    const pastas: any[] = [];
    const docs: any[] = [];
    minhasPastas.forEach(pasta => {
      if (pasta.nome.toLowerCase().includes(termo)) pastas.push(pasta);
      (pasta.docs || []).forEach((doc: any) => {
        if (doc.nome.toLowerCase().includes(termo)) docs.push({ ...doc, pastaNome: pasta.nome });
      });
    });
    return { pastas, docs };
  };

  const resultados = resultadosBusca();

  const docsProximosVencer = () => {
    const hoje = new Date();
    const limite = new Date();
    limite.setMonth(limite.getMonth() + 3);
    const resultado: { doc: any; diasRestantes: number }[] = [];
    minhasPastas.forEach(pasta => {
      (pasta.docs || []).forEach((doc: any) => {
        if (!doc.data_validade || !doc.aviso_automatico) return;
        const [dia, mes, ano] = doc.data_validade.split('/').map(Number);
        const vencimento = new Date(ano, mes - 1, dia);
        if (vencimento <= limite && vencimento >= hoje) {
          const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          resultado.push({ doc, diasRestantes: diff });
        }
      });
    });
    return resultado.sort((a, b) => a.diasRestantes - b.diasRestantes);
  };

  const textoAviso = (dias: number) => {
    if (dias === 0) return 'Vence hoje!';
    if (dias < 30) return `Falta${dias === 1 ? '' : 'm'} ${dias} dia${dias === 1 ? '' : 's'} para vencer`;
    const meses = Math.floor(dias / 30);
    return `Falta${meses === 1 ? '' : 'm'} ${meses} ${meses === 1 ? 'mês' : 'meses'} para vencer`;
  };

  const confirmarExclusao = (id: string, nome: string) => {
    Alert.alert('Apagar Pasta', `Tem certeza que deseja apagar a pasta "${nome}" e todos os documentos nela?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarPasta(id) }
    ]);
  };

  const apagarPasta = async (id: string) => {
    const { error } = await supabase.from('pastas').delete().eq('id', id);
    if (!error) setMinhasPastas(prev => prev.filter(p => p.id !== id));
  };

  const MiniMenu = () => (
    <View style={styles.miniMenu}>
      {minhasPastas.length > 0 ? (
        minhasPastas.map(pasta => (
          <View key={pasta.id} style={styles.menuSection}>
            <Text style={styles.menuTitle}>{pasta.nome}</Text>
            {pasta.docs && pasta.docs.length > 0 ? (
              pasta.docs.map((doc: any, i: number) => (
                <TouchableOpacity key={i} style={styles.menuItem} onPress={() => adicionarDoc(doc, pasta.id)}>
                  <Text style={{ fontSize: 15 }}>{doc.nome}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.textoVazio}>Nenhum documento nesta pasta</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.textoVazio}>Você ainda não possui pastas. Crie uma nova pasta abaixo!</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.titleText}>Olá, {primeiroNome}!</Text>
            <Text style={styles.subText}>Sou sua carteira digital</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/perfil')}>
            <Image source={fotoUri ? { uri: fotoUri } : require('../assets/images/fotoPerfil.jpg')} style={styles.perfilImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar documentos e pastas..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Feather name="x" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e95e07" style={{ marginTop: 40 }} />
      ) : resultados ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Resultados para "{busca}"</Text>
          {resultados.pastas.length === 0 && resultados.docs.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Feather name="search" size={48} color="#DDD" />
              <Text style={{ color: '#AAA', marginTop: 12, fontSize: 14 }}>Nenhum resultado encontrado.</Text>
            </View>
          )}
          {resultados.pastas.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>Pastas</Text>
              {resultados.pastas.map((pasta: any) => (
                <TouchableOpacity key={pasta.id} style={styles.resultadoCard}
                  onPress={() => router.push({ pathname: '/visualizarPasta', params: { pastaId: pasta.id } })}>
                  <View style={styles.resultadoIcone}><Feather name="folder" size={22} color="#e95e07" /></View>
                  <View style={styles.resultadoInfo}>
                    <Text style={styles.resultadoNome}>{pasta.nome}</Text>
                    {pasta.descricao ? <Text style={styles.resultadoSub}>{pasta.descricao}</Text> : null}
                  </View>
                  <Feather name="chevron-right" size={18} color="#CCC" />
                </TouchableOpacity>
              ))}
            </>
          )}
          {resultados.docs.length > 0 && (
            <>
              <Text style={[styles.subSectionTitle, { marginTop: 16 }]}>Documentos</Text>
              {resultados.docs.map((doc: any) => (
                <TouchableOpacity key={doc.id} style={styles.resultadoCard}
                  onPress={() => router.push({ pathname: '/visualizarDocumento', params: { docId: doc.id } })}>
                  <View style={styles.resultadoIcone}>
                    {doc.frente_url
                      ? <Image source={{ uri: doc.frente_url }} style={styles.resultadoThumb} />
                      : <Feather name="file-text" size={22} color="#e95e07" />}
                  </View>
                  <View style={styles.resultadoInfo}>
                    <Text style={styles.resultadoNome}>{doc.nome}</Text>
                    <Text style={styles.resultadoSub}>{doc.pastaNome}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#CCC" />
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.grid}>
            {acessoRapido.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => router.push({ pathname: '/visualizarDocumento', params: { docId: doc.id } })}
                onLongPress={() => removerDoAcessoRapido(doc.id)}
                delayLongPress={500}
              >
                <Text style={styles.cardNome} numberOfLines={1}>{doc.nome.toUpperCase()}</Text>
                <View style={styles.underline} />
              </TouchableOpacity>
            ))}
            {acessoRapido.length < 3 && (
              <TouchableOpacity style={styles.addCard} onPress={() => setMenuVisivel(!menuVisivel)}>
                <Feather name="plus-circle" size={24} color="#CCC" />
                <Text style={styles.addCardText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>

          {menuVisivel && <MiniMenu />}

          {docsProximosVencer().length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Aviso</Text>
              {docsProximosVencer().map(({ doc, diasRestantes }) => (
                <View key={doc.id} style={styles.avisoCard}>
                  <View style={styles.avisoIcone}><Feather name="bell" size={22} color="#e95e07" /></View>
                  <View style={styles.avisoInfo}>
                    <Text style={styles.avisoNome}>{doc.nome}</Text>
                    <Text style={styles.avisoTexto}>{textoAviso(diasRestantes)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Minhas Pastas</Text>
          <View style={styles.grid}>
            {minhasPastas.map((pasta) => (
              <TouchableOpacity
                key={pasta.id}
                style={styles.pastaCard}
                onPress={() => router.push({ pathname: '/visualizarPasta', params: { pastaId: pasta.id } })}
                onLongPress={() => confirmarExclusao(pasta.id, pasta.nome)}
                delayLongPress={500}
              >
                <Text style={styles.pastaNome} numberOfLines={1}>{pasta.nome.toUpperCase()}</Text>
                <View style={styles.underline} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.pastaCardAdicionar} onPress={() => router.push('/cadastroPasta')}>
              <Feather name="plus-circle" size={24} color="#CCC" />
              <Text style={styles.addCardText}>Nova pasta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/favoritos')}>
          <Feather name="star" size={20} color="#666" /><Text style={styles.tabText}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
          <Feather name="home" size={20} color="#e95e07" /><Text style={[styles.tabText, { color: '#e95e07' }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/cadastroDocumento')}>
          <Feather name="plus-circle" size={20} color="#666" /><Text style={styles.tabText}>Documento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerContainer: { backgroundColor: '#FFF', paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: (StatusBar.currentHeight ?? 20), marginTop: 30},
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
  titleText: { fontSize: 24, fontWeight: 'bold' },
  subText: { color: '#666' },
  perfilImage: { width: 50, height: 50, borderRadius: 20, borderWidth: 2, borderColor: '#e95e07' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', marginHorizontal: 24, borderRadius: 15, padding: 15 },
  searchInput: { flex: 1, marginLeft: 10, outlineStyle: 'none' as any },
  scrollContent: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, color: '#333' },
  subSectionTitle: { fontSize: 14, fontWeight: '700', color: '#999', marginBottom: 10, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width - 64) / 2.1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#e95e07', height: 90, marginBottom: 16 },
  addCard: { width: (width - 64) / 2.1, height: 90, backgroundColor: '#FFF', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardNome: { fontWeight: 'bold', fontSize: 14, color: '#000000', textAlign: 'center' },
  addCardText: { marginTop: 8, color: '#AAA', fontSize: 13 },
  pastaCard: { width: (width - 64) / 2.1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#e95e07', height: 90, marginBottom: 16 },
  pastaCardAdicionar: { width: (width - 64) / 2.1, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#DDD', borderStyle: 'dashed', height: 90, marginBottom: 16 },
  pastaNome: { fontWeight: 'bold', fontSize: 14, color: '#000000', textAlign: 'center' },
  underline: { width: '60%', height: 3, backgroundColor: '#e95e07', marginTop: 8, borderRadius: 2 },
  miniMenu: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EEE', elevation: 3 },
  menuSection: { marginBottom: 15 },
  menuTitle: { fontWeight: 'bold', color: '#e95e07', fontSize: 14, marginBottom: 8 },
  menuItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  textoVazio: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 5 },
  avisoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#e95e07', padding: 14, marginBottom: 10 },
  avisoIcone: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avisoInfo: { flex: 1 },
  avisoNome: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 2 },
  avisoTexto: { fontSize: 12, color: '#e95e07', fontWeight: '600' },
  resultadoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#F0F0F0', padding: 14, marginBottom: 10 },
  resultadoIcone: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFF5EE', justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
  resultadoThumb: { width: 44, height: 44, borderRadius: 10 },
  resultadoInfo: { flex: 1 },
  resultadoNome: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 2 },
  resultadoSub: { fontSize: 12, color: '#999' },
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});