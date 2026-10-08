import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Building2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Search, 
  BookOpen, 
  Play, 
  RotateCcw,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { 
  analyzeOpportunityAdherence, 
  DEMO_SEMANTIC_EXAMPLES, 
  SERVICE_CATALOG 
} from '../services/semanticEngine';
import './SemanticEngineView.css';

export default function SemanticEngineView() {
  const [activeSubTab, setActiveSubTab] = useState('simulator'); // 'simulator' | 'catalog' | 'weights'

  // Estado do Simulador
  const [inputTitle, setInputTitle] = useState(DEMO_SEMANTIC_EXAMPLES[0].title);
  const [inputObject, setInputObject] = useState(DEMO_SEMANTIC_EXAMPLES[0].object);
  const [inputLocation, setInputLocation] = useState(DEMO_SEMANTIC_EXAMPLES[0].location);
  const [inputDays, setInputDays] = useState(DEMO_SEMANTIC_EXAMPLES[0].daysLeft);
  
  // Resultado da Análise
  const [analysisResult, setAnalysisResult] = useState(() => 
    analyzeOpportunityAdherence({
      title: DEMO_SEMANTIC_EXAMPLES[0].title,
      object: DEMO_SEMANTIC_EXAMPLES[0].object,
      location: DEMO_SEMANTIC_EXAMPLES[0].location,
      daysLeft: DEMO_SEMANTIC_EXAMPLES[0].daysLeft
    })
  );

  // Busca no catálogo
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCompanyFilter, setCatalogCompanyFilter] = useState('ALL');

  const handleRunAnalysis = () => {
    const result = analyzeOpportunityAdherence({
      title: inputTitle,
      object: inputObject,
      location: inputLocation,
      daysLeft: Number(inputDays) || 10
    });
    setAnalysisResult(result);
  };

  const loadExample = (ex) => {
    setInputTitle(ex.title);
    setInputObject(ex.object);
    setInputLocation(ex.location);
    setInputDays(ex.daysLeft);
    const result = analyzeOpportunityAdherence({
      title: ex.title,
      object: ex.object,
      location: ex.location,
      daysLeft: ex.daysLeft
    });
    setAnalysisResult(result);
  };

  const filteredCatalog = SERVICE_CATALOG.filter((item) => {
    if (catalogCompanyFilter !== 'ALL' && item.company !== catalogCompanyFilter) {
      return false;
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const match = 
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q)) ||
        item.synonyms.some(s => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="engine-view-container">
      {/* Topo do Módulo */}
      <div className="engine-hero-header">
        <div className="engine-hero-info">
          <div className="engine-tag-row">
            <span className="engine-badge-primary">
              <Cpu size={14} /> FASE 4 • NÚCLEO INTELIGENTE
            </span>
            <span className="engine-badge-sub">Interpretação Semântica & Contextual</span>
          </div>
          <h1 className="engine-main-title">Motor de Aderência Inteligente</h1>
          <p className="engine-main-desc">
            Algoritmo inteligente da plataforma que cruza automaticamente o objeto de contratação de um edital com o catálogo de serviços, termos técnicos, sinônimos, especialidades e restrições geográficas das empresas da família Vellia.
          </p>
        </div>

        {/* Abas Internas */}
        <div className="engine-subtabs-nav">
          <button 
            className={`subtab-btn ${activeSubTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('simulator')}
          >
            <Play size={15} />
            <span>Simulador Semântico</span>
          </button>
          <button 
            className={`subtab-btn ${activeSubTab === 'weights' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('weights')}
          >
            <Sliders size={15} />
            <span>Critérios & Pesos (100%)</span>
          </button>
          <button 
            className={`subtab-btn ${activeSubTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('catalog')}
          >
            <BookOpen size={15} />
            <span>Catálogo Ativo ({SERVICE_CATALOG.length})</span>
          </button>
        </div>
      </div>

      {/* ABA 1: SIMULADOR & ANÁLISE SEMÂNTICA */}
      {activeSubTab === 'simulator' && (
        <div className="simulator-grid">
          {/* Coluna Esquerda: Formulário de Entrada */}
          <div className="simulator-input-panel">
            <div className="panel-header">
              <div className="panel-title-wrap">
                <Sparkles size={16} className="text-teal" />
                <h3 className="panel-title">Entrada de Texto da Oportunidade</h3>
              </div>
              <span className="panel-tag">Teste em Tempo Real</span>
            </div>

            {/* Exemplos Rápidos Oficiais */}
            <div className="preset-examples-box">
              <span className="preset-label">Exemplos oficiais de interpretação semântica:</span>
              <div className="preset-buttons-group">
                {DEMO_SEMANTIC_EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.id}
                    className="preset-btn"
                    onClick={() => loadExample(ex)}
                  >
                    <span>Exemplo {i + 1}: {ex.expectedCompany.split(' ')[0]} ({ex.expectedServices[0]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos de Entrada */}
            <div className="input-fields-stack">
              <div className="form-group">
                <label className="form-label">Título da Oportunidade / Edital</label>
                <input
                  type="text"
                  className="form-input"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder="Ex: Contratação de serviços de engenharia..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Objeto / Descrição Técnica Completa</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={inputObject}
                  onChange={(e) => setInputObject(e.target.value)}
                  placeholder="Cole aqui o texto do objeto extraído do edital..."
                />
              </div>

              <div className="form-row-dual">
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={13} /> Local / Estado
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={inputLocation}
                    onChange={(e) => setInputLocation(e.target.value)}
                    placeholder="Ex: Ipojuca - PE"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={13} /> Prazo Restante (Dias)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={inputDays}
                    onChange={(e) => setInputDays(e.target.value)}
                    min={1}
                    max={60}
                  />
                </div>
              </div>

              <button className="btn-run-engine" onClick={handleRunAnalysis}>
                <Cpu size={16} />
                <span>Processar Interpretação Semântica</span>
              </button>
            </div>
          </div>

          {/* Coluna Direita: Resultado do Motor */}
          <div className="simulator-result-panel">
            {/* Header do Resultado com Pontuação e Classificação */}
            <div className={`result-hero-box tier-${analysisResult.tierKey}`}>
              <div className="result-score-block">
                <div className="result-score-circle">
                  <span className="result-score-val">{analysisResult.finalScore}%</span>
                  <span className="result-score-lbl">aderência</span>
                </div>
                <div className="result-score-meta">
                  <div className="result-tier-pill">
                    {analysisResult.finalScore >= 90 && <Flame size={13} />}
                    <span>{analysisResult.classification}</span>
                  </div>
                  <h3 className="result-emp-name">
                    Empresa Sugerida: <strong>{analysisResult.recommendedCompany}</strong>
                  </h3>
                  <p className="result-serv-main">
                    Serviço Principal Identificado: <span>{analysisResult.primaryServiceName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: EXPLICAÇÃO DA PONTUAÇÃO (REQUISITO FUNDAMENTAL) */}
            <div className="explanation-section-card">
              <div className="explanation-header">
                <Info size={16} className="text-teal" />
                <h4 className="explanation-title">Explicação da Pontuação ({analysisResult.finalScore}%)</h4>
              </div>
              <p className="explanation-summary-text">
                {analysisResult.explanationSummary}
              </p>
            </div>

            {/* Termos e Sinônimos Capturados */}
            <div className="detected-terms-card">
              <div className="detected-terms-header">
                <span className="detected-label">Termos, Sinônimos e Palavras Identificadas:</span>
                <span className="detected-count">{analysisResult.matchedKeywords.length} termos</span>
              </div>
              <div className="terms-pill-container">
                {analysisResult.matchedKeywords.length === 0 ? (
                  <span className="empty-terms-msg">Nenhum termo técnico exato identificado no catálogo.</span>
                ) : (
                  analysisResult.matchedKeywords.map((term, i) => (
                    <span key={i} className="term-chip-highlight">
                      <CheckCircle2 size={11} /> {term}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* COMPONENTES DA ANÁLISE (PESOS DA FASE 4) */}
            <div className="components-breakdown-card">
              <h4 className="components-title">Detalhamento dos 6 Componentes da Análise</h4>
              <div className="components-list">
                {analysisResult.scoreBreakdown.map((comp, idx) => (
                  <div key={idx} className="component-row">
                    <div className="comp-info-col">
                      <div className="comp-name-row">
                        <span className="comp-name">{comp.name}</span>
                        <span className="comp-weight">Peso: {comp.weight}</span>
                      </div>
                      <p className="comp-desc">{comp.description}</p>
                    </div>

                    <div className="comp-score-col">
                      <div className="comp-points-pill">
                        <strong>{comp.obtainedPoints}</strong> / {comp.maxPoints} pts
                      </div>
                      <div className="comp-progress-bar">
                        <div 
                          className="comp-progress-fill" 
                          style={{ width: `${(comp.obtainedPoints / comp.maxPoints) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: REGRAS, CRITÉRIOS E PESOS (100%) */}
      {activeSubTab === 'weights' && (
        <div className="weights-tab-content">
          <div className="weights-overview-card">
            <h3 className="section-heading">Matriz Oficial de Pesos do Motor de Aderência</h3>
            <p className="section-subheading">
              A pontuação final é calculada em uma escala de 0 a 100%, dividida em 6 componentes calibrados conforme as diretrizes comerciais e técnicas da Vellia:
            </p>

            <div className="weights-cards-grid">
              <div className="weight-box">
                <div className="weight-percentage">40%</div>
                <h4 className="weight-title">Compatibilidade Técnica</h4>
                <p className="weight-desc">
                  Avalia a correspondência direta e contextual do objeto da licitação com o catálogo técnico de serviços cadastrados.
                </p>
                <span className="weight-tag">Componente Core</span>
              </div>

              <div className="weight-box">
                <div className="weight-percentage">15%</div>
                <h4 className="weight-title">Palavras e Termos Relacionados</h4>
                <p className="weight-desc">
                  Mapeia expressões técnicas, sinônimos formais de editais e termos correlatos sem exigir grafia idêntica.
                </p>
                <span className="weight-tag">Semântica Avançada</span>
              </div>

              <div className="weight-box">
                <div className="weight-percentage">15%</div>
                <h4 className="weight-title">Empresa Compatível</h4>
                <p className="weight-desc">
                  Verifica se há empresa cadastrada (Excelência Ambiental ou Veeluen Solutions) com registro e corpo técnico apto.
                </p>
                <span className="weight-tag">Elegibilidade</span>
              </div>

              <div className="weight-box">
                <div className="weight-percentage">10%</div>
                <h4 className="weight-title">Região Geográfica</h4>
                <p className="weight-desc">
                  Compara a localidade da contratação com a sede da empresa (Pernambuco) e os estados de cobertura prioritária.
                </p>
                <span className="weight-tag">Logística</span>
              </div>

              <div className="weight-box">
                <div className="weight-percentage">10%</div>
                <h4 className="weight-title">Prioridade Comercial</h4>
                <p className="weight-desc">
                  Bonifica serviços estratégicos de maior valor agregado, como emissões industriais, NR-13 e operação de ETE.
                </p>
                <span className="weight-tag">Estratégia</span>
              </div>

              <div className="weight-box">
                <div className="weight-percentage">10%</div>
                <h4 className="weight-title">Prazo Viável</h4>
                <p className="weight-desc">
                  Penaliza editais com prazos inviáveis e favorece oportunidades com tempo suficiente para elaboração de proposta.
                </p>
                <span className="weight-tag">Viabilidade</span>
              </div>
            </div>
          </div>

          {/* Faixas de Classificação */}
          <div className="classification-tiers-card">
            <h4 className="tiers-title">Escala de Classificação Semântica (0 a 100%)</h4>
            <div className="tiers-grid">
              <div className="tier-card tier-card-critical">
                <div className="tier-header">
                  <span className="tier-range">90 a 100%</span>
                  <span className="tier-badge-label">PRIORIDADE CRÍTICA</span>
                </div>
                <p className="tier-guideline">
                  Ação comercial imediata. Edital com alinhamento técnico perfeito, empresa habilitada e condições ótimas.
                </p>
              </div>

              <div className="tier-card tier-card-high">
                <div className="tier-header">
                  <span className="tier-range">80 a 89%</span>
                  <span className="tier-badge-label">ALTA ADERÊNCIA</span>
                </div>
                <p className="tier-guideline">
                  Forte oportunidade. Recomendado envio prioritário para estudo de precificação e habilitação.
                </p>
              </div>

              <div className="tier-card tier-card-good">
                <div className="tier-header">
                  <span className="tier-range">70 a 79%</span>
                  <span className="tier-badge-label">BOA OPORTUNIDADE</span>
                </div>
                <p className="tier-guideline">
                  Aderência positiva com pequenos pontos de atenção (ex: prazo intermediário ou região secundária).
                </p>
              </div>

              <div className="tier-card tier-card-review">
                <div className="tier-header">
                  <span className="tier-range">50 a 69%</span>
                  <span className="tier-badge-label">ANALISAR</span>
                </div>
                <p className="tier-guideline">
                  Requer triagem manual da equipe comercial para validar viabilidade e requisitos complementares.
                </p>
              </div>

              <div className="tier-card tier-card-low">
                <div className="tier-header">
                  <span className="tier-range">0 a 49%</span>
                  <span className="tier-badge-label">BAIXA ADERÊNCIA</span>
                </div>
                <p className="tier-guideline">
                  Pouca afinidade com o portfólio cadastrado ou prazo/condições inviáveis para participação.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CATÁLOGO SEMÂNTICO ATIVO */}
      {activeSubTab === 'catalog' && (
        <div className="catalog-tab-content">
          <div className="catalog-control-bar">
            <div className="catalog-search-wrap">
              <Search size={16} className="search-icon-cat" />
              <input
                type="text"
                placeholder="Buscar por serviço, termo técnico, sinônimo ou edital..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="catalog-search-input"
              />
            </div>

            <div className="company-filter-pills">
              <button
                className={`filter-pill ${catalogCompanyFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setCatalogCompanyFilter('ALL')}
              >
                Todas ({SERVICE_CATALOG.length})
              </button>
              <button
                className={`filter-pill ${catalogCompanyFilter === 'Excelência Ambiental' ? 'active' : ''}`}
                onClick={() => setCatalogCompanyFilter('Excelência Ambiental')}
              >
                Excelência Ambiental (11)
              </button>
              <button
                className={`filter-pill ${catalogCompanyFilter === 'Veeluen Solutions' ? 'active' : ''}`}
                onClick={() => setCatalogCompanyFilter('Veeluen Solutions')}
              >
                Veeluen Solutions (18)
              </button>
            </div>
          </div>

          <div className="catalog-cards-grid">
            {filteredCatalog.map((service) => (
              <div key={service.id} className="catalog-item-card">
                <div className="item-card-top">
                  <span className={`company-mini-tag ${service.company === 'Excelência Ambiental' ? 'tag-ea' : 'tag-vs'}`}>
                    <Building2 size={12} /> {service.company}
                  </span>
                  <span className="category-mini-tag">{service.category}</span>
                </div>

                <h4 className="item-card-title">{service.name}</h4>
                <p className="item-card-desc">{service.technicalDescription}</p>

                <div className="terms-section-block">
                  <span className="terms-block-lbl">Palavras-chave e Sinônimos Semânticos:</span>
                  <div className="terms-chips-flow">
                    {service.keywords.slice(0, 4).map((k, i) => (
                      <span key={i} className="chip-kw">{k}</span>
                    ))}
                    {service.synonyms.slice(0, 2).map((s, i) => (
                      <span key={i} className="chip-syn">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="edital-phrases-block">
                  <span className="edital-phrases-lbl">Terminologia Comum em Editais:</span>
                  <ul className="phrases-list">
                    {service.editalPhrases.map((phrase, i) => (
                      <li key={i}>"{phrase}"</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
