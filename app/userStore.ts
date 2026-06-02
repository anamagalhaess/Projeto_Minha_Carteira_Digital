// Memória global do usuário — substitua pelos dados reais quando tiver backend
export const userStore = {
  nomeCompleto: 'Ana Magalhães',
  email: 'analauramagalhaes.russo@gmail.com',
  get primeiroNome() {
    return this.nomeCompleto.split(' ')[0];
  },
};