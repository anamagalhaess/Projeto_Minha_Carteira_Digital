import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function CriarPastaScreen() {
  const [nomePasta, setNomePasta] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleCriarPasta = () => {
    if (!nomePasta.trim()) {
      Alert.alert('Atenção', 'O nome da pasta é obrigatório.');
      return;
    }
    router.replace({
      pathname: '/home',
      params: {
        novaPastaNome: nomePasta.trim(),
        novaPastaDesc: descricao.trim(),
      }
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Voltar */}
      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.replace('/home')}>
        <Feather name="arrow-left" size={20} color="#000" />
        <Text style={styles.btnVoltarTexto}>Voltar</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.tituloHeader}>Nova Pasta</Text>

      {/* Formulário */}
      <View style={styles.form}>
        <Text style={styles.label}>Nome da Pasta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Documentos Pessoais"
          placeholderTextColor="#999"
          value={nomePasta}
          onChangeText={setNomePasta}
        />
        <Text style={styles.label}>Descrição (máx 40 caracteres)</Text>
        <TextInput
          style={styles.input}
          placeholder="Breve descrição..."
          placeholderTextColor="#999"
          value={descricao}
          onChangeText={(text) => setDescricao(text.slice(0, 40))}
          maxLength={40}
        />
        <Text style={styles.contador}>{descricao.length}/40</Text>
        <TouchableOpacity style={styles.button} onPress={handleCriarPasta}>
          <Text style={styles.buttonText}>Criar Pasta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 30 },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginTop: (StatusBar.currentHeight ?? 20), marginBottom: 8 },
  btnVoltarTexto: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  tituloHeader: { fontSize: 20, fontWeight: '900', color: '#e95e07', marginBottom: 15, marginTop: 10 },
  form: { marginTop: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { borderWidth: 1.5, borderColor: '#000', borderRadius: 8, height: 50, paddingHorizontal: 15, marginBottom: 20, fontSize: 14 },
  contador: { alignSelf: 'flex-end', marginTop: -15, marginBottom: 20, color: '#999', fontSize: 12 },
  button: { backgroundColor: '#e95e07', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});