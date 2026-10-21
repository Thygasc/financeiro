"use client";

import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeDollarSign,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  Ellipsis,
  FileText,
  Home,
  Landmark,
  Menu,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  status: "Pago" | "Pendente";
  icon: "briefcase" | "home" | "card" | "tag";
};

const initialTransactions: Transaction[] = [
  { id: 1, title: "Projeto identidade visual", category: "Freelance", date: "20 out, 2026", amount: 4800, type: "income", status: "Pago", icon: "briefcase" },
  { id: 2, title: "Aluguel apartamento", category: "Moradia", date: "19 out, 2026", amount: 1850, type: "expense", status: "Pago", icon: "home" },
  { id: 3, title: "Mercado do bairro", category: "Alimentação", date: "18 out, 2026", amount: 347.82, type: "expense", status: "Pago", icon: "tag" },
  { id: 4, title: "Fatura Nubank", category: "Cartão de crédito", date: "17 out, 2026", amount: 1260.4, type: "expense", status: "Pendente", icon: "card" },
  { id: 5, title: "Consultoria mensal", category: "Freelance", date: "16 out, 2026", amount: 2200, type: "income", status: "Pago", icon: "briefcase" },
];

const navItems = [
  { label: "Visão geral", icon: Home },
  { label: "Lançamentos", icon: ArrowLeftRight },
  { label: "Cartões", icon: CreditCard },
  { label: "Orçamentos", icon: SlidersHorizontal },
  { label: "Relatórios", icon: FileText },
];

const categoryBudgets = [
  { name: "Moradia", spent: 1850, limit: 2400, color: "#e5a94d" },
  { name: "Alimentação", spent: 986, limit: 1400, color: "#5b9c83" },
  { name: "Transporte", spent: 420, limit: 700, color: "#6d8cc2" },
];

const bars = [
  { label: "Mai", income: 62, expense: 38 },
  { label: "Jun", income: 74, expense: 44 },
  { label: "Jul", income: 57, expense: 49 },
  { label: "Ago", income: 88, expense: 54 },
  { label: "Set", income: 70, expense: 43 },
  { label: "Out", income: 96, expense: 58 },
];

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function HomePage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeNav, setActiveNav] = useState("Visão geral");
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("financia-transactions");
      if (saved) {
        const parsed = JSON.parse(saved) as Transaction[];
        startTransition(() => setTransactions(parsed));
      }
    } catch {
      localStorage.removeItem("financia-transactions");
    }
  }, []);

  const visibleTransactions = transactions.filter((transaction) => {
    const matchesFilter = filter === "Todas" || transaction.type === (filter === "Receitas" ? "income" : "expense");
    const matchesQuery = `${transaction.title} ${transaction.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  function saveTransactions(next: Transaction[]) {
    setTransactions(next);
    localStorage.setItem("financia-transactions", JSON.stringify(next));
  }

  function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = form.get("type") as Transaction["type"];
    const newTransaction: Transaction = {
      id: Date.now(),
      title: String(form.get("title")),
      category: String(form.get("category")),
      date: new Date(`${form.get("date")}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
      amount: Number(form.get("amount")),
      type,
      status: "Pendente",
      icon: type === "income" ? "briefcase" : "tag",
    };
    saveTransactions([newTransaction, ...transactions]);
    setShowForm(false);
  }

  function exportCsv() {
    const rows = [["Descrição", "Categoria", "Data", "Tipo", "Status", "Valor"], ...transactions.map((item) => [item.title, item.category, item.date, item.type === "income" ? "Receita" : "Despesa", item.status, item.amount.toFixed(2).replace(".", ",")])];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(";" )).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "lancamentos-financeiros.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#inicio" aria-label="Financia, início">
          <span className="brand-mark"><Wallet size={19} strokeWidth={2.3} /></span>
          <span>financia<span className="brand-dot">.</span></span>
        </a>
        <div className="workspace-label">ESPAÇO PESSOAL</div>
        <button className="profile-switcher">
          <span className="avatar">M</span>
          <span className="profile-copy"><strong>Meu espaço</strong><small>Controle pessoal</small></span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">MENU</div>
        <nav className="primary-nav" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => { setActiveNav(label); setMobileNavOpen(false); }} className={`nav-item ${activeNav === label ? "active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Lançamentos" && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>
        <div className="nav-label tools-label">PREFERÊNCIAS</div>
        <nav className="primary-nav" aria-label="Preferências">
          <button className={`nav-item ${activeNav === "Categorias" ? "active" : ""}`} onClick={() => setActiveNav("Categorias")}><Tag size={18} strokeWidth={1.8} /><span>Categorias</span></button>
          <button className={`nav-item ${activeNav === "Configurações" ? "active" : ""}`} onClick={() => setActiveNav("Configurações")}><Settings size={18} strokeWidth={1.8} /><span>Configurações</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-box">
            <span className="upgrade-icon"><Sparkles size={15} /></span>
            <strong>Seu dinheiro, mais claro.</strong>
            <p>Organize suas finanças em um só lugar.</p>
            <button onClick={() => setShowForm(true)}>Novo lançamento <ArrowUpRight size={14} /></button>
          </div>
          <button className="help-link"><CircleHelp size={17} /> Central de ajuda</button>
          <div className="sidebar-user"><span className="avatar avatar-small">M</span><span><strong>Mateus Silva</strong><small>Plano pessoal</small></span><Ellipsis size={18} /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <section className="main-column" id="inicio">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb">Meu espaço <ChevronRight size={14} /> <strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="local-badge"><span /> Dados neste dispositivo</span>
            <button className="icon-button notification-button" aria-label="Notificações"><Bell size={18} /><i /></button>
            <span className="top-avatar">M</span>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> TERÇA-FEIRA, 20 DE OUTUBRO DE 2026</div>
              <h1>{activeNav === "Visão geral" ? "Bom dia, Mateus" : activeNav}<span className="heading-period">.</span></h1>
              <p className="heading-subtitle">Aqui está o resumo da sua vida financeira.</p>
            </div>
            <div className="heading-actions">
              <button className="button-secondary" onClick={exportCsv}><Download size={16} /> <span>Exportar</span></button>
              <button className="button-primary" onClick={() => setShowForm(true)}><Plus size={17} /> Novo lançamento</button>
            </div>
          </div>

          {activeNav === "Visão geral" && <>
          <div className="month-row">
            <div className="month-title"><CalendarDays size={16} /><strong>Outubro 2026</strong><ChevronDown size={14} /></div>
            <div className="month-controls"><button aria-label="Mês anterior"><ChevronLeft size={16} /></button><button aria-label="Próximo mês"><ChevronRight size={16} /></button><span>Este mês</span></div>
          </div>

          <section className="summary-grid" aria-label="Resumo do mês">
            <article className="summary-card balance-card">
              <div className="summary-top"><span>Saldo disponível</span><span className="summary-icon mint"><Wallet size={17} /></span></div>
              <div className="summary-value">{money(8420.68)}</div>
              <div className="summary-foot"><span className="trend-up"><TrendingUp size={14} /> 12,8%</span><span>vs. mês passado</span><span className="card-more"><Ellipsis size={17} /></span></div>
              <div className="balance-decoration" />
            </article>
            <article className="summary-card">
              <div className="summary-top"><span>Receitas do mês</span><span className="summary-icon green"><ArrowDownLeft size={18} /></span></div>
              <div className="summary-value">{money(12450)}</div>
              <div className="summary-foot"><span className="trend-up"><TrendingUp size={14} /> 8,2%</span><span>vs. mês passado</span><span className="tiny-bars"><i /><i /><i /><i /><i /><i /><i /><i /></span></div>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span>Despesas do mês</span><span className="summary-icon coral"><ArrowDownRight size={18} /></span></div>
              <div className="summary-value">{money(4029.32)}</div>
              <div className="summary-foot"><span className="trend-down"><TrendingDown size={14} /> 3,1%</span><span>vs. mês passado</span><span className="tiny-bars expense-bars"><i /><i /><i /><i /><i /><i /><i /><i /></span></div>
            </article>
            <article className="summary-card">
              <div className="summary-top"><span>Investido no mês</span><span className="summary-icon blue"><Landmark size={17} /></span></div>
              <div className="summary-value">{money(1800)}</div>
              <div className="summary-foot"><span className="neutral-trend"><BadgeDollarSign size={14} /> 14,4%</span><span>da sua renda</span><span className="card-more"><Ellipsis size={17} /></span></div>
            </article>
          </section>

          <section className="middle-grid">
            <article className="panel cashflow-panel">
              <div className="panel-heading"><div><h2>Fluxo de caixa</h2><p>Receitas e despesas ao longo do tempo</p></div><button className="select-control">Últimos 6 meses <ChevronDown size={14} /></button></div>
              <div className="chart-legend"><span><i className="legend-income" /> Receitas</span><span><i className="legend-expense" /> Despesas</span><strong>Saldo <b>+ R$ 8.420,68</b></strong></div>
              <div className="chart-area">
                <div className="chart-y-labels"><span>R$ 15k</span><span>R$ 10k</span><span>R$ 5k</span><span>R$ 0</span></div>
                <div className="chart-plot">
                  <div className="chart-gridline line-one" /><div className="chart-gridline line-two" /><div className="chart-gridline line-three" /><div className="chart-gridline line-four" />
                  {bars.map((bar) => <div className={`chart-month ${bar.label === "Out" ? "current" : ""}`} key={bar.label}><div className="bar-pair"><i className="income-bar" style={{ height: `${bar.income}%` }} /><i className="expense-bar" style={{ height: `${bar.expense}%` }} /></div><span>{bar.label}</span></div>)}
                </div>
              </div>
              <div className="chart-note"><span className="chart-note-dot" /> Outubro está <strong>18% acima</strong> da sua média de receitas</div>
            </article>

            <article className="panel budget-panel">
              <div className="panel-heading"><div><h2>Orçamento mensal</h2><p>Seus limites por categoria</p></div><button className="icon-button panel-menu" aria-label="Mais opções"><Ellipsis size={19} /></button></div>
              <div className="budget-total"><div><span>Gasto até agora</span><strong>R$ 3.256<span>,00</span></strong></div><div className="budget-total-side"><strong>72%</strong><span>do planejado</span></div></div>
              <div className="budget-progress"><span /></div>
              <div className="budget-caption"><span>R$ 3.256 utilizados</span><span>Limite R$ 4.500</span></div>
              <div className="category-budgets">
                {categoryBudgets.map((item) => <div className="category-budget" key={item.name}><div className="category-row"><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{money(item.spent)} <small>/ {money(item.limit)}</small></strong></div><div className="category-track"><span style={{ width: `${item.spent / item.limit * 100}%`, backgroundColor: item.color }} /></div></div>)}
              </div>
              <button className="text-action" onClick={() => setActiveNav("Orçamentos")}>Ver todos os orçamentos <ArrowUpRight size={15} /></button>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel transactions-panel">
              <div className="panel-heading transactions-heading"><div><h2>Últimos lançamentos</h2><p>Acompanhe suas movimentações recentes</p></div><button className="text-action desktop-action" onClick={() => setActiveNav("Lançamentos")}>Ver todos <ArrowUpRight size={15} /></button></div>
              <div className="transaction-tools"><div className="filter-tabs">{["Todas", "Receitas", "Despesas"].map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search-field"><Search size={15} /><input aria-label="Buscar lançamento" placeholder="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
              <div className="transaction-table-wrap"><table className="transaction-table"><thead><tr><th>DESCRIÇÃO</th><th>DATA</th><th>STATUS</th><th className="amount-column">VALOR</th><th aria-label="Ações" /></tr></thead><tbody>
                {visibleTransactions.map((transaction) => <tr key={transaction.id}><td><span className={`transaction-icon icon-${transaction.icon}`}>{transaction.icon === "briefcase" ? <BriefcaseBusiness size={16} /> : transaction.icon === "home" ? <Home size={16} /> : transaction.icon === "card" ? <CreditCard size={16} /> : <Tag size={16} />}</span><span className="transaction-copy"><strong>{transaction.title}</strong><small>{transaction.category}</small></span></td><td className="date-cell">{transaction.date}</td><td><span className={`status-pill ${transaction.status === "Pago" ? "paid" : "pending"}`}><i />{transaction.status}</span></td><td className={`amount-cell ${transaction.type === "income" ? "amount-income" : ""}`}>{transaction.type === "income" ? "+ " : "− "}{money(transaction.amount)}</td><td><button className="row-more" aria-label={`Opções para ${transaction.title}`}><Ellipsis size={18} /></button></td></tr>)}
                {visibleTransactions.length === 0 && <tr><td colSpan={5} className="empty-state">Nenhum lançamento encontrado.</td></tr>}
              </tbody></table></div>
              <button className="text-action mobile-all" onClick={() => setActiveNav("Lançamentos")}>Ver todos os lançamentos <ArrowUpRight size={15} /></button>
            </article>

            <article className="panel card-panel">
              <div className="panel-heading"><div><h2>Cartões</h2><p>Resumo das suas faturas</p></div><button className="icon-button panel-menu" aria-label="Mais opções"><Ellipsis size={19} /></button></div>
              <div className="credit-card-visual"><div className="credit-card-top"><span className="card-chip"><i /><i /><i /><i /></span><span className="card-contactless">)))</span></div><span className="card-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;4829</span><div className="credit-card-bottom"><span><small>MEU CARTÃO</small><strong>Nubank Ultravioleta</strong></span><span className="mastercard-mark"><i /><i /></span></div></div>
              <div className="invoice-row"><div><span>Fatura atual</span><strong>R$ 1.260,40</strong></div><span className="invoice-badge"><i /> Aberta</span></div>
              <div className="invoice-due"><span>Vencimento em <strong>05 nov</strong></span><span>Limite disponível <strong>R$ 8.739,60</strong></span></div>
              <div className="card-limit"><span /><i /></div>
              <button className="text-action card-action" onClick={() => setActiveNav("Cartões")}>Gerenciar cartões <ArrowUpRight size={15} /></button>
            </article>
          </section>
          </>}

          {activeNav === "Lançamentos" && <section className="module-view panel transactions-panel">
            <div className="module-view-heading"><div><span className="module-eyebrow">MOVIMENTAÇÕES</span><h2>Todos os lançamentos</h2><p>Receitas e despesas registradas no seu espaço.</p></div><span className="module-count">{visibleTransactions.length} registros</span></div>
            <div className="transaction-tools"><div className="filter-tabs">{["Todas", "Receitas", "Despesas"].map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search-field"><Search size={15} /><input aria-label="Buscar lançamento" placeholder="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
            <div className="transaction-table-wrap"><table className="transaction-table"><thead><tr><th>DESCRIÇÃO</th><th>DATA</th><th>STATUS</th><th className="amount-column">VALOR</th><th aria-label="Ações" /></tr></thead><tbody>
              {visibleTransactions.map((transaction) => <tr key={transaction.id}><td><span className={`transaction-icon icon-${transaction.icon}`}>{transaction.icon === "briefcase" ? <BriefcaseBusiness size={16} /> : transaction.icon === "home" ? <Home size={16} /> : transaction.icon === "card" ? <CreditCard size={16} /> : <Tag size={16} />}</span><span className="transaction-copy"><strong>{transaction.title}</strong><small>{transaction.category}</small></span></td><td className="date-cell">{transaction.date}</td><td><span className={`status-pill ${transaction.status === "Pago" ? "paid" : "pending"}`}><i />{transaction.status}</span></td><td className={`amount-cell ${transaction.type === "income" ? "amount-income" : ""}`}>{transaction.type === "income" ? "+ " : "− "}{money(transaction.amount)}</td><td><button className="row-more" aria-label={`Opções para ${transaction.title}`}><Ellipsis size={18} /></button></td></tr>)}
              {visibleTransactions.length === 0 && <tr><td colSpan={5} className="empty-state">Nenhum lançamento encontrado.</td></tr>}
            </tbody></table></div>
          </section>}

          {activeNav === "Cartões" && <section className="module-view module-cards">
            <article className="panel module-card-overview"><div className="panel-heading"><div><h2>Seus cartões</h2><p>Acompanhe limites, faturas e próximos vencimentos.</p></div><span className="module-count">2 cartões</span></div>
              <div className="card-list-item"><div className="credit-card-visual"><div className="credit-card-top"><span className="card-chip"><i /><i /><i /><i /></span><span className="card-contactless">)))</span></div><span className="card-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;4829</span><div className="credit-card-bottom"><span><small>MEU CARTÃO</small><strong>Nubank Ultravioleta</strong></span><span className="mastercard-mark"><i /><i /></span></div></div><div className="card-details"><span className="invoice-badge"><i /> Fatura aberta</span><strong>R$ 1.260,40</strong><span>Vencimento em 05 nov</span><div className="card-detail-limit"><span>Limite utilizado</span><strong>12,6% <small>de R$ 10.000</small></strong></div><div className="card-limit"><span /><i /></div></div></div>
              <div className="card-secondary-row"><span className="secondary-card-icon"><CreditCard size={19} /></span><span><strong>Inter Gold</strong><small>•••• 1936 · Fecha dia 22</small></span><span className="secondary-card-bill"><small>Fatura atual</small><strong>R$ 684,90</strong></span><span className="invoice-badge"><i /> Aberta</span></div>
            </article>
            <article className="panel module-card-note"><CreditCard size={19} /><div><strong>Compras parceladas</strong><p>Parcelas futuras são organizadas por fatura e cartão.</p></div><button className="text-action" onClick={() => setActiveNav("Lançamentos")}>Ver lançamentos <ArrowUpRight size={15} /></button></article>
          </section>}

          {activeNav === "Orçamentos" && <section className="module-view panel budget-list-view"><div className="module-view-heading"><div><span className="module-eyebrow">PLANEJAMENTO</span><h2>Orçamentos de outubro</h2><p>Você utilizou R$ 3.256,00 de R$ 4.500,00 planejados.</p></div><span className="budget-usage">72% utilizado</span></div><div className="budget-progress budget-progress-large"><span /></div><div className="budget-list">{categoryBudgets.map((item) => <div className="budget-list-item" key={item.name}><div className="budget-list-header"><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{money(item.spent)} <small>de {money(item.limit)}</small></strong></div><div className="category-track"><span style={{ width: `${item.spent / item.limit * 100}%`, backgroundColor: item.color }} /></div><div className="budget-list-foot"><span>{Math.round(item.spent / item.limit * 100)}% utilizado</span><span>{money(item.limit - item.spent)} restantes</span></div></div>)}</div></section>}

          {activeNav === "Relatórios" && <section className="module-view reports-view"><article className="panel report-summary"><div><span className="module-eyebrow">OUTUBRO DE 2026</span><h2>Seu mês em números</h2><p>Uma leitura rápida das movimentações registradas.</p></div><button className="button-secondary" onClick={exportCsv}><Download size={15} /> Exportar CSV</button></article><div className="report-metrics"><article className="panel"><span>Receitas</span><strong className="amount-income">{money(12450)}</strong><small>6 movimentações</small></article><article className="panel"><span>Despesas</span><strong>{money(4029.32)}</strong><small>18 movimentações</small></article><article className="panel"><span>Resultado do mês</span><strong className="amount-income">+ {money(8420.68)}</strong><small>Saldo positivo</small></article></div><article className="panel report-chart"><div className="panel-heading"><div><h2>Receitas e despesas</h2><p>Comparativo dos últimos seis meses</p></div></div><div className="report-bars">{bars.map((bar) => <div className="report-bar-column" key={bar.label}><div className="bar-pair"><i className="income-bar" style={{ height: `${bar.income}%` }} /><i className="expense-bar" style={{ height: `${bar.expense}%` }} /></div><span>{bar.label}</span></div>)}</div><div className="chart-legend"><span><i className="legend-income" /> Receitas</span><span><i className="legend-expense" /> Despesas</span></div></article></section>}

          {activeNav === "Categorias" && <section className="module-view panel categories-view"><div className="module-view-heading"><div><span className="module-eyebrow">ORGANIZAÇÃO</span><h2>Categorias</h2><p>Classifique suas movimentações para entender melhor seus hábitos.</p></div><span className="module-count">6 categorias</span></div><div className="category-list">{[{ name: "Moradia", type: "Despesa", color: "#e5a94d", count: 4 }, { name: "Alimentação", type: "Despesa", color: "#5b9c83", count: 12 }, { name: "Transporte", type: "Despesa", color: "#6d8cc2", count: 7 }, { name: "Freelance", type: "Receita", color: "#519574", count: 3 }, { name: "Saúde", type: "Despesa", color: "#bd7f7a", count: 2 }, { name: "Lazer", type: "Despesa", color: "#9a82b0", count: 5 }].map((category) => <div className="category-list-item" key={category.name}><span className="category-color" style={{ backgroundColor: category.color }} /><strong>{category.name}</strong><span className={`category-type ${category.type === "Receita" ? "type-income" : ""}`}>{category.type}</span><small>{category.count} lançamentos</small><Ellipsis size={17} /></div>)}</div></section>}

          {activeNav === "Configurações" && <section className="module-view panel settings-view"><div className="module-view-heading"><div><span className="module-eyebrow">PREFERÊNCIAS</span><h2>Configurações do espaço</h2><p>Informações sobre sua conta e armazenamento.</p></div></div><div className="settings-row"><span className="settings-icon"><BadgeDollarSign size={18} /></span><div><strong>Perfil pessoal</strong><small>Mateus Silva · Controle financeiro pessoal</small></div><span className="settings-value">Local</span></div><div className="settings-row"><span className="settings-icon"><Wallet size={18} /></span><div><strong>Armazenamento de dados</strong><small>Os lançamentos ficam salvos neste navegador.</small></div><span className="local-status"><i /> Ativo</span></div><div className="settings-notice"><CircleHelp size={17} /><p>Para sincronizar dados entre dispositivos e proteger cada conta com login, conecte este app ao projeto Supabase.</p></div><button className="button-secondary settings-export" onClick={exportCsv}><Download size={15} /> Exportar meus lançamentos</button></section>}

          <footer className="page-footer"><span>Financia <i>•</i> seu controle, no seu ritmo.</span><span><Check size={13} /> Seus dados ficam salvos neste dispositivo</span></footer>
        </div>
      </section>

      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="modal-eyebrow">MOVIMENTAÇÃO</span><h2 id="modal-title">Novo lançamento</h2></div><button className="icon-button" aria-label="Fechar" onClick={() => setShowForm(false)}><X size={20} /></button></div><form onSubmit={addTransaction}><div className="type-toggle"><label><input type="radio" name="type" value="expense" defaultChecked /><span><ArrowUpRight size={16} /> Despesa</span></label><label><input type="radio" name="type" value="income" /><span><ArrowDownLeft size={16} /> Receita</span></label></div><label className="form-label">Descrição<input name="title" placeholder="Ex.: Conta de internet" required maxLength={255} /></label><div className="form-two"><label className="form-label">Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" placeholder="0,00" required /></label><label className="form-label">Data<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label></div><label className="form-label">Categoria<select name="category" defaultValue="Alimentação"><option>Alimentação</option><option>Moradia</option><option>Transporte</option><option>Freelance</option><option>Saúde</option><option>Lazer</option><option>Outros</option></select></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="button-primary"><Plus size={16} /> Adicionar lançamento</button></div></form></section></div>}
    </main>
  );
}
