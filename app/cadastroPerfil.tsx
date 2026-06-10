import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { userStore } from './userStore';

const CustomInput = ({ iconName, placeholder, isPassword, value, onChangeText }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Feather name={iconName} size={20} color="#666" style={styles.leftIcon} />
      <TextInput
        style={[styles.input, { outlineStyle: 'none' as any }]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={isPassword && !showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        textContentType="none"
        value={value}
        onChangeText={onChangeText}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIconContainer}>
          <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar sua foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleCriarConta = () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmarSenha.trim()) {
      Alert.alert('Cadastro incompleto', 'Por favor, preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    // Salva no store global para usar na home e no perfil
    userStore.nomeCompleto = nome.trim();
    userStore.email = email.trim();
    userStore.fotoUri = image;
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Image source={require('../assets/images/logo_lateral.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Crie sua Conta</Text>

          <CustomInput iconName="user" placeholder="Nome Completo" value={nome} onChangeText={setNome} />
          <CustomInput iconName="mail" placeholder="Email" value={email} onChangeText={setEmail} />
          <CustomInput iconName="lock" placeholder="Senha" isPassword value={senha} onChangeText={setSenha} />
          <CustomInput iconName="lock" placeholder="Confirme sua senha" isPassword value={confirmarSenha} onChangeText={setConfirmarSenha} />

          {/* Foto de perfil */}
          <TouchableOpacity style={styles.inputContainer} onPress={pickImage} activeOpacity={0.7}>
            <Feather name="image" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textWrapper}>
              <Text style={[styles.fakeInputText, { color: image ? '#000' : '#999' }]}>
                {image ? 'Imagem selecionada!' : 'Selecione uma imagem de perfil'}
              </Text>
            </View>
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleCriarConta}>
            <Text style={styles.submitButtonText}>Criar Conta</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.linhaSeparadora} />
        <Text style={styles.footerText}>
          Já tem conta?{' '}
          <Text style={styles.loginLink} onPress={() => router.push('/login')}>Faça Login</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  header: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logo: { width: 250, height: 150 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#000', borderRadius: 8, paddingHorizontal: 12, height: 50, marginBottom: 16 },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#000', height: '100%' },
  textWrapper: { flex: 1, justifyContent: 'center', height: '100%' },
  fakeInputText: { fontSize: 14 },
  rightIconContainer: { padding: 5 },
  previewImage: { width: 30, height: 30, borderRadius: 15, marginLeft: 10 },
  submitButton: { backgroundColor: '#EF6C00', borderRadius: 8, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer:{width: '100%', alignItems: 'center', paddingBottom:8},
  linhaSeparadora: { width: '100%', height: 1.5, backgroundColor: '#000', marginBottom: 15 },
  footerText: { fontSize: 15, color: '#333' },
  loginLink: { color: '#283593', fontWeight: 'semibold' },
});