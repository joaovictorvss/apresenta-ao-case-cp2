// --- VARIÁVEIS DE ESTADO ---
let totalEntradas = 0;
let totalSaidas = 0;

// --- SELETORES DE ELEMENTOS ---
const botaoAbrirModal = document.querySelector('header button');
const modalOverlay = document.querySelector('.modal-overlay');
const botaoFecharModal = document.querySelector('.close-modal');
const tabelaBody = document.querySelector('tbody');
const form = document.querySelector('form');
const tipoBoxes = document.querySelectorAll('.tipo-box');
const barraDePesquisa = document.querySelector('.search-bar input');

// Seletores dos cartões de resumo
const cardEntradas = document.querySelector('section div:first-child p');
const cardSaidas = document.querySelector('section div:nth-child(2) p');
const cardTotal = document.querySelector('section div:last-child p');

let tipoSelecionado = '';

// --- FUNÇÕES DE LÓGICA DO PROJETO ---
function formatarParaReal(valor) {
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) {
        return "R$ 0,00";
    }

    return valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function atualizarTotais() {
    const totalGeral = totalEntradas - totalSaidas;

    cardEntradas.textContent = formatarParaReal(totalEntradas);
    cardSaidas.textContent = formatarParaReal(totalSaidas);

    let valorInicial = parseFloat(cardTotal.textContent.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    let valorFinal = totalGeral;
    let duracao = 500;
    let passo = (valorFinal - valorInicial) / (duracao / 10);
    let tempoAtual = 0;

    function animar() {
        tempoAtual += 10;
        let valorAnimado = valorInicial + (passo * (tempoAtual / 10));
        
        cardTotal.textContent = formatarParaReal(valorAnimado);

        if (tempoAtual < duracao) {
            requestAnimationFrame(animar);
        } else {
            cardTotal.textContent = formatarParaReal(valorFinal);
        }
    }
    
    if (valorFinal !== valorInicial) {
        requestAnimationFrame(animar);
    }
    
    cardTotal.parentNode.classList.remove('card-entrada-animado', 'card-saida-animado');

    if (tipoSelecionado === 'entrada') {
        cardTotal.parentNode.classList.add('card-entrada-animado');
    } else {
        cardTotal.parentNode.classList.add('card-saida-animado');
    }

    setTimeout(() => {
        cardTotal.parentNode.classList.remove('card-entrada-animado', 'card-saida-animado');
    }, 500);
}

// --- FUNÇÕES DE INTERAÇÃO DO POP-UP ---
function abrirModal() {
    modalOverlay.style.display = 'flex';
}

function fecharModal() {
    modalOverlay.style.display = 'none';
    form.reset();
    tipoBoxes.forEach(box => box.classList.remove('selected'));
    tipoSelecionado = '';
}

// --- EVENT LISTENERS (Ouvintes de Evento) ---
botaoAbrirModal.addEventListener('click', abrirModal);
botaoFecharModal.addEventListener('click', fecharModal);

tipoBoxes.forEach(box => {
    box.addEventListener('click', () => {
        tipoBoxes.forEach(item => item.classList.remove('selected'));
        box.classList.add('selected');
        tipoSelecionado = box.classList.contains('entrada-box') ? 'entrada' : 'saida';
    });
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!tipoSelecionado) {
        alert("Por favor, selecione o tipo de transação (Entrada ou Saída).");
        return;
    }
    
    const descricao = document.querySelector('#descricao').value;
    const preco = document.querySelector('#preco').value;
    const categoria = document.querySelector('#categoria').value;

    if (isNaN(parseFloat(preco.replace(',', '.'))) || preco.trim() === '') {
        alert("Por favor, digite um valor numérico válido para o preço.");
        return;
    }

    const precoNumerico = parseFloat(preco.replace('R$', '').replace('.', '').replace(',', '.'));
    
    if (tipoSelecionado === 'saida') {
        totalSaidas += precoNumerico;
    } else {
        totalEntradas += precoNumerico;
    }

    const novaLinha = document.createElement('tr');
    const classeValor = tipoSelecionado === 'saida' ? 'saida' : 'entrada';
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const valorFormatado = (tipoSelecionado === 'saida' ? `- ${formatarParaReal(precoNumerico)}` : formatarParaReal(precoNumerico));

    novaLinha.innerHTML = `
        <td>${descricao}</td>
        <td class="${classeValor}">${valorFormatado}</td>
        <td>${categoria}</td>
        <td>${dataAtual}</td>
    `;

    // Adiciona a animação à nova linha
    tabelaBody.appendChild(novaLinha);
    novaLinha.style.animation = `fadeInSlideUp 0.5s ease-out forwards`;
    
    atualizarTotais();
    fecharModal();
});

document.addEventListener('DOMContentLoaded', () => {
    const valorInicialEntradas = parseFloat(cardEntradas.textContent.replace(/\D/g, '').replace(',', '.')) / 100 || 0;
    const valorInicialSaidas = parseFloat(cardSaidas.textContent.replace(/\D/g, '').replace(',', '.')) / 100 || 0;
    
    totalEntradas = valorInicialEntradas;
    totalSaidas = valorInicialSaidas;

    atualizarTotais();

    const linhasIniciais = tabelaBody.querySelectorAll('tr');
    linhasIniciais.forEach((linha, index) => {
        linha.style.animation = `fadeInSlideUp 0.5s ease-out forwards ${index * 0.1}s`;
    });
});

// --- FUNCIONALIDADE DA BARRA DE PESQUISA ---
barraDePesquisa.addEventListener('input', (event) => {
    const textoPesquisa = event.target.value.toLowerCase();
    const linhasTabela = tabelaBody.querySelectorAll('tr');
    
    let linhasVisiveis = 0;

    linhasTabela.forEach(linha => {
        const textoDaLinha = linha.textContent.toLowerCase();

        if (textoDaLinha.includes(textoPesquisa)) {
            linha.style.display = '';
            linhasVisiveis++;
        } else {
            linha.style.display = 'none';
        }
    });

    if (linhasVisiveis === 0 && textoPesquisa.length > 0) {
        tabelaBody.style.display = 'none'; // Esconde o corpo da tabela
    } else {
        tabelaBody.style.display = ''; // Mostra o corpo da tabela
    }
});