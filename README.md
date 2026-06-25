# Sistema de Controle de Almoxarifado - Enfermagem 🏥

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jOw_Hzd7)

Este projeto é um aplicativo mobile desenvolvido com **React Native** e **Expo**, projetado para modernizar e agilizar o controle de insumos médicos em um almoxarifado hospitalar.

## ✨ Funcionalidades Principais

*   **Gestão de Insumos (CRUD)**: Cadastro, listagem, atualização de estoque e exclusão de materiais via integração com API.
*   **Busca em Tempo Real**: Filtro dinâmico para localizar materiais instantaneamente pelo nome.
*   **Baixa de Estoque Inteligente**: Sistema de retirada com validação automática de estoque disponível.
*   **Monitoramento de Estoque Crítico**: Identificação visual automática (cor de alerta vermelha) para itens com menos de 10 unidades.
*   **Segurança Operacional**: Modais de confirmação personalizados e elegantes para ações críticas (Excluir e Baixar).

## 🎨 Interface e Experiência do Usuário (UI/UX)

O aplicativo oferece um visual moderno, minimalista e altamente profissional:

*   **Identidade Visual**: Paleta baseada em **Verde Turquesa** (`#20B2AA`) e **Turquesa Pálido** (`#E0F2F1`), evocando limpeza e organização hospitalar.
*   **Layout em Cards**: Itens organizados em cartões brancos com sombras suaves, facilitando a leitura.
*   **Interatividade Premium**: Botões com transições de cor suaves e lentas (1.2s) ao serem pressionados para o tom Turquesa, proporcionando feedback visual refinado.
*   **Design Minimalista**: Título centralizado e interface limpa, focada na usabilidade rápida.

## 🚀 Tecnologias Utilizadas

*   React Native / Expo
*   JavaScript (ES6+)
*   Fetch API (Integração com MockAPI)
*   Componentes Modernos: `Pressable` para interações dinâmicas e `Modal` para diálogos de segurança.

## 🛠️ Como Executar o Projeto

1.  Clone o repositório.
2.  Instale as dependências:
    ```sh
    npm install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```sh
    npx expo start
    ```
4.  Abra no navegador (pressione `w`) ou no seu dispositivo/emulador (pressione `a`).

---
*Projeto desenvolvido para a Prova de Desenvolvimento Mobile - 2º Bimestre.*
