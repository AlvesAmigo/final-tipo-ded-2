// =================================================================
// DADOS DO SISTEMA INFLUXO (MOCK DATA)
// =================================================================

const characterData = {
    attributes: ["FOR", "DES", "CON", "INT", "SAB", "CAR"],
    attributeScores: [15, 14, 13, 12, 10, 8],
    classes: {
        "Manipulador de Fluxo": {
            bonusAttribute: "INT",
            initialHP: 10,
            hpPerLevel: 6,
            initialPdH: 5,
            pdhPerLevel: 3
        },
        "Evocador de Entidades": {
            bonusAttribute: "SAB",
            initialHP: 12,
            hpPerLevel: 7,
            initialPdH: 3,
            pdhPerLevel: 2
        },
        "Especialista": {
            bonusAttribute: "DES",
            initialHP: 14,
            hpPerLevel: 8,
            initialPdH: 0,
            pdhPerLevel: 1
        },
        "Combatente do Fluxo": {
            bonusAttribute: "FOR",
            initialHP: 16,
            hpPerLevel: 10,
            initialPdH: 0,
            pdhPerLevel: 0
        }
    },
    origins: {
        "Nômade": { skills: ["Sobrevivência", "Percepção"] },
        "Acadêmico": { skills: ["Conhecimento", "História"] },
        "Militante": { skills: ["Luta", "Intimidação"] }
    }
    // Adicionar mais dados conforme o sistema
};

let currentCharacter = {
    name: "",
    class: "",
    origin: "",
    attrScores: {},
    hp: 0,
    ca: 0,
    skills: []
};


// =================================================================
// SISTEMA DE NAVEGAÇÃO
// =================================================================

const appContainer = document.getElementById('app-container');

// Mapeamento de rotas e funções de renderização
const routes = {
    '/': renderHomePage,
    '/create': renderCharacterCreation,
    '/rules': renderRulesPage,
    '/combat-sim': renderCombatSimulator,
    '/fluxo': renderFluxoPage
};

function navigate(path) {
    if (routes[path]) {
        // Altera o estado do histórico para suportar navegação do navegador
        history.pushState(null, '', path);
        routes[path]();
        window.scrollTo(0, 0); // Volta ao topo
    } else {
        appContainer.innerHTML = '<h2>Página não encontrada</h2>';
    }
}

// Inicializa a página
window.onload = () => {
    // Escuta o evento de back/forward do navegador
    window.onpopstate = () => navigate(location.pathname); 
    navigate(location.pathname === '/' ? '/' : location.pathname);
};


// =================================================================
// 1. PÁGINA INICIAL
// =================================================================

function renderHomePage() {
    appContainer.innerHTML = `
        <div id="home-content">
            <h1>Influxo – A Força da Imaginação</h1>
            <div class="intro-text">
                <p>“Bem-vindos ao mundo de Influxo! Aqui, cada ser carrega dentro de si um brilho único... O Fluxo é a energia primordial da imaginação, o tecido invisível que conecta todas as coisas. Ele é a própria manifestação da vontade e do pensamento, e aqueles que aprendem a manipulá-lo se tornam verdadeiros arquitetos da realidade. No entanto, o Fluxo é volátil e perigoso, e o universo está cheio de Entidades que são atraídas por seu poder. Você está pronto para dominar a sua essência e moldar o seu próprio destino?”</p>
            </div>
            <div class="button-group">
                <button onclick="navigate('/create')">✨ Criar Personagem</button>
                <button onclick="navigate('/rules')">📖 Ver Regras</button>
                <button onclick="navigate('/combat-sim')">⚔️ Simulador de Combate</button>
                <button onclick="navigate('/fluxo')">🌀 Sobre o Fluxo</button>
            </div>
        </div>
    `;
}


// =================================================================
// 2. CRIAÇÃO DE PERSONAGEM (ESQUELETO)
// =================================================================

function renderCharacterCreation() {
    appContainer.innerHTML = `
        <h2>✨ Criação de Personagem</h2>
        <form id="char-creation-form">
            
            <h3>Informações Básicas</h3>
            <label for="char-name">Nome:</label><input type="text" id="char-name" required><br>
            <label for="char-concept">Conceito Breve:</label><input type="text" id="char-concept"><br>

            <h3>Atributos Base (Arraste os valores)</h3>
            <div class="attribute-assignment">
                <div class="score-pool">
                    <h4>Valores Disponíveis:</h4>
                    ${characterData.attributeScores.map(score => 
                        `<span class="score-item" data-score="${score}" onclick="selectScore(${score})">${score}</span>`
                    ).join('')}
                </div>
                <div class="attribute-targets" id="attr-targets">
                    ${characterData.attributes.map(attr => 
                        `<div class="attribute-target" data-attribute="${attr}" onclick="assignAttribute('${attr}')">
                            <label>${attr}</label>
                            <span class="current-score" id="score-${attr}">?</span>
                        </div>`
                    ).join('')}
                </div>
            </div>

            <h3>Classe e Origem</h3>
            <label for="char-class">Classe:</label>
            <select id="char-class" onchange="updateCharacterDetails()">
                <option value="">Selecione uma Classe</option>
                ${Object.keys(characterData.classes).map(c => `<option value="${c}">${c}</option>`).join('')}
            </select><br>

            <label for="char-origin">Origem:</label>
            <select id="char-origin" onchange="updateCharacterDetails()">
                <option value="">Selecione uma Origem</option>
                ${Object.keys(characterData.origins).map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
            
            <h3>Resumo da Ficha (Automático)</h3>
            <p><strong>Vida Inicial:</strong> <span id="summary-hp">0</span></p>
            <p><strong>CA (Armadura):</strong> <span id="summary-ca">10 + CON</span></p>
            <p><strong>Perícias Iniciais:</strong> <span id="summary-skills">Nenhuma</span></p>
            
            <button type="button" onclick="generateCharacterSheet()">📄 Gerar Ficha</button>

        </form>
    `;

    // Inicializa a lógica de atribuição
    initializeAttributeAssignment();
}


// Lógica de Atribuição de Atributos (Simples, sem Drag and Drop real)
let selectedScore = null;

function initializeAttributeAssignment() {
    // Limpa o estado
    currentCharacter.attrScores = {}; 
    document.querySelectorAll('.attribute-target').forEach(target => {
        target.querySelector('.current-score').textContent = '?';
        target.classList.remove('assigned');
    });
    document.querySelectorAll('.score-item').forEach(item => {
        item.style.opacity = '1';
        item.classList.remove('selected');
    });
    selectedScore = null;
}

function selectScore(score) {
    // Desseleciona o anterior
    document.querySelectorAll('.score-item').forEach(item => item.classList.remove('selected'));

    const item = document.querySelector(`.score-item[data-score="${score}"]:not([style*="opacity: 0.5"])`);
    if (item) {
        item.classList.add('selected');
        selectedScore = score;
    } else {
        selectedScore = null;
    }
}

function assignAttribute(attr) {
    const targetEl = document.querySelector(`.attribute-target[data-attribute="${attr}"]`);
    const scoreDisplay = targetEl.querySelector('.current-score');
    
    // 1. Tenta atribuir um novo score
    if (selectedScore !== null) {
        
        // 1a. Se o atributo já tinha um score, devolve-o ao pool
        if (currentCharacter.attrScores[attr]) {
            const oldScore = currentCharacter.attrScores[attr];
            const oldItem = document.querySelector(`.score-item[data-score="${oldScore}"][style*="opacity: 0.5"]`);
            if (oldItem) oldItem.style.opacity = '1';
        }

        // 1b. Atribui o novo score e remove-o do pool
        currentCharacter.attrScores[attr] = selectedScore;
        scoreDisplay.textContent = selectedScore;
        targetEl.classList.add('assigned');
        
        const newItem = document.querySelector(`.score-item[data-score="${selectedScore}"]:not(.assigned):not([style*="opacity: 0.5"])`);
        if (newItem) newItem.style.opacity = '0.5'; // Marca como usado

        // 1c. Limpa a seleção
        document.querySelectorAll('.score-item').forEach(item => item.classList.remove('selected'));
        selectedScore = null;
        
    } else if (currentCharacter.attrScores[attr]) {
        // 2. Se não há score selecionado, remove o score atual (devolve ao pool)
        const oldScore = currentCharacter.attrScores[attr];
        delete currentCharacter.attrScores[attr];
        scoreDisplay.textContent = '?';
        targetEl.classList.remove('assigned');
        
        const oldItem = document.querySelector(`.score-item[data-score="${oldScore}"][style*="opacity: 0.5"]`);
        if (oldItem) oldItem.style.opacity = '1';
    }
    
    updateCharacterDetails();
}

function getModifier(score) {
    // Modificador = Math.floor((Score - 10) / 2)
    return Math.floor((score - 10) / 2);
}

function updateCharacterDetails() {
    const charClass = document.getElementById('char-class')?.value;
    const charOrigin = document.getElementById('char-origin')?.value;
    
    currentCharacter.class = charClass;
    currentCharacter.origin = charOrigin;
    
    let hp = 0;
    let ca = '10 + CON';
    let skills = 'Nenhuma';
    
    // 1. Cálculo de HP e CA (Se CON estiver atribuído)
    const conScore = currentCharacter.attrScores["CON"];
    if (conScore) {
        const conMod = getModifier(conScore);
        
        // HP = HP Inicial da Classe + Modificador de CON
        if (charClass && characterData.classes[charClass]) {
            hp = characterData.classes[charClass].initialHP + conMod;
            document.getElementById('summary-hp').textContent = hp;
        }
        
        // CA = 10 + Modificador de CON
        ca = 10 + conMod;
        document.getElementById('summary-ca').textContent = ca;
    } else {
        document.getElementById('summary-hp').textContent = 0;
        document.getElementById('summary-ca').textContent = '10 + CON';
    }

    // 2. Perícias (Da Origem)
    if (charOrigin && characterData.origins[charOrigin]) {
        skills = characterData.origins[charOrigin].skills.join(', ');
        document.getElementById('summary-skills').textContent = skills;
        currentCharacter.skills = characterData.origins[charOrigin].skills;
    } else {
        document.getElementById('summary-skills').textContent = 'Nenhuma';
    }
}

function generateCharacterSheet() {
    // 1. Validação básica
    if (Object.keys(currentCharacter.attrScores).length !== 6 || !currentCharacter.class || !currentCharacter.origin) {
        alert("🚨 Por favor, complete todos os 6 atributos, a Classe e a Origem.");
        return;
    }

    currentCharacter.name = document.getElementById('char-name').value || "Aventureiro Sem Nome";
    
    // 2. Finaliza os cálculos
    const conScore = currentCharacter.attrScores["CON"];
    const conMod = getModifier(conScore);
    const charClassData = characterData.classes[currentCharacter.class];
    
    currentCharacter.hp = charClassData.initialHP + conMod;
    currentCharacter.ca = 10 + conMod;

    // 3. Salva no LocalStorage (Simulação)
    localStorage.setItem('influxo-character', JSON.stringify(currentCharacter));
    
    alert(`🎉 Ficha de ${currentCharacter.name} gerada e salva! \nHP: ${currentCharacter.hp}, CA: ${currentCharacter.ca}`);
    
    // Em uma aplicação real, aqui navegaríamos para a página de Ficha/Painel
    // navigate('/sheet'); 
}


// =================================================================
// 5. SISTEMA DE ROLAGEM DE DADOS
// =================================================================

function rollDice(sides, modifier) {
    const result = Math.floor(Math.random() * sides) + 1;
    const finalResult = result + modifier;
    
    const historyBox = document.getElementById('roll-history');
    const rollEntry = document.createElement('div');
    rollEntry.className = 'roll-entry';

    let modText = modifier > 0 ? ` + ${modifier}` : (modifier < 0 ? ` - ${Math.abs(modifier)}` : '');
    let fullRollText = `1d${sides}${modText} = ${result}`;

    if (modifier !== 0) {
        fullRollText += ` (Total: ${finalResult})`;
    } else {
         fullRollText += ` (Resultado: ${finalResult})`;
    }
    
    rollEntry.textContent = fullRollText;
    historyBox.prepend(rollEntry); // Adiciona ao topo

    // Limita o histórico
    if (historyBox.children.length > 10) {
        historyBox.lastChild.remove();
    }
    
    // Feedback visual para o usuário
    console.log(`Rolagem: ${fullRollText}`);
    return finalResult;
}

function handleCustomRoll() {
    const modifierInput = document.getElementById('dice-modifier');
    const modifier = parseInt(modifierInput.value) || 0;
    
    // Por padrão, se não selecionar um dado, rola 1d20
    rollDice(20, modifier); 
    modifierInput.value = ''; // Limpa o modificador
}


// =================================================================
// 3, 4, 6, 7. PÁGINAS DE CONTEÚDO (ESQUELETO)
// =================================================================

function renderRulesPage() {
    // Transformar os textos fornecidos em um manual interativo com acordeões/abas
    appContainer.innerHTML = `
        <h2>📖 Regras do Sistema</h2>
        <p>Conteúdo completo sobre Atributos, Secundários, Tipos de Dano, Ações de Combate, Condições e a Mecânica de Coreografia será exibido aqui em formato de manual interativo.</p>
        
        <h3>Atributos</h3>
        <div class="rules-section">
            <p><strong>FOR: Força.</strong> Mede o poder muscular e o vigor físico. Usada para ataques corpo a corpo e testes de levantamento/empurrão.</p>
            <p><strong>DES: Destreza.</strong> Mede a agilidade, coordenação e reflexos. Usada para Esquiva, ataques à distância e testes de acrobacia.</p>
            </div>
        
        <h3>Tipos de Dano</h3>
        <ul>
            <li>🔥 Queimadura</li>
            <li>🔪 Perfuração</li>
            </ul>
        
        <button onclick="navigate('/')">Voltar à Home</button>
    `;
}

function renderCombatSimulator() {
     appContainer.innerHTML = `
        <h2>⚔️ Simulador de Combate (Protótipo)</h2>
        <p>Nesta área, será implementada a lógica de turnos, registro de dano, aplicação de condições e testes de Quase Morte, utilizando as funções de rolagem de dados e a ficha do personagem (se carregada).</p>
        
        <div class="combat-log" style="border: 1px solid magenta; padding: 10px; min-height: 200px;">
            <h4>Registro de Ações</h4>
            </div>
        <div class="action-panel">
            <button>Ataque</button>
            <button>Esquiva</button>
            <button>Contra-ataque</button>
            <button>Manobra</button>
        </div>
    `;
}

function renderFluxoPage() {
    appContainer.innerHTML = `
        <h2>🌀 O Fluxo – A Força da Imaginação</h2>
        <p>Aqui, o sistema de Manipulação, Evolução, Riscos e a Personalização da Habilidade Única serão detalhados.</p>
        
        <button onclick="alert('Formulário de criação de habilidade única aberto!')">✏️ Criar Minha Habilidade do Fluxo</button>
    `;
}