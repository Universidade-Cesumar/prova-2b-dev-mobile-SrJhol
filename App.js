import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { validarRetirada } from './src/utils/validacoes';

export default function App() {
  // --- Estados da Aplicação (Os alunos implementarão aqui) ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [retiradas, setRetiradas] = useState({});

  // --- Funções de Requisição e Efeitos (Os alunos implementarão aqui) ---
  const API_URL = 'https://6a2b364bb687a7d5cbc4f485.mockapi.io/materiais';

  useEffect(() => {
    buscarMateriais();
  }, []);

  async function buscarMateriais() {
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      setMateriais(dados);
    } catch (erro) {
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
      console.log('Erro ao excluir material:', erro);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Breve descrição do projeto inserida abaixo */}
      <Text style={styles.description}>
        Este template servirá para desenvolver o projeto responsável por modernizar o controle de insumos médicos do almoxarifado. 
        Através desta interface conectada à API, é possível realizar o inventário em tempo real, cadastrar novos materiais e registrar baixas de estoque de forma ágil e segura.
      </Text>

      {/* Os alunos vão construir os componentes visuais das Sprints aqui dentro */}
      <TextInput
        testID="input-nome"
        style={styles.input}
        placeholder="Digite o nome do material"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        testID="input-quantidade"
        style={styles.input}
        placeholder="Digite a quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />
      <TouchableOpacity
        testID="btn-cadastrar"
        style={styles.botao}
        onPress={cadastrarMaterial}
      >
        <Text style={styles.textoBotao}>
          Cadastrar
        </Text>
      </TouchableOpacity>

      <FlatList
        testID="lista-materials"
        data={materiais}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemLista}>
            <Text>{item.nome}</Text>
            <Text>Estoque atual: {item.quantidade}</Text>

            <TextInput
              testID="input-retirada"
              style={styles.inputRetirada}
              placeholder="Qtd. retirada"
              value={retiradas[item.id] || ''}
              onChangeText={(valor) => alterarRetirada(item.id, valor)}
              keyboardType="numeric"
            />

            <TouchableOpacity
              testID="btn-baixar"
              style={styles.botaoBaixar}
              onPress={() => baixarMaterial(item)}
            >
              <Text style={styles.textoBotao}>Baixar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-excluir"
              style={styles.botaoExcluir}
              onPress={() => excluirMaterial(item.id)}
            >
              <Text style={styles.textoBotao}>Excluir</Text>
            </TouchableOpacity>

          </View>
        )}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({

   input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },

  botao: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },

  textoBotao: {
  color: '#fff',
  fontWeight: 'bold',
  },

  itemLista: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 5,
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10, // Reduzido ligeiramente para aproximar o texto explicativo
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20, // Dá um espaçamento confortável entre as linhas do parágrafo
    marginBottom: 30, // Margem inferior para afastar o texto dos futuros inputs dos alunos
  },

  inputRetirada: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    marginBottom: 8,
  },

  botaoBaixar: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  }

});
