import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      
      {/* Bloco Superior com Scroll para o teclado não cobrir os campos */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Logo */}
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/logoAtualizada.png')} 
              style={styles.logoImage}
              resizeMode="contain" 
            />
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Text style={styles.title}>Login</Text>
            
            {/* Input E-mail */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#666" style={styles.leftIcon} />
              <TextInput 
                style={[styles.input, { outlineStyle: 'none' as any }]} 
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Input Senha com Correção do Olho Duplicado */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#666" style={styles.leftIcon} />
              <TextInput 
                style={[styles.input, { outlineStyle: 'none' as any }]} 
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                // Propriedades para remover ícones nativos do sistema/navegador
                autoCorrect={false}
                autoComplete="off"
                textContentType="none" 
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.rightIconContainer}
                activeOpacity={0.7}
              >
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Botão Entrar */}
            {/* Botão Entrar */}
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8}
              onPress={() => router.push('/home')} // O onPress fica aqui (mudei para /home como exemplo)
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            {/* Esqueci a Senha */}
            <TouchableOpacity onPress={() => router.push('/esqueciSenha')}>
              <Text style={styles.textoEsqueceuSenha}>
                Esqueceu sua senha? <Text style={styles.textoAzulLink}>Alterar</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bloco Inferior (Rodapé) */}
      <View style={styles.footer}>
        <View style={styles.linhaSeparadora} />
        <Text style={styles.textoCinza}>
          Ainda não tem conta?{' '}
          <Text 
            style={styles.textoAzulLink} 
            onPress={() => router.push('/cadastro')}
          >
            Cadastre-se
          </Text>
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    width: screenWidth,
    height: 250, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  form: {
    paddingHorizontal: 30,
    marginTop: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e95e07',
    marginBottom: 25,
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1, 
    fontSize: 14,
    color: '#000000',
    height: '100%',
  },
  rightIconContainer: {
    padding: 10,
    marginRight: -5,
  },
  button: {
    backgroundColor: '#e95e07', 
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textoEsqueceuSenha: {
    color: '#666666', 
    fontSize: 14,
    marginTop: 15,
    alignSelf: 'flex-start', 
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30,
  },
  linhaSeparadora: {
    width: '100%', 
    height: 1.5,   
    backgroundColor: '#000000', 
    marginBottom: 15, 
  },
  textoCinza: {
    color: '#333333', 
    fontSize: 15,
  },
  textoAzulLink: {
    color: '#283593', 
    fontWeight: 'semibold',
    
  }
});