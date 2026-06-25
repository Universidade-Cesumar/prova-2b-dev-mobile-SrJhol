import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, ActivityIndicator, Platform } from 'react-native';
import { validarRetirada } from './src/utils/validacoes';

export default function App() {
  // --- Estados da Aplicação (Mantidos conforme regra) ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [retiradas, setRetiradas] = useState({});
  const [busca, setBusca] = useState('');
  const [erroConexao, setErroConexao] = useState('');

  // --- Funções de Requisição e Efeitos (Mantidos conforme regra) ---
  const API_URL = 'https://6a2b364bb687a7d5cbc4f485.mockapi.io/materiais';

  useEffect(() => {
    buscarMateriais();
  }, []);

  async function buscarMateriais() {
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      setErroConexao('');
      setMateriais(dados);
    } catch (erro) {
      setErroConexao('Erro ao carregar materiais. Verifique sua conexão.');
      console.log('Erro ao buscar materiais:', erro);
    }
  }

  async function cadastrarMaterial() {
    if (nome.trim() === '' || quantidade.trim() === '') {
      return;
    }

    const novoMaterial = {
      nome: nome,
      quantidade: quantidade
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoMaterial)
      });

      setNome('');
      setQuantidade('');
      buscarMateriais();
    } catch (erro) {
      setErroConexao('Erro ao cadastrar material. Tente novamente.');
      console.log('Erro ao cadastrar material:', erro);
    }
  }

  function alterarRetirada(id, valor) {
    setRetiradas({
      ...retiradas,
      [id]: valor
    });
  }

  async function baixarMaterial(material) {
    const quantidadeRetirada = retiradas[material.id] || '';

    if (!validarRetirada(material.quantidade, quantidadeRetirada)) {
      return;
    }

    const novaQuantidade = Number(material.quantidade) - Number(quantidadeRetirada);

    try {
      await fetch(`${API_URL}/${material.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...material,
          quantidade: novaQuantidade
        })
      });

      setRetiradas({
        ...retiradas,
        [material.id]: ''
      });

      buscarMateriais();
    } catch (erro) {
      setErroConexao('Erro ao baixar estoque. Tente novamente.');
      console.log('Erro ao baixar material:', erro);
    }
  }

  async function excluirMaterial(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      buscarMateriais();
    } catch (erro) {
      setErroConexao('Erro ao excluir material. Tente novamente.');
      console.log('Erro ao excluir material:', erro);
    }
  }

  const materiaisFiltrados = materiais.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho Moderno */}
      <View style={styles.header}>
        <Text style={styles.title}>Controle de Almoxarifado</Text>
      </View>

      <View style={styles.content}>
        {erroConexao !== '' && (
          <View style={styles.errorBanner}>
            <Text style={styles.erroTexto}>{erroConexao}</Text>
          </View>
        )}

        {/* Formulário de Cadastro em Card */}
        <View style={styles.cardForm}>
          <TextInput
            style={styles.input}
            placeholder="Nome do material"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade inicial"
            placeholderTextColor="#999"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
          <Pressable
            testID="btn-cadastrar"
            onPress={cadastrarMaterial}
            style={({ pressed }) => [
              styles.botao,
              {
                backgroundColor: pressed ? '#20B2AA' : '#007BFF'
              }
            ]}
          >
            <Text style={styles.textoBotao}>CADASTRAR MATERIAL</Text>
          </Pressable>
        </View>

        {/* Pesquisa */}
        <View style={styles.searchSection}>
          <TextInput
            testID="input-busca"
            style={styles.inputBusca}
            placeholder="Pesquisar material"
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        <Text testID="total-itens" style={styles.totalItens}>
          {materiaisFiltrados.length} materiais encontrados
        </Text>

        <FlatList
          testID="lista-materials"
          data={materiaisFiltrados}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => {
            const isCritico = Number(item.quantidade) < 10;
            return (
              <View
                style={[
                  styles.itemCard,
                  isCritico && styles.itemCritico
                ]}
                accessibilityLabel={isCritico ? 'estoque-critico' : undefined}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemEstoque}>Estoque: {item.quantidade}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TextInput
                    testID="input-retirada"
                    style={styles.inputRetirada}
                    placeholder="Qtd. retirada"
                    placeholderTextColor="#999"
                    value={retiradas[item.id] || ''}
                    onChangeText={(valor) => alterarRetirada(item.id, valor)}
                    keyboardType="numeric"
                  />
                  <Pressable
                    testID="btn-baixar"
                    onPress={() => baixarMaterial(item)}
                    style={({ pressed }) => [
                      styles.botaoBaixar,
                      {
                        backgroundColor: pressed ? '#20B2AA' : '#FFC107'
                      }
                    ]}
                  >
                    <Text style={styles.textoBotaoAcao}>BAIXAR</Text>
                  </Pressable>
                </View>

                <Pressable
                  testID="btn-excluir"
                  onPress={() => excluirMaterial(item.id)}
                  style={({ pressed }) => [
                    styles.botaoExcluir,
                    {
                      backgroundColor: pressed ? '#20B2AA' : '#DC3545'
                    }
                  ]}
                >
                  <Text style={styles.textoBotaoAcao}>EXCLUIR MATERIAL</Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F1',
  },
  header: {
    backgroundColor: '#20B2AA',
    paddingTop: 60,
    paddingBottom: 35, // Aumentado um pouco para dar mais espaço
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 34, // Aumentado para 34px conforme pedido
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  botao: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'background-color',
        transitionDuration: '1.2s',
      }
    })
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  searchSection: {
    marginBottom: 10,
  },
  inputBusca: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  totalItens: {
    fontSize: 14,
    color: '#004D40',
    marginBottom: 15,
    textAlign: 'right',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  itemCritico: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF4D4D',
    borderWidth: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D40',
    flex: 1,
  },
  itemEstoque: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
    backgroundColor: '#E7F1FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputRetirada: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
  },
  botaoBaixar: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'background-color',
        transitionDuration: '1.2s',
      }
    })
  },
  botaoExcluir: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'background-color',
        transitionDuration: '1.2s',
      }
    })
  },
  textoBotaoAcao: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  errorBanner: {
    backgroundColor: '#F8D7DA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  erroTexto: {
    color: '#721C24',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  }
});
