// Memória global do usuário — substitua pelos dados reais quando tiver backend
export const userStore = {
  nomeCompleto: '',
  email: '',
  fotoUri: null as string | null,
  get primeiroNome() {
    return this.nomeCompleto.split(' ')[0];
  },
};