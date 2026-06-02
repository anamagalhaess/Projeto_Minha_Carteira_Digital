import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function Cadastro() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página de favoritos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center',     // Centraliza o conteúdo horizontalmente
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e95e07', // Mantendo a identidade visual do seu app
  }
});