# Analytics próprio da CONSELT

## Endereço e configuração

Painel sem dependência de DNS personalizado: `https://landingpage-conselt-automa-or.vercel.app` (raiz encaminha para `/admin/analytics`). Configure `ANALYTICS_ADMIN_ORIGIN=https://landingpage-conselt-automa-or.vercel.app` e `ANALYTICS_ORIGIN=https://landingpageautore.conselt.com.br` no projeto do painel. Em produção o rastreador envia eventos para o painel por CORS restrito à origem da landing, sem cookies administrativos. Login e relatórios permanecem na origem administrativa. A landing original recebe somente o código público de consentimento/rastreamento; as chaves privadas ficam no projeto do painel. Para um domínio personalizado futuro, ajuste a origem administrativa no servidor e `VITE_ANALYTICS_BASE_URL` no build da landing.

Consulta DNS pública em 2026-10-17: servidores autoritativos ns1/ns2/ns3.locaweb.com.br. O CNAME existente de `painel` aponta para `painel.locaweb.com.br`; confirmar se está em uso antes de substituí-lo. Os registros adicionados na zona HostGator não têm efeito público enquanto a autoridade continuar na Locaweb. A verificação Vercel permanece pendente; não anunciar domínio ativo.

A migração foi aplicada no Supabase `fenztyluuyguqgoctmqo` em etapa anterior; não executá-la novamente. Administrador e variáveis de produção foram configurados. Valide a coleta real, login e retenção após publicar. O build declara o preset Vercel explicitamente.

## Estado da entrega

Implementação integrada à landing page aprovada. Sem configuração válida, a coleta fica desativada e o painel informa isso. Não há dados fictícios no painel de produção. A existência do código e das variáveis não substitui a validação do fluxo real após cada publicação.

O design das seções, textos, imagens e animações foi preservado. A única interface pública nova, quando ativado, é a preferência de privacidade: permite aceitar ou recusar com igual destaque e reabrir a escolha. Essa interface é necessária para a abordagem de consentimento adotada.

## 1. Criar banco e acesso administrativo

1. Crie sua conta e um projeto no [Supabase](https://supabase.com/dashboard). Escolha a região apropriada à operação e revise custos, contrato de tratamento e localização dos dados.
2. Ative **Cron / pg_cron** nas integrações do projeto.
3. No SQL Editor, execute uma vez `supabase/migrations/20261005_analytics.sql`. A migração cria tabelas, funções privadas, índices, RLS e limpeza diária de dados com mais de 90 dias. Confirme que o job `conselt-analytics-retention` foi criado e execute/acompanhe seu primeiro run. Não execute uma segunda vez sobre as mesmas tabelas.
4. Em Authentication, desative cadastros públicos. Crie seu usuário administrador e configure uma senha forte diretamente no Supabase. Não envie a senha no chat. Copie o UUID do usuário.
5. Em configurações de API, obtenha a URL do projeto, a chave pública `anon` e a chave de servidor `service_role`. **A chave service_role é secreta e nunca pode estar no frontend, no GitHub ou em variável `VITE_`.**
6. Copie `.env.example` para `.env` localmente e preencha os campos. Para gerar `ANALYTICS_SIGNING_SECRET`, use `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Não compartilhe o resultado.
7. Defina `ANALYTICS_ADMIN_IDS` com o UUID do administrador, `ANALYTICS_ENABLED=true` e `ANALYTICS_ORIGIN` com a origem exata, sem barra final. Local: `http://127.0.0.1:5182`. Produção: `https://landingpageautore.conselt.com.br`.
8. Inicie localmente com Node 22+ carregando o arquivo: `node --env-file=.env node_modules/vite/bin/vite.js dev --port 5182 --strictPort`. Encerre primeiro o servidor que já usa essa porta. A leitura explícita evita depender de como o bundler trata variáveis privadas.

## 2. Hospedagem e publicação

O sistema precisa de **servidor SSR**, pois as rotas `/api/analytics/*` fazem validação, autenticação e acesso ao banco. Hospedagem apenas de arquivos estáticos não basta.

No provedor atual (Vercel), configure as variáveis privadas nas configurações do projeto do painel. O build TanStack/Nitro declara o preset Vercel e gera `.vercel/output` com a função de servidor. Preserve o domínio autorizado. Nunca substitua o servidor por chamadas diretas do navegador com a chave secreta.

Após configurar, confira `/api/analytics/status`: deve responder `{"enabled":true}`. Isso confirma a presença das variáveis, **não a conectividade do banco**. Confirme também login, um evento real e o job de retenção antes de anunciar o sistema como operacional. Restrinja o acesso a logs do provedor e revise sua retenção: proxies e infraestrutura podem registrar endereços IP, mesmo que nosso banco não os armazene.

A publicação deve incluir o código, a migração (uma única vez por banco) e as variáveis privadas do servidor do painel. O projeto original da landing não precisa das chaves Supabase.

## 3. Acessar o dashboard

- Local: `http://127.0.0.1:5182/admin/analytics`.
- Depois de publicar: `https://landingpage-conselt-automa-or.vercel.app`.
- Use o e-mail e a senha do administrador do Supabase. Apenas UUIDs da lista `ANALYTICS_ADMIN_IDS` têm acesso, mesmo que outras contas estejam autenticadas.
- O token fica em cookie HttpOnly, SameSite=Strict e Secure em HTTPS. Login expira em no máximo uma hora, sem refresh persistente. Sair apaga o cookie; nenhuma senha é armazenada no navegador pelo aplicativo.
- Alterar o período consulta o banco; o botão Atualizar busca dados recentes. Não há polling pesado.

## 4. Como funciona

Antes de aceitar: só é consultado o estado de configuração. Nenhum identificador de analytics, sessão ou evento é enviado. Aceitar carrega o rastreador sob demanda. Recusar não prejudica a landing page. A preferência expira em 180 dias.

Depois de aceitar: um UUID aleatório identifica este navegador, por até 90 dias após a última visita consentida. Uma sessão por aba é mantida em sessionStorage e renovada após 30 minutos sem interação (ou 23 horas de duração). Recarregar a aba preserva a sessão e soma uma visualização de página. Dispositivos e navegadores diferentes contam separadamente. Não há fingerprinting.

Eventos são enviados em lotes a cada 15 segundos, nas ações e ao ocultar/sair da página com sendBeacon/keepalive. O buffer é limitado. Identificadores dos eventos e sequência dos snapshots evitam duplicação em reenvios. Falha de analytics não bloqueia a navegação.

Tempo ativo exige página visível e em foco, com scroll, clique, toque, teclado ou retorno recente. Depois de 30 segundos sem interação, o tempo para. O rastreador considera a seção predominante na tela para atribuir tempo sem duplicação. É uma aproximação: uma pessoa lendo imóvel por mais tempo pode ser subcontada. O retorno de uma aba não soma o intervalo oculto.

O banco guarda `analytics_sessions` (totais acumulados por sessão e seção), `analytics_events` (ações individuais extensíveis) e `analytics_limits` (HMAC rotativo para controle de abuso, apagado após um dia). Não há nome, e-mail, telefone, IP original, URL completa, parâmetros de campanha, texto digitado, gravação de tela ou conteúdo de formulários. A origem é categorizada como direta, interna, busca, social ou referência; o endereço original não é enviado.

Os identificadores são **pseudônimos**, não anonimização irreversível. Métricas só representam visitantes que consentiram. Bloqueadores, JavaScript desativado, perda de rede e encerramento abrupto podem causar subcontagem; não é ferramenta antifraude nem medição contábil de conversões.

## 5. Métricas e definições

- Visitantes únicos hoje, 7 e 30 dias: UUIDs distintos, calendário de Brasília.
- Sessões e visualizações de página: sessões abertas e recargas consentidas da landing page.
- Novos/recorrentes: primeira ocorrência do UUID no histórico retido. Um navegador pode estar em ambos os grupos em um período. Limpeza de dados ou expiração do identificador reinicia essa classificação.
- Tempo médio: média de tempo ativo acumulado por sessão.
- Alcance por seção: sessões/navegadores com tempo atribuído à seção; o funil é de alcance, não exige ordem linear.
- Conclusão: sessão que alcançou as sete seções principais. O rodapé é medido separadamente.
- Abandono: entre sessões sem atualização há pelo menos 30 minutos, proporção que não alcançou todas as sete seções. A última seção ativa é o ponto de abandono estimado; uma visita curta que converteu também pode não completar a página.
- Scroll: maior posição percorrida em relação à altura rolável, com marcos 25/50/75/90/100%. Não comprova leitura.
- Conversões: cliques em WhatsApp, telefone, e-mail, CTA, botões e links externos; tentativa de formulário separada da confirmação. A landing atual não possui formulário de captação.
- Gráficos diários, dispositivos, origem, tempo e alcance por seção; tabela de ações e últimas 30 sessões sem identificação pessoal.

## 6. Testar após configurar

1. Abra uma janela limpa e confira que não surgem sessões antes de consentir. Recuse: nenhuma chamada `start` ou `collect` deve ocorrer.
2. Reabra Privacidade e permita. No Network do navegador, `start` deve retornar 200; em até 15 segundos, `collect` deve retornar 200. Não compartilhe tokens capturados.
3. Role por todas as seções e clique em um CTA. Abra o painel e atualize: sessão, seções, scroll e ação devem aparecer.
4. Deixe a aba em segundo plano por um minuto. Retorne: o tempo ativo não deve aumentar por esse minuto. Faça também um teste de 45 segundos sem interagir com a aba visível: no máximo 30 segundos serão atribuídos.
5. Recarregue: mesma sessão e mais uma visualização. Após 30 minutos de inatividade, interagir inicia outra sessão, com visitante recorrente.
6. Recuse após aceitar: a coleta deve parar nesta aba e nas outras abas abertas. Para excluir o histórico associado ao identificador atual, use **Excluir meus dados de análise e recusar** antes de limpar os identificadores. A exclusão também remove eventos associados. Não conseguimos localizar visitas cujo identificador já foi apagado; elas expiram pela retenção.
7. Tente abrir a API de relatório sem login: deve retornar 401. Conta não autorizada também deve falhar. Teste Sair.
8. Repita em celular. Confirme ausência de deslocamentos no layout e legibilidade do pequeno aviso de privacidade.

Testes locais: `node tests/analytics.test.mjs` (tempo, validação, limites de payload, assinatura, autenticação e cookie). `tests/analytics-database.mjs` executa SQL em PostgreSQL via PGlite, cobrindo deduplicação, recorrência, conclusão, abandono, permissões e exclusão. Instale PGlite somente no ambiente de testes ou informe `PGLITE_MODULE` apontando para seu módulo. O fixture `tests/analytics-local-db.mjs` é descartável e deve ser usado **somente em localhost para testes**, nunca como banco de produção. O Cron e a autenticação real Supabase precisam da validação no projeto configurado.

## 7. Adicionar métricas

Para nomes estáveis de botões, adicione `data-analytics-id="nome-curto-do-botao"`, sem dados pessoais. Na ausência desse atributo, o identificador usa seção, tipo e posição; reorganizar botões pode alterar esses nomes.

Para registrar sucesso de formulário, dispare **somente depois da confirmação real do backend**: `form.dispatchEvent(new Event('analytics:form-success', { bubbles: true }))`. O evento submit normal é apenas tentativa.

Para novo tipo de ação, adicione um nome controlado em `src/analytics/validation.ts`, emita em `tracker.ts` e inclua o rótulo do dashboard. A tabela de eventos já suporta novos tipos sem reconstrução. Para nova seção, atualize a lista `sections` em `model.ts`, o atributo `data-backdrop`, o rótulo e o critério SQL de conclusão. Não envie texto livre, valores dos formulários ou URLs com parâmetros.

## Privacidade e operação

A implementação adota opt-in, minimização, revogação, exclusão e retenção limitada como medidas técnicas. O responsável pela CONSELT ainda precisa revisar o aviso de privacidade, o canal para exercício de direitos, o contrato com o operador e eventual transferência internacional. Isso não equivale a certificação jurídica de conformidade.

Referências: [guia de cookies da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais), [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e [Cron](https://supabase.com/docs/guides/cron).
