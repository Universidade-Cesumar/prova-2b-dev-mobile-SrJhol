import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, ActivityIndicator, Platform, Modal } from 'react-native';
import { validarRetirada } from './src/utils/validacoes';

export default function App() {
  // --- Estados da Aplicação ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [retiradas, setRetiradas] = useState({});
  const [busca, setBusca] = useState('');
  const [erroConexao, setErroConexao] = useState('');

  // Estado para o Modal de Confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState({
    visivel: false,
    mensagem: '',
    acao: null,
    itemNome: ''
  });

  // --- Funções de Requisição e Efeitos ---
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
    }
  }

  async function cadastrarMaterial() {
    if (nome.trim() === '' || quantidade.trim() === '') return;
    const novoMaterial = { nome, quantidade };
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoMaterial)
      });
      setNome('');
      setQuantidade('');
      buscarMateriais();
    } catch (erro) {
      setErroConexao('Erro ao cadastrar material.');
    }
  }

  function alterarRetirada(id, valor) {
    setRetiradas({ ...retiradas, [id]: valor });
  }

  // --- Funções de Confirmação ---
  function prepararBaixa(material) {
    const qtd = retiradas[material.id] || '';
    if (!validarRetirada(material.quantidade, qtd)) return;
    setModalConfirmacao({
      visivel: true,
      mensagem: `Deseja realmente baixar ${qtd} unidades de:`,
      itemNome: material.nome,
      acao: () => baixarMaterial(material)
    });
  }

  function prepararExclusao(material) {
    setModalConfirmacao({
      visivel: true,
      mensagem: 'Deseja realmente excluir permanentemente o item:',
      itemNome: material.nome,
      acao: () => excluirMaterial(material.id)
    });
  }

  async function baixarMaterial(material) {
    const qtd = retiradas[material.id] || '';
    const novaQtd = Number(material.quantidade) - Number(qtd);
    try {
      await fetch(`${API_URL}/${material.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...material, quantidade: novaQtd })
      });
      setRetiradas({ ...retiradas, [material.id]: '' });
      setModalConfirmacao({ ...modalConfirmacao, visivel: false });
      buscarMateriais();
    } catch (erro) {
      setErroConexao('Erro ao atualizar estoque.');
    }
  }

  async function excluirMaterial(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setModalConfirmacao({ ...modalConfirmacao, visivel: false });
      buscarMateriais();
    } catch (erro) {
      setErroConexao('Erro ao excluir item.');
    }
  }

  const materiaisFiltrados = materiais.filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Controle de Almoxarifado</Text>
      </View>

      <View style={styles.content}>
        {erroConexao !== '' && <Text style={styles.erroTexto}>{erroConexao}</Text>}

        {/* Formulário de Cadastro */}
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
            style={({ pressed }) => [styles.botao, { backgroundColor: pressed ? '#20B2AA' : '#007BFF' }]}
          >
            <Text style={styles.textoBotao}>CADASTRAR MATERIAL</Text>
          </Pressable>
        </View>

        {/* Campo de Busca */}
        <TextInput
          style={styles.inputBusca}
          placeholder="Pesquisar material"
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />

        <Text style={styles.totalItens}>{materiaisFiltrados.length} materiais encontrados</Text>

        <FlatList
          data={materiaisFiltrados}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCritico = Number(item.quantidade) < 10;
            return (
              <View style={[styles.itemCard, isCritico && styles.itemCritico]}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemEstoque}>Estoque: {item.quantidade}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TextInput
                    style={styles.inputRetirada}
                    placeholder="Qtd."
                    placeholderTextColor="#999"
                    value={retiradas[item.id] || ''}
                    onChangeText={(valor) => alterarRetirada(item.id, valor)}
                    keyboardType="numeric"
                  />
                  <Pressable
                    onPress={() => prepararBaixa(item)}
                    style={({ pressed }) => [styles.botaoBaixar, { backgroundColor: pressed ? '#20B2AA' : '#FFC107' }]}
                  >
                    <Text style={styles.textoBotaoAcao}>BAIXAR</Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => prepararExclusao(item)}
                  style={({ pressed }) => [styles.botaoExcluir, { backgroundColor: pressed ? '#20B2AA' : '#DC3545' }]}
                >
                  <Text style={styles.textoBotaoAcao}>EXCLUIR MATERIAL</Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>

      {/* Modal de Confirmação Moderno e Dinâmico */}
      <Modal visible={modalConfirmacao.visivel} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmação</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalMsg}>{modalConfirmacao.mensagem}</Text>
              <Text style={styles.modalItem}>{modalConfirmacao.itemNome}</Text>
            </View>
            <View style={styles.modalFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBotao,
                  styles.modalBtnCancel,
                  { backgroundColor: pressed ? '#20B2AA' : '#F5F5F5' }
                ]}
                onPress={() => setModalConfirmacao({ ...modalConfirmacao, visivel: false })}
              >
                <Text style={styles.modalBtnText}>CANCELAR</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBotao,
                  styles.modalBtnConfirm,
                  { backgroundColor: pressed ? '#007BFF' : '#20B2AA' }
                ]}
                onPress={modalConfirmacao.acao}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>CONFIRMAR</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2F1' },
  header: { backgroundColor: '#20B2AA', paddingTop: 60, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, marginTop: -20 },
  cardForm: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 4, borderWidth: 1, borderColor: '#B2DFDB' },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  botao: { padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2, ...Platform.select({ web: { cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '1.5s' } }) },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  inputBusca: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#B2DFDB', fontSize: 16 },
  totalItens: { fontSize: 14, color: '#004D40', textAlign: 'right', marginBottom: 10, fontWeight: '600' },
  itemCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 18, marginBottom: 15, elevation: 3, borderWidth: 1, borderColor: '#B2DFDB' },
  itemCritico: { backgroundColor: '#FFEBEE', borderColor: '#FF4D4D', borderWidth: 2 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  itemNome: { fontSize: 18, fontWeight: 'bold', color: '#004D40' },
  itemEstoque: { fontSize: 14, fontWeight: '600', color: '#007BFF', backgroundColor: '#E7F1FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inputRetirada: { flex: 1, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 10, padding: 10, marginRight: 10 },
  botaoBaixar: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, ...Platform.select({ web: { cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '1.5s' } }) },
  botaoExcluir: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5, ...Platform.select({ web: { cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '1.5s' } }) },
  textoBotaoAcao: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  erroTexto: { color: '#D32F2F', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFF', width: '90%', maxWidth: 400, borderRadius: 25, overflow: 'hidden', elevation: 10 },
  modalHeader: { backgroundColor: '#20B2AA', padding: 15, alignItems: 'center' },
  modalTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  modalBody: { padding: 25, alignItems: 'center' },
  modalMsg: { fontSize: 16, color: '#666', textAlign: 'center' },
  modalItem: { fontSize: 18, fontWeight: 'bold', color: '#004D40', marginTop: 8, textAlign: 'center' },
  modalFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEE' },
  modalBotao: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'background-color',
        transitionDuration: '1.5s'
      }
    })
  },
  modalBtnCancel: { backgroundColor: '#F5F5F5' },
  modalBtnConfirm: { backgroundColor: '#20B2AA' },
  modalBtnText: { fontWeight: 'bold', fontSize: 14, color: '#333' }
});
