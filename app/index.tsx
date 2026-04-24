import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        
        {/* LOGO - Criei uma representação em texto, mas você pode trocar por uma <Image> depois */}
        <View style={styles.logoContainer}>
          <Feather name="briefcase" size={60} color="#E65C00" style={styles.logoIcon} />
          <Text style={styles.logoTitle}>MINHA CARTEIRA</Text>
          <Text style={styles.logoSubtitle}>D I G I T A L</Text>
        </View>

        {/* TÍTULO LOGIN */}
        <Text style={styles.pageTitle}>Login</Text>

        {/* FORMULÁRIO */}
        <View style={styles.formContainer}>
          
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputBox}>
            <Feather name="user" size={18} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputBox}>
            <Feather name="lock" size={18} color="#555" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          {/* BOTÃO ENTRAR */}
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          {/* ESQUECI A SENHA */}
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha?</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta? </Text>
        <TouchableOpacity>
          <Text style={styles.registerText}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40, // Margem lateral idêntica à imagem
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E65C00', // Laranja do logo
    letterSpacing: 3,
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E65C00', // Laranja do botão
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0', // Cinza claro idêntico à imagem
    height: 45,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#E65C00', // Laranja
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'left', // Alinhado à esquerda como na imagem
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#000000', // Linha preta acima do rodapé
    marginHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#000000',
  },
  registerText: {
    fontSize: 14,
    color: '#283593', // Azul do link
  },
});