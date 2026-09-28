const API_URL = 'http://localhost:3000';

let livrosData = [];
let autoresData = [];
let categoriasData = [];

let livroEmEdicaoId = null;
let etapaAtual = 1;

// Guarda temporariamente a imagem escolhida do computador.
// Pode ser uma string Base64/DataURL.
let imagemBase64Temp = '';


// =========================================================
// 1. CARREGAR AUTORES E CATEGORIAS
// =========================================================

async function carregarOpcoesSelect() {
  try {
    const [resAutores, resCategorias] = await Promise.all([
      fetch(`${API_URL}/autores`),
      fetch(`${API_URL}/categorias`)
    ]);

    if (!resAutores.ok) {
      throw new Error(`Erro ao carregar autores: ${resAutores.status}`);
    }

    if (!resCategorias.ok) {
      throw new Error(`Erro ao carregar categorias: ${resCategorias.status}`);
    }

    autoresData = await resAutores.json();
    categoriasData = await resCategorias.json();

    // Select de autores
    const selectAutor = document.getElementById('autor_id');

    if (selectAutor) {
      selectAutor.innerHTML =
        '<option value="">Selecione um autor...</option>';

      autoresData.forEach(autor => {
        selectAutor.innerHTML += `
          <option value="${autor.id}">
            ${autor.nome}
          </option>
        `;
      });
    }

    // Select de categorias
    const selectCategoria = document.getElementById('categoria_id');

    if (selectCategoria) {
      selectCategoria.innerHTML =
        '<option value="">Selecione uma categoria...</option>';

      categoriasData.forEach(categoria => {
        selectCategoria.innerHTML += `
          <option value="${categoria.id}">
            ${categoria.nome}
          </option>
        `;
      });
    }

    // Filtro de categoria
    const genreFilter = document.getElementById('genreFilter');

    if (genreFilter) {
      genreFilter.innerHTML =
        '<option value="">Todos os gêneros</option>';

      categoriasData.forEach(categoria => {
        genreFilter.innerHTML += `
          <option value="${categoria.id}">
            ${categoria.nome}
          </option>
        `;
      });
    }

  } catch (erro) {
    console.error('Erro ao carregar opções dos selects:', erro);
  }
}


// =========================================================
// 2. FILTROS
// =========================================================

function aplicarFiltros() {

  const topbarInput =
    document.querySelector('.topbar .search-bar input')
      ?.value
      .toLowerCase()
      .trim() || '';

  const filterInput =
    document.getElementById('filterInput')
      ?.value
      .toLowerCase()
      .trim() || '';

  const genreFilter =
    document.getElementById('genreFilter')
      ?.value || '';

  const termoBusca = topbarInput || filterInput;

  const livrosFiltrados = livrosData.filter(livro => {

    const autorNome = (
      autoresData.find(
        autor => String(autor.id) === String(livro.autor_id)
      )?.nome || ''
    ).toLowerCase();

    const titulo =
      (livro.titulo || '').toLowerCase();

    const isbn =
      (livro.isbn || '').toLowerCase();

    const bateuTexto =
      !termoBusca ||
      titulo.includes(termoBusca) ||
      autorNome.includes(termoBusca) ||
      isbn.includes(termoBusca);

    const bateuCategoria =
      !genreFilter ||
      String(livro.categoria_id) === String(genreFilter);

    return bateuTexto && bateuCategoria;
  });

  renderBooks(livrosFiltrados);
}


function inicializarEventosFiltro() {

  const topbarInput =
    document.querySelector('.topbar .search-bar input');

  const filterInput =
    document.getElementById('filterInput');

  const genreFilter =
    document.getElementById('genreFilter');


  if (topbarInput) {

    topbarInput.addEventListener('input', e => {

      if (filterInput) {
        filterInput.value = e.target.value;
      }

      aplicarFiltros();
    });
  }


  if (filterInput) {

    filterInput.addEventListener('input', e => {

      if (topbarInput) {
        topbarInput.value = e.target.value;
      }

      aplicarFiltros();
    });
  }


  if (genreFilter) {

    genreFilter.addEventListener(
      'change',
      aplicarFiltros
    );
  }
}


// =========================================================
// 3. NAVEGAÇÃO DAS ETAPAS
// =========================================================

function irParaEtapa(etapa) {

  // Antes de ir para a etapa 2,
  // verifica os campos obrigatórios.

  if (etapa === 2) {

    const titulo =
      document.getElementById('titulo')?.value.trim();

    const autor =
      document.getElementById('autor_id')?.value;

    const categoria =
      document.getElementById('categoria_id')?.value;


    if (!titulo || !autor || !categoria) {

      alert(
        'Por favor, preencha os campos obrigatórios ' +
        '(Título, Autor e Categoria) antes de avançar.'
      );

      return;
    }
  }


  etapaAtual = etapa;


  const etapa1El =
    document.getElementById('etapa-1');

  const etapa2El =
    document.getElementById('etapa-2');

  const badge1El =
    document.getElementById('step1-badge');

  const badge2El =
    document.getElementById('step2-badge');


  if (etapa1El) {
    etapa1El.style.display =
      etapa === 1 ? 'block' : 'none';
  }


  if (etapa2El) {
    etapa2El.style.display =
      etapa === 2 ? 'block' : 'none';
  }


  if (badge1El) {
    badge1El.classList.toggle(
      'active',
      etapa === 1
    );
  }


  if (badge2El) {
    badge2El.classList.toggle(
      'active',
      etapa === 2
    );
  }
}


// =========================================================
// 4. PREVIEW DA CAPA
// =========================================================

function atualizarPreviewCapa(url) {

  const imgPreview =
    document.getElementById('imgPreview');

  const defaultIcon =
    document.getElementById('defaultIcon');


  if (!imgPreview) {
    return;
  }


  if (url && url.trim() !== '') {

    imgPreview.src = url;

    imgPreview.style.display = 'block';

    if (defaultIcon) {
      defaultIcon.style.display = 'none';
    }

  } else {

    imgPreview.src = '';

    imgPreview.style.display = 'none';

    if (defaultIcon) {
      defaultIcon.style.display = 'block';
    }
  }
}


// =========================================================
// 5. PROCESSAR IMAGEM DO COMPUTADOR
// =========================================================

function processarImagemLocal(event) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  // Verifica se é imagem
  if (!file.type.startsWith('image/')) {

    alert('Por favor, selecione um arquivo de imagem.');

    event.target.value = '';

    return;
  }


  const reader = new FileReader();


  reader.onload = function (e) {

    const resultado =
      e.target.result;


    // Guarda a imagem para ser enviada
    // junto com o livro.

    imagemBase64Temp = resultado;


    // Como estamos usando a imagem local,
    // limpamos a URL para evitar conflito.

    const inputImagem =
      document.getElementById('imagem');

    if (inputImagem) {
      inputImagem.value = '';
    }


    // Mostra no preview.

    atualizarPreviewCapa(imagemBase64Temp);
  };


  reader.onerror = function () {

    console.error(
      'Erro ao ler arquivo:',
      reader.error
    );

    alert(
      'Não foi possível ler a imagem selecionada.'
    );
  };


  // Converte a imagem para Base64/DataURL.
  reader.readAsDataURL(file);
}


// =========================================================
// 6. ABRIR MODAL
// =========================================================

async function abrirModal(livro = null) {

  await carregarOpcoesSelect();


  const modal =
    document.getElementById('modalLivro');

  const tituloModal =
    document.getElementById('modalTitulo');


  if (!modal) {
    return;
  }


  // Sempre começa na etapa 1.

  irParaEtapa(1);


  // =======================================================
  // EDITANDO LIVRO
  // =======================================================

  if (livro) {

    livroEmEdicaoId = livro.id;

    imagemBase64Temp = '';


    if (tituloModal) {
      tituloModal.textContent =
        'Editar Livro';
    }


    document.getElementById('titulo').value =
      livro.titulo || '';

    document.getElementById('autor_id').value =
      livro.autor_id || '';

    document.getElementById('categoria_id').value =
      livro.categoria_id || '';


    const isbn =
      document.getElementById('isbn');

    if (isbn) {
      isbn.value = livro.isbn || '';
    }


    const ano =
      document.getElementById('ano_publicacao');

    if (ano) {
      ano.value =
        livro.ano_publicacao || '';
    }


    const editora =
      document.getElementById('editora');

    if (editora) {
      editora.value =
        livro.editora || '';
    }


    const sinopse =
      document.getElementById('sinopse');

    if (sinopse) {
      sinopse.value =
        livro.sinopse || '';
    }


    const imagem =
      document.getElementById('imagem');

    if (imagem) {

      // Se a imagem atual for uma URL,
      // coloca no campo.

      // Se for Base64, também funciona,
      // embora fique enorme no input.

      imagem.value =
        livro.imagem || '';

      atualizarPreviewCapa(
        livro.imagem || ''
      );
    }


    const imagemFile =
      document.getElementById('imagemFile');

    if (imagemFile) {
      imagemFile.value = '';
    }


  }

  // =======================================================
  // NOVO LIVRO
  // =======================================================

  else {

    livroEmEdicaoId = null;

    imagemBase64Temp = '';


    if (tituloModal) {
      tituloModal.textContent =
        'Cadastrar Novo Livro';
    }


    const form =
      document.getElementById('formLivro');

    if (form) {
      form.reset();
    }


    const imagemFile =
      document.getElementById('imagemFile');

    if (imagemFile) {
      imagemFile.value = '';
    }


    atualizarPreviewCapa('');
  }


  modal.style.display = 'flex';
}


// =========================================================
// 7. FECHAR MODAL
// =========================================================

function fecharModal() {

  const modal =
    document.getElementById('modalLivro');


  if (modal) {
    modal.style.display = 'none';
  }


  const form =
    document.getElementById('formLivro');

  if (form) {
    form.reset();
  }


  const imagemFile =
    document.getElementById('imagemFile');

  if (imagemFile) {
    imagemFile.value = '';
  }


  imagemBase64Temp = '';

  livroEmEdicaoId = null;

  atualizarPreviewCapa('');

  irParaEtapa(1);
}


// =========================================================
// 8. CARREGAR LIVROS
// =========================================================

async function carregarLivros() {

  try {

    const resposta =
      await fetch(`${API_URL}/livros`);


    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP: ${resposta.status}`
      );
    }


    livrosData =
      await resposta.json();


    aplicarFiltros();

  } catch (erro) {

    console.error(
      'Erro ao buscar livros:',
      erro
    );
  }
}


// =========================================================
// 9. RENDERIZAR LIVROS
// =========================================================

function renderBooks(livros) {

  const container =
    document.getElementById('bookList');


  if (!container) {
    return;
  }


  container.innerHTML = '';


  if (!livros || livros.length === 0) {

    container.innerHTML = `
      <p style="color: #94a3b8; padding: 1rem;">
        Nenhum livro encontrado.
      </p>
    `;

    return;
  }


  livros.forEach(livro => {

    const autor =
      autoresData.find(
        a => String(a.id) === String(livro.autor_id)
      )?.nome ||
      `Autor #${livro.autor_id}`;


    const categoria =
      categoriasData.find(
        c => String(c.id) === String(livro.categoria_id)
      )?.nome ||
      `Cat #${livro.categoria_id}`;


    const capaHTML = livro.imagem

      ? `
        <img
          src="${livro.imagem}"
          alt="Capa"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
            border-radius:4px;
          "
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >

        <i
          class="fa-solid fa-book"
          style="display:none;"
        ></i>
      `

      : `
        <i class="fa-solid fa-book"></i>
      `;


    container.innerHTML += `

      <div
        class="book-card"
        onclick="showDetailPorId(${livro.id})"
      >

        <div class="book-cover">
          ${capaHTML}
        </div>


        <div class="book-info">

          <h3>
            ${livro.titulo}
          </h3>

          <p>
            ${autor}
          </p>

          <span class="badge">
            ${categoria}
          </span>

        </div>


        <div
          class="book-actions"
          onclick="event.stopPropagation()"
        >

          <button
            class="action-btn edit-btn"
            title="Editar"
            onclick="editarLivroPorId(${livro.id})"
          >
            <i class="fa-solid fa-pen"></i>
          </button>


          <button
            class="action-btn delete-btn"
            title="Excluir"
            onclick="deletarLivro(${livro.id})"
          >
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>

      </div>
    `;
  });
}


// =========================================================
// 10. EDITAR LIVRO POR ID
// =========================================================

function editarLivroPorId(id) {

  const livro =
    livrosData.find(
      l => String(l.id) === String(id)
    );


  if (!livro) {

    console.error(
      'Livro não encontrado:',
      id
    );

    return;
  }


  abrirModal(livro);
}


// =========================================================
// 11. PAINEL DE DETALHES
// =========================================================

function showDetailPorId(id) {

  const livro =
    livrosData.find(
      l => String(l.id) === String(id)
    );


  if (!livro) {
    return;
  }


  const detailPanel =
    document.getElementById('detailPanel');

  const detailContent =
    document.getElementById('detailContent');


  if (!detailPanel || !detailContent) {
    return;
  }


  const autorNome =
    autoresData.find(
      a => String(a.id) === String(livro.autor_id)
    )?.nome ||
    `Autor #${livro.autor_id}`;


  const categoriaNome =
    categoriasData.find(
      c => String(c.id) === String(livro.categoria_id)
    )?.nome ||
    `Categoria #${livro.categoria_id}`;


  const capaDetalhes = livro.imagem

    ? `
      <img
        src="${livro.imagem}"
        alt="Capa"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:8px;
        "
        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
      >

      <i
        class="fa-solid fa-book"
        style="display:none;"
      ></i>
    `

    : `
      <i class="fa-solid fa-book"></i>
    `;


  detailContent.innerHTML = `

    <div class="detail-top">

      <div class="detail-cover">
        ${capaDetalhes}
      </div>


      <div class="detail-info">

        <h2>
          ${livro.titulo}
        </h2>

        <p class="author">
          ${autorNome}
        </p>

        <span class="badge">
          ${categoriaNome}
        </span>

      </div>

    </div>


    <div
      class="detail-meta"
      style="margin-top: 1.5rem;"
    >

      <div class="meta-item">
        <i class="fa-solid fa-barcode"></i>
        <strong>ISBN:</strong>
        ${livro.isbn || 'Não informado'}
      </div>


      <div class="meta-item">
        <i class="fa-solid fa-calendar"></i>
        <strong>Ano de publicação:</strong>
        ${livro.ano_publicacao || 'N/A'}
      </div>


      <div class="meta-item">
        <i class="fa-solid fa-building"></i>
        <strong>Editora:</strong>
        ${livro.editora || 'N/A'}
      </div>

    </div>


    <div
      class="detail-section"
      style="margin-top: 1.5rem;"
    >

      <h4>
        <i class="fa-solid fa-file-lines"></i>
        Sinopse
      </h4>

      <p
        style="
          color: #94a3b8;
          font-size: 0.9rem;
          line-height: 1.5;
        "
      >
        ${livro.sinopse || 'Sem sinopse cadastrada.'}
      </p>

    </div>
  `;


  detailPanel.classList.add('open');
}


// =========================================================
// 12. FECHAR DETALHES
// =========================================================

function closeDetail() {

  const detailPanel =
    document.getElementById('detailPanel');


  if (detailPanel) {
    detailPanel.classList.remove('open');
  }


  document
    .querySelectorAll('.book-card')
    .forEach(card => {
      card.classList.remove('active');
    });
}


// =========================================================
// 13. SALVAR LIVRO
// =========================================================

async function salvarLivro(event) {

  // Impede o comportamento padrão do formulário.

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }


  // -------------------------------------------------------
  // CAPTURA DOS CAMPOS
  // -------------------------------------------------------

  const titulo =
    document.getElementById('titulo')?.value.trim();


  const autorId =
    document.getElementById('autor_id')?.value;


  const categoriaId =
    document.getElementById('categoria_id')?.value;


  const isbn =
    document.getElementById('isbn')?.value.trim();


  const ano =
    document.getElementById('ano_publicacao')?.value;


  const editora =
    document.getElementById('editora')?.value.trim();


  const sinopse =
    document.getElementById('sinopse')?.value.trim();


  const inputImagem =
    document.getElementById('imagem');


  const imagemUrl =
    inputImagem?.value.trim() || '';


  // -------------------------------------------------------
  // VALIDAÇÃO
  // -------------------------------------------------------

  if (!titulo) {

    alert('Informe o título do livro.');

    irParaEtapa(1);

    return;
  }


  if (!autorId) {

    alert('Selecione um autor.');

    irParaEtapa(1);

    return;
  }


  if (!categoriaId) {

    alert('Selecione uma categoria.');

    irParaEtapa(1);

    return;
  }


  // -------------------------------------------------------
  // DEFINE QUAL IMAGEM SERÁ SALVA
  // -------------------------------------------------------

  let imagemFinal = null;


  // Se selecionou imagem do computador,
  // ela tem prioridade.

  if (imagemBase64Temp) {

    imagemFinal =
      imagemBase64Temp;

  }

  // Caso contrário, utiliza a URL.

  else if (imagemUrl) {

    imagemFinal =
      imagemUrl;

  }

  // Se estiver editando e não escolheu
  // uma imagem nova, mantém a existente.

  else if (livroEmEdicaoId) {

    const livroAtual =
      livrosData.find(
        l => String(l.id) === String(livroEmEdicaoId)
      );


    if (livroAtual) {

      imagemFinal =
        livroAtual.imagem || null;
    }
  }


  // -------------------------------------------------------
  // MONTA OBJETO
  // -------------------------------------------------------

  const dadosLivro = {

    titulo: titulo,

    autor_id: Number(autorId),

    categoria_id: Number(categoriaId),

    isbn: isbn || null,

    ano_publicacao:
      ano ? Number(ano) : null,

    editora:
      editora || null,

    sinopse:
      sinopse || null,

    imagem:
      imagemFinal
  };


  console.log(
    'Dados que serão enviados para a API:',
    dadosLivro
  );


  // -------------------------------------------------------
  // DEFINE POST OU PUT
  // -------------------------------------------------------

  const estaEditando =
    livroEmEdicaoId !== null;


  const url =
    estaEditando
      ? `${API_URL}/livros/${livroEmEdicaoId}`
      : `${API_URL}/livros`;


  const metodo =
    estaEditando
      ? 'PUT'
      : 'POST';


  // -------------------------------------------------------
  // DESABILITA BOTÃO DURANTE SALVAMENTO
  // -------------------------------------------------------

  const botoesSalvar =
    document.querySelectorAll(
      '#modalLivro .btn-primary'
    );


  botoesSalvar.forEach(botao => {
    botao.disabled = true;
  });


  try {

    const resposta =
      await fetch(url, {

        method: metodo,

        headers: {
          'Content-Type': 'application/json'
        },

        body:
          JSON.stringify(dadosLivro)
      });


    // -----------------------------------------------------
    // TENTA LER RESPOSTA
    // -----------------------------------------------------

    let resultado = null;

    const textoResposta =
      await resposta.text();


    if (textoResposta) {

      try {

        resultado =
          JSON.parse(textoResposta);

      } catch (erroJSON) {

        console.warn(
          'Resposta não é JSON:',
          textoResposta
        );
      }
    }


    // -----------------------------------------------------
    // SUCESSO
    // -----------------------------------------------------

    if (resposta.ok) {

      alert(
        estaEditando
          ? 'Livro atualizado com sucesso!'
          : 'Livro cadastrado com sucesso!'
      );


      fecharModal();


      await carregarLivros();


      closeDetail();


      return;
    }


    // -----------------------------------------------------
    // ERRO HTTP
    // -----------------------------------------------------

    console.error(
      'Erro retornado pela API:',
      resposta.status,
      resultado
    );


    let mensagemErro =
      'Falha ao processar requisição.';


    if (resultado?.mensagem) {
      mensagemErro =
        resultado.mensagem;
    }

    else if (resultado?.message) {
      mensagemErro =
        resultado.message;
    }

    else if (resposta.status === 413) {
      mensagemErro =
        'A imagem é muito grande para ser enviada ao servidor.';
    }

    else if (resposta.status === 400) {
      mensagemErro =
        'Os dados enviados são inválidos.';
    }

    else if (resposta.status === 404) {
      mensagemErro =
        'A rota da API não foi encontrada.';
    }

    else if (resposta.status >= 500) {
      mensagemErro =
        'Erro interno no servidor.';
    }


    alert(
      `Erro ${resposta.status}: ${mensagemErro}`
    );


  } catch (erro) {

    console.error(
      'Erro ao salvar livro:',
      erro
    );


    alert(
      'Não foi possível conectar ao servidor.\n\n' +
      'Verifique se o server.js está rodando em ' +
      'http://localhost:3000'
    );

  } finally {

    botoesSalvar.forEach(botao => {
      botao.disabled = false;
    });
  }
}


// =========================================================
// 14. DELETAR LIVRO
// =========================================================

async function deletarLivro(id) {

  if (
    !confirm(
      'Tem certeza de que deseja remover este livro?'
    )
  ) {
    return;
  }


  try {

    const resposta =
      await fetch(
        `${API_URL}/livros/${id}`,
        {
          method: 'DELETE'
        }
      );


    if (resposta.ok) {

      closeDetail();

      await carregarLivros();

    } else {

      let mensagem =
        'Erro ao excluir livro.';


      try {

        const erro =
          await resposta.json();

        mensagem =
          erro.mensagem ||
          erro.message ||
          mensagem;

      } catch (_) {}


      alert(
        `Erro ${resposta.status}: ${mensagem}`
      );
    }


  } catch (erro) {

    console.error(
      'Erro ao excluir:',
      erro
    );


    alert(
      'Não foi possível conectar ao servidor.'
    );
  }
}


// =========================================================
// 15. GERENCIADOR DE TEMAS
// =========================================================

function aplicarTema(tema) {

  document.documentElement
    .setAttribute(
      'data-theme',
      tema
    );


  localStorage.setItem(
    'tema_biblioteca',
    tema
  );


  const btnIcon =
    document.querySelector(
      '#themeToggleBtn i'
    );


  const btnText =
    document.getElementById(
      'themeLabel'
    );


  if (tema === 'light') {

    if (btnIcon) {
      btnIcon.className =
        'fa-solid fa-sun';
    }


    if (btnText) {
      btnText.textContent =
        'Claro';
    }

  } else {

    if (btnIcon) {
      btnIcon.className =
        'fa-solid fa-moon';
    }


    if (btnText) {
      btnText.textContent =
        'Escuro';
    }
  }
}


function inicializarTema() {

  const temaSalvo =
    localStorage.getItem(
      'tema_biblioteca'
    ) || 'dark';


  aplicarTema(temaSalvo);


  const themeToggleBtn =
    document.getElementById(
      'themeToggleBtn'
    );


  if (themeToggleBtn) {

    themeToggleBtn.addEventListener(
      'click',
      () => {

        const temaAtual =
          document.documentElement
            .getAttribute('data-theme') ||
          'dark';


        const novoTema =
          temaAtual === 'dark'
            ? 'light'
            : 'dark';


        aplicarTema(novoTema);
      }
    );
  }
}


// =========================================================
// 16. LIMPAR FORMULÁRIO
// =========================================================

function limparFormulario() {

  const form =
    document.getElementById('formLivro');


  if (form) {
    form.reset();
  }


  const imagemFile =
    document.getElementById('imagemFile');


  if (imagemFile) {
    imagemFile.value = '';
  }


  imagemBase64Temp = '';

  atualizarPreviewCapa('');
}


// =========================================================
// 17. INICIALIZAÇÃO
// =========================================================

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    console.log(
      'Biblioteca Online iniciada.'
    );


    inicializarTema();


    await carregarOpcoesSelect();


    await carregarLivros();


    inicializarEventosFiltro();
  }
);


// =========================================================
// 18. TECLA ESC
// =========================================================

document.addEventListener(
  'keydown',
  event => {

    if (event.key === 'Escape') {
      closeDetail();
    }
  }
);
