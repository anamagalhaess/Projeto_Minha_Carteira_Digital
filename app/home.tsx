import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* --- BLOCO SUPERIOR FIXO (Compactado) --- */}
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá, Ana!</Text>
            <Text style={styles.subSaudacao}>Sou sua carteira digital</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/perfil')} 
            activeOpacity={0.7}
          >
            <Image 
              source={require('../assets/images/fotoPerfil.jpg')} 
              style={styles.perfilImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <Feather name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={[styles.inputSearch, { outlineStyle: 'none' as any }]}
            placeholder="Buscar..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* --- CONTEÚDO ROLÁVEL --- */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* --- ACESSO RÁPIDO --- */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalScrollPadding}
        >
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.quickAddCard} activeOpacity={0.7}>
              <View style={styles.quickAddCircle}>
                <Feather name="plus" size={20} color="#EF6C00" />
              </View>
              <Text style={styles.quickAddText}>Adicionar</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- CARD DE AVISO --- */}
        <Text style={styles.sectionTitle}>Aviso</Text>
        <TouchableOpacity style={styles.avisoCard} activeOpacity={0.8}>
          <View style={styles.avisoIconContainer}>
            <Feather name="bell" size={20} color="#EF6C00" />
          </View>
          <View style={styles.avisoTextContainer}>
            <Text style={styles.avisoTitle}>CNH</Text>
            <Text style={styles.avisoDesc}>Faltam 3 meses para vencer</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#CCC" />
        </TouchableOpacity>

        {/* --- GRID DE PASTAS --- */}
        <Text style={styles.sectionTitle}>Pastas</Text>
        <View style={styles.gridPastas}>
          {[
            { name: 'PESSOAL', icon: 'user' },
            { name: 'VEÍCULO', icon: 'truck' },
            { name: 'TRABALHO', icon: 'briefcase' },
            { name: 'SAÚDE', icon: 'plus-square' },
            { name: 'CERTIFICADOS', icon: 'file-text' },
          ].map((pasta, index) => (
            <TouchableOpacity key={index} style={styles.pastaCard} activeOpacity={0.7}>
              <Feather name={pasta.icon as any} size={24} color="#333" />
              <Text style={styles.pastaText}>{pasta.name}</Text>
              <View style={styles.indicatorLaranja} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={[styles.pastaCard, styles.createPastaCard]} activeOpacity={0.6}>
            <Feather name="plus" size={22} color="#666" />
            <Text style={styles.createPastaText}>Criar pasta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MENU INFERIOR (Mais Baixo e Compacto) --- */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="star" size={20} color="#666" />
          <Text style={styles.tabText}>Favoritos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={20} color="#EF6C00" />
          <Text style={[styles.tabText, { color: '#EF6C00' }]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.addTabButton}>
             <Feather name="plus" size={24} color="#FFF" />
          </View>
          <Text style={styles.tabText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', 
  },
  fixedTop: {
    backgroundColor: '#FFF',
    paddingTop: 50, // Diminuído (era 60)
    paddingBottom: 15, // Diminuído (era 25)
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 15, // Diminuído (era 20)
  },
  saudacao: {
    fontSize: 20, // Diminuído (era 22)
    fontWeight: '900',
    color: '#333',
  },
  subSaudacao: {
    fontSize: 12, // Diminuído (era 14)
    color: '#999',
  },
  perfilImage: {
    width: 42, // Diminuído (era 50)
    height: 42, // Diminuído (era 50)
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#EF6C00',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    marginHorizontal: 24,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45, // Diminuído (era 55)
  },
  searchIcon: {
    marginRight: 8,
  },
  inputSearch: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 90, // Ajustado para a TabBar menor
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16, // Diminuído (era 18)
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 18,
    marginBottom: 12,
    color: '#333',
  },
  horizontalScrollPadding: {
    paddingLeft: 24,
    paddingRight: 10,
  },
  quickAddCard: {
    width: 90, // Diminuído
    height: 100, // Diminuído
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },
  quickAddCircle: {
    width: 38,
    height: 38,
    backgroundColor: '#FFF3E0',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickAddText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  avisoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    padding: 15, // Diminuído (era 18)
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#EF6C00',
    elevation: 3,
  },
  avisoIconContainer: {
    width: 35,
    height: 35,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avisoTextContainer: {
    flex: 1,
  },
  avisoTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  avisoDesc: {
    color: '#666',
    fontSize: 12,
    marginTop: 1,
  },
  gridPastas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  pastaCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFF',
    paddingVertical: 25, // Diminuído (era 30)
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  indicatorLaranja: {
    width: 25, // Diminuído
    height: 3, // Diminuído
    backgroundColor: '#EF6C00',
    marginTop: 12,
    borderRadius: 10,
  },
  pastaText: {
    marginTop: 10,
    fontWeight: '900',
    fontSize: 11,
    color: '#333',
    letterSpacing: 0.5,
  },
  createPastaCard: {
    backgroundColor: '#F1F3F5',
    borderStyle: 'dashed',
    borderWidth: 1.2,
    borderColor: '#CCC',
  },
  createPastaText: {
    marginTop: 4,
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 75, // Diminuído (era 90)
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 15, // Diminuído (era 25)
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    color: '#666',
    fontWeight: '600',
  },
  addTabButton: {
    backgroundColor: '#333',
    width: 50, // Diminuído (era 60)
    height: 50, // Diminuído (era 60)
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35, // Ajustado para o novo tamanho
    borderWidth: 4, // Diminuído (era 6)
    borderColor: '#F8F9FA',
    elevation: 4,
  }
});