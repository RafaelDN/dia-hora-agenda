# AGENTS.md

## Projeto

Aplicação web pessoal para visualizar uma rotina diária de alimentação, suplementos, fitoterápicos e medicamentos de forma clara e amigável.

O objetivo principal é transformar uma rotina com muitas informações em uma interface simples de consultar ao longo do dia.

## Objetivo do produto

Mostrar, por horário, o que deve ser consumido, usando uma interface visual e intuitiva.

A aplicação deve:

- ser somente leitura
- carregar dados de um JSON fixo local
- destacar cada item por tipo com cores
- permitir visão resumida e visão detalhada
- ser fácil de publicar via GitHub Pages

## Stack desejada

- Vite
- Vue
- publicação estática via GitHub Pages
- UI library preferencial: DaisyUI
- CSS utilitário: Tailwind CSS, se necessário para suporte ao DaisyUI

## Premissas

- Não haverá backend neste momento
- Não haverá autenticação
- Não haverá persistência de dados
- Não haverá formulários de cadastro/edição inicialmente
- Toda a aplicação será readonly
- Os dados serão mockados em JSON local até segunda ordem

---

## Agentes

### 1. Product / UX Agent

Responsável por proteger a clareza da experiência.

#### Objetivos
- manter a interface simples
- evitar excesso de informação na tela
- garantir leitura rápida por horário
- facilitar entendimento visual das categorias

#### Regras
- priorizar legibilidade acima de sofisticação visual
- evitar poluição visual
- sempre pensar em uso rápido no dia a dia
- a pessoa deve bater o olho e entender "o que consumir agora"

#### Diretrizes de UX
- timeline ou lista agrupada por horário
- bloco principal com itens resumidos em chips/cards
- painel lateral ou painel secundário com detalhes do item selecionado
- estados visuais claros para item selecionado
- layout amigável em desktop e utilizável em mobile

---

### 2. Frontend Agent

Responsável por implementar a interface em Vue.

#### Objetivos
- criar componentes simples e reutilizáveis
- manter o código organizado
- priorizar renderização estática e fácil manutenção

#### Responsabilidades
- configurar projeto com Vite + Vue
- estruturar componentes
- integrar JSON mockado
- implementar navegação/local state necessário para seleção dos itens
- preparar build para publicação estática

#### Regras
- evitar complexidade desnecessária
- não introduzir gerenciamento global de estado sem necessidade
- começar com estado local e composição simples
- preferir componentes pequenos e objetivos
- separar dados mockados da camada visual

#### Estrutura sugerida
- `src/components`
- `src/data`
- `src/views`
- `src/types` se TypeScript for usado
- `src/composables` apenas se realmente necessário

---

### 3. UI Agent

Responsável pela consistência visual.

#### Objetivos
- aplicar cores por categoria
- garantir contraste e boa hierarquia visual
- deixar o app com aparência amigável e calma

#### Mapeamento visual inicial
- medicamento: verde
- fitoterápico: laranja
- suplemento: azul
- lanche/refeição: roxo

#### Regras
- usar cores como apoio, não como único indicador
- incluir também texto/ícone/label de categoria
- manter espaçamento confortável
- priorizar componentes com aparência limpa
- evitar estilos muito chamativos ou excessivamente "dashboard corporativo"

#### Componentes esperados
- timeline por horário
- chip de item resumido
- card ou painel de detalhes
- badge de categoria
- bloco de horário
- legenda visual opcional

---

### 4. Data Modeling Agent

Responsável pelo formato do JSON e pela modelagem inicial dos dados.

#### Objetivos
- definir uma estrutura simples, clara e extensível
- permitir evolução futura sem retrabalho grande

#### Estrutura base sugerida
Cada item pode conter:

- `id`
- `time`
- `title`
- `category`
- `summary`
- `details`
- `instructions`
- `withFood` ou equivalente
- `tags` opcionais

#### Exemplo de categorias válidas
- `medicine`
- `phytotherapy`
- `supplement`
- `meal`
- `snack`

#### Regras
- manter nomenclatura consistente
- evitar campos ambíguos
- preferir dados fáceis de exibir na interface
- pensar em futura expansão para múltiplos dias ou rotinas

---

### 5. Architecture Agent

Responsável por garantir simplicidade técnica.

#### Objetivos
- impedir overengineering
- manter o projeto leve
- facilitar publicação estática

#### Regras
- sem backend por enquanto
- sem banco por enquanto
- sem autenticação por enquanto
- sem persistência local por enquanto, a menos que haja necessidade real
- sem SSR obrigatório; priorizar solução simples e compatível com GitHub Pages

#### Decisões iniciais
- dados virão de arquivo local JSON ou TS/JS mockado
- a seleção do item pode viver em estado local
- o layout deve funcionar bem como SPA estática
- SEO não é prioridade neste momento

---

### 6. Reviewer Agent

Responsável por revisar código e arquitetura.

#### Checklist
- o código está simples de entender?
- os componentes estão pequenos e bem divididos?
- existe alguma abstração desnecessária?
- os nomes estão claros?
- a modelagem do JSON está coerente?
- a interface está clara para uso diário?
- a stack escolhida continua compatível com GitHub Pages?

#### Regras
- priorizar manutenção futura
- sugerir simplificações antes de sugerir novas camadas
- evitar bibliotecas extras sem motivo forte

---

## Requisitos funcionais iniciais

1. Exibir rotina agrupada por horário
2. Mostrar itens resumidos na área principal
3. Permitir clicar em um item
4. Mostrar detalhes completos em painel lateral ou área secundária
5. Diferenciar visualmente cada categoria por cor
6. Carregar tudo a partir de dados mockados locais
7. Funcionar sem qualquer ação de salvar

## Requisitos não funcionais

- interface clara
- carregamento rápido
- fácil manutenção
- publicação simples
- boa experiência em desktop
- experiência aceitável em mobile

## Fora de escopo por enquanto

- edição de rotina
- cadastro de usuário
- persistência em banco
- login
- notificações
- lembretes automáticos
- sincronização com agenda
- importação de arquivos
- histórico de consumo

## Direção futura possível

Esses itens ainda não devem ser implementados agora, mas podem orientar a modelagem:

- marcar item como consumido
- rotina por dias da semana
- filtros por categoria
- busca
- modo mobile-first aprimorado
- PWA
- notificações locais
- integração com IA para sugerir observações sobre a rotina

## Convenções gerais

- preferir simplicidade
- evitar overengineering
- componentizar com bom senso
- deixar dados mockados fáceis de editar manualmente
- escrever código pensando em leitura futura
- toda decisão deve favorecer clareza para o usuário final

## Prioridade máxima

Se houver conflito entre:
- visual bonito
- arquitetura sofisticada
- experiência clara

sempre priorizar **experiência clara**.