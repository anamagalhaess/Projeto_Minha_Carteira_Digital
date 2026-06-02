import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, Image, TextInput, TouchableOpacity, 
  ScrollView, Dimensions, StatusBar, Alert 
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { userStore } from './userStore';

const { width } = Dimensions.get('window');

export let pastasEmMemoria: any[] = [];

export default function HomeScreen() {
  const params = useLocalSearchParams(); 
  const [acessoRapido, setAcessoRapido] = useState<any[]>([]);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [minhasPastas, setMinhasPastas] = useState<any[]>(pastasEmMemoria);

  useEffect(() => {
    if (params.novaPastaNome) {
      const jaExiste = pastasEmMemoria.find(p => p.nome === params.novaPastaNome);
      if (!jaExiste) {
        const novaPasta = { 
          id: Date.now().toString(), 
          nome: params.novaPastaNome as string, 
          descricao: params.novaPastaDesc as string,
          docs: []
        };
        pastasEmMemoria.push(novaPasta);
        setMinhasPastas([...pastasEmMemoria]);
      }
      router.setParams({ novaPastaNome: '', novaPastaDesc: '' });
    }
  }, [params.novaPastaNome]);

  const confirmarExclusao = (id: string, nome: string) => {
    Alert.alert(
      'Apagar Pasta',
      `Tem certeza que deseja apagar a pasta "${nome}" e todos os documentos nela?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => apagarPasta(id) }
      ]
    );
  };

  const apagarPasta = (id: string) => {
    pastasEmMemoria = pastasEmMemoria.filter(pasta => pasta.id !== id);
    setMinhasPastas([...pastasEmMemoria]);
  };

  const adicionarDoc = (doc: any) => {
    const jaAdicionado = acessoRapido.find(item => item.nome === doc.nome);
    if (!jaAdicionado && acessoRapido.length < 3) {
      setAcessoRapido([...acessoRapido, doc]);
      setMenuVisivel(false);
    }
  };

  const MiniMenu = () => (
    <View style={styles.miniMenu}>
      {minhasPastas.length > 0 ? (
        minhasPastas.map(pasta => (
          <View key={pasta.id} style={styles.menuSection}>
            <Text style={styles.menuTitle}>{pasta.nome}</Text>
            {pasta.docs && pasta.docs.length > 0 ? (
              pasta.docs.map((doc: any, i: number) => (
                <TouchableOpacity key={i} style={styles.menuItem} onPress={() => adicionarDoc(doc)}>
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

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.titleText}>Olá, {userStore.primeiroNome}!</Text>
            <Text style={styles.subText}>Sou sua carteira digital</Text>
          </View>
          <TouchableOpacity onPress={() => router.push({ pathname: '/perfil', params: { totalPastas: minhasPastas.length } })}>
            <Image source={require('../assets/images/fotoPerfil.jpg')} style={styles.avatar} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Buscar documentos..." placeholderTextColor="#999" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Acesso Rápido */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.grid}>
          {acessoRapido.map((doc, index) => (
            <View key={index} style={styles.card}>
              <MaterialCommunityIcons name={doc.icone || 'file-document-outline'} size={28} color={doc.cor || '#000'} />
              <Text style={styles.cardText}>{doc.nome}</Text>
            </View>
          ))}
          {acessoRapido.length < 3 && (
            <TouchableOpacity style={styles.addCard} onPress={() => setMenuVisivel(!menuVisivel)}>
              <Feather name="plus-circle" size={24} color="#CCC" />
              <Text style={styles.addCardText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>

        {menuVisivel && <MiniMenu />}

        {/* Minhas Pastas */}
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

      {/* TabBar — padrão cadastrarDocumento */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/favoritos')}>
          <Feather name="star" size={20} color="#666" />
          <Text style={styles.tabText}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/home')}>
          <Feather name="home" size={20} color="#e95e07" />
          <Text style={[styles.tabText, { color: '#e95e07' }]}>Início</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerContainer: { backgroundColor: '#FFF', paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: 60, elevation: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
  titleText: { fontSize: 24, fontWeight: 'bold' },
  subText: { color: '#666' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#e95e07' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', marginHorizontal: 24, borderRadius: 15, padding: 15 },
  searchInput: { flex: 1, marginLeft: 10, outlineStyle: 'none' as any },
  scrollContent: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  card: { width: (width - 64) / 2.1, backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2, marginBottom: 16 },
  addCard: { width: (width - 64) / 2.1, height: 110, backgroundColor: '#FFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  addCardText: { marginTop: 8, color: '#AAA', fontSize: 13 },
  cardText: { marginTop: 10, fontWeight: '600', color: '#444' },
  
  pastaCard: { width: (width - 64) / 2.1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#e95e07', height: 90, marginBottom: 16 },
  pastaCardAdicionar: { width: (width - 64) / 2.1, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#DDD', borderStyle: 'dashed', height: 90, marginBottom: 16 },
  pastaNome: { fontWeight: 'bold', fontSize: 14, color: '#000000', textAlign: 'center' },
  underline: { width: '60%', height: 3, backgroundColor: '#e95e07', marginTop: 8, borderRadius: 2 },
  
  miniMenu: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#EEE', elevation: 3 },
  menuSection: { marginBottom: 15 },
  menuTitle: { fontWeight: 'bold', color: '#e95e07', fontSize: 14, marginBottom: 8 },
  menuItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  textoVazio: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 5 },

  // TabBar padronizada
  tabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#DDD', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#666' },
});