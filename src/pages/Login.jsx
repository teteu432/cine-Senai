// =====================================================================
// IMPORTAÇÕES
// =====================================================================

// React é a biblioteca principal utilizada para criar interfaces.
// useState é um Hook que permite armazenar informações que podem mudar
// durante a execução do componente.
import React, { useState } from 'react';

// Hook do React Router responsável por navegar entre páginas.
// Exemplo: após fazer login, podemos enviar o usuário para a Home.
import { useNavigate } from 'react-router-dom';

// Hook personalizado criado pela aplicação.
// Ele fornece funções relacionadas à autenticação.
import { useAuth } from '../context/AuthContext';

// Hook personalizado responsável por exibir mensagens na tela.
import { useToast } from '../context/ToastContext';

// Arquivo de estilos da página de Login.
import './Login.css';


// =====================================================================
// COMPONENTE LOGIN
// =====================================================================

// Todo componente React é uma função que retorna HTML (JSX).
export const Login = () => {

  // ===================================================================
  // ESTADOS DO COMPONENTE
  // ===================================================================

  /*
    isRegister controla qual formulário será exibido.

    false = tela de Login
    true  = tela de Cadastro

    O valor inicial é false, então a tela começa mostrando Login.
  */
  const [isRegister, setIsRegister] = useState(false);

  /*
    Armazena o nome digitado pelo usuário.

    nome      -> valor atual
    setNome() -> função utilizada para atualizar o valor
  */
  const [nome, setNome] = useState('');

  /*
    Armazena o e-mail digitado.
  */
  const [email, setEmail] = useState('');

  /*
    Armazena a senha digitada.
  */
  const [senha, setSenha] = useState('');

  /*
    Controla o carregamento.

    false = formulário disponível
    true  = aguardando resposta do servidor
  */
  const [loading, setLoading] = useState(false);



  // ===================================================================
  // HOOKS PERSONALIZADOS
  // ===================================================================

  /*
    Obtém as funções login() e register()
    que estão disponíveis no contexto de autenticação.

    Context é uma forma de compartilhar informações
    entre vários componentes sem precisar passar props.
  */
  const { login, register } = useAuth();

  /*
    Obtém a função responsável por exibir mensagens
    de sucesso ou erro para o usuário.
  */
  const { showToast } = useToast();

  /*
    Hook que permite navegar para outra página.
  */
  const navigate = useNavigate();



  // ===================================================================
  // ENVIO DO FORMULÁRIO
  // ===================================================================

  /*
    Esta função é executada quando o usuário
    clica no botão Entrar ou Cadastrar.
  */
  const handleSubmit = async (e) => {

    /*
      Impede o comportamento padrão do formulário.

      Sem isso, a página seria recarregada,
      perdendo todos os estados do React.
    */
    e.preventDefault();


    // ===============================================================
    // VALIDAÇÃO DOS CAMPOS
    // ===============================================================

    /*
      Verifica se os campos obrigatórios foram preenchidos.

      !email significa:
      "email está vazio?"

      !senha significa:
      "senha está vazia?"

      (isRegister && !nome)
      significa:
      "se estiver cadastrando, o nome também é obrigatório"
    */
    if (!email || !senha || (isRegister && !nome)) {

      showToast(
        'Por favor, preencha todos os campos.',
        'error'
      );

      return; // interrompe a execução da função
    }


    // ===============================================================
    // INÍCIO DO PROCESSAMENTO
    // ===============================================================

    /*
      Ativa o carregamento.

      Isso permite:
      - desabilitar os campos
      - mudar o texto do botão
      - evitar múltiplos cliques
    */
    setLoading(true);


    try {

      // =============================================================
      // CADASTRO
      // =============================================================

      if (isRegister) {

        /*
          Chama a função de cadastro.

          await significa:
          "espere a operação terminar antes
          de continuar o código".
        */
        await register(nome, email, senha);

        showToast(
          'Cadastro realizado com sucesso! Bem-vindo.',
          'success'
        );

      }

      // =============================================================
      // LOGIN
      // =============================================================

      else {

        /*
          Chama a função de login.
        */
        await login(email, senha);

        showToast(
          'Login realizado com sucesso!',
          'success'
        );
      }

      // =============================================================
      // REDIRECIONAMENTO
      // =============================================================

      /*
        Após o sucesso, o usuário é enviado
        para a página inicial.
      */
      navigate('/');

    }

    // ===============================================================
    // TRATAMENTO DE ERROS
    // ===============================================================

    catch (error) {

      /*
        Caso ocorra qualquer erro durante o login
        ou cadastro, exibe uma mensagem.
      */
      showToast(
        error.message ||
        'Ocorreu um erro ao processar sua solicitação.',
        'error'
      );
    }

    // ===============================================================
    // FINALIZAÇÃO
    // ===============================================================

    finally {

      /*
        O bloco finally sempre executa,
        independentemente de sucesso ou erro.

        Aqui desligamos o carregamento.
      */
      setLoading(false);
    }
  };


  // ===================================================================
  // JSX (INTERFACE)
  // ===================================================================

  // =====================================================================
// RETORNO DO COMPONENTE
// =====================================================================

/*
  Todo componente React precisa retornar algo.

  O return contém o JSX.

  JSX é uma sintaxe que mistura JavaScript com HTML.

  Exemplo:

  <h1>Olá Mundo</h1>

  Parece HTML, mas na verdade é JSX.
*/
return (

  /*
    Div principal da página.

    Tudo que aparecer na tela ficará
    dentro deste container.

    className é equivalente ao atributo
    class do HTML.

    No React usamos className porque
    class é uma palavra reservada do JavaScript.
  */
  <div className="auth-container">

    {/* Card central da tela */}
    <div className="auth-card glass">

      {/* ==========================================================
         CABEÇALHO
      ========================================================== */}

      <div className="auth-header">

        {/*
          Logo do sistema.

          Tudo que estiver dentro da tag div
          será exibido na tela.
        */}
        <div className="auth-logo">

          {/* Texto comum */}
          Cine

          {/* Span utilizado para estilizar apenas a palavra Senai */}
          <span>Senai</span>

        </div>


        {/* ======================================================
           SUBTÍTULO
        ====================================================== */}

        <p className="login-subtitle">

          {/*
            As chaves {} permitem executar
            JavaScript dentro do JSX.

            Aqui estamos utilizando
            um operador ternário.

            Sintaxe:

            condição
              ? valor se verdadeiro
              : valor se falso
          */}

          {
            isRegister

            ? 'Crie sua conta para reservar ingressos'

            : 'Acesse sua conta para ver suas sessões'
          }

        </p>

      </div>


      {/* ==========================================================
         FORMULÁRIO
      ========================================================== */}

      {/*
        A tag form representa um formulário HTML.

        Quando o botão submit for clicado,
        a função handleSubmit será executada.
      */}
      <form onSubmit={handleSubmit}>


        {/* ======================================================
           CAMPO NOME
        ====================================================== */}

        {/*
          Renderização condicional.

          O operador && significa:

          "Se isRegister for verdadeiro,
          exiba o conteúdo."

          Se isRegister for false,
          nada será exibido.
        */}

        {isRegister && (

          <div className="form-group">

            {/* Texto do campo */}
            <label htmlFor="nome">
              Nome Completo
            </label>

            <input

              /*
                id utilizado para conectar
                o label ao campo.
              */
              id="nome"

              /*
                Tipo do campo.

                text = aceita texto.
              */
              type="text"

              className="form-control"

              /*
                Texto exibido antes do usuário digitar.
              */
              placeholder="Ex: João Silva"

              /*
                Valor atual armazenado
                no estado nome.
              */
              value={nome}

              /*
                Sempre que o usuário digita,
                o evento onChange é disparado.

                e = evento

                e.target = elemento HTML

                e.target.value = valor digitado
              */
              onChange={(e) =>
                setNome(e.target.value)
              }

              /*
                Quando loading for true
                o campo ficará bloqueado.
              */
              disabled={loading}
            />

          </div>

        )}


        {/* ======================================================
           CAMPO EMAIL
        ====================================================== */}

        <div className="form-group">

          <label htmlFor="email">
            E-mail
          </label>

          <input
            id="email"

            /*
              Tipo email.

              O navegador já faz algumas
              validações básicas.
            */
            type="email"

            className="form-control"

            placeholder="seuemail@exemplo.com"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            disabled={loading}
          />

        </div>


        {/* ======================================================
           CAMPO SENHA
        ====================================================== */}

        <div className="form-group">

          <label htmlFor="senha">
            Senha
          </label>

          <input
            id="senha"

            /*
              password oculta os caracteres
              digitados pelo usuário.
            */
            type="password"

            className="form-control"

            placeholder="••••••••"

            value={senha}

            onChange={(e) =>
              setSenha(e.target.value)
            }

            disabled={loading}
          />

        </div>


        {/* ======================================================
           BOTÃO DE ENVIO
        ====================================================== */}

        <button

          /*
            submit faz com que o formulário
            execute o onSubmit.
          */
          type="submit"

          className="btn btn-primary login-submit-btn"

          disabled={loading}
        >

          {/*
            Ternário aninhado.

            Primeiro verifica loading.

            Se estiver carregando:
              Carregando...

            Caso contrário:
              verifica isRegister

            true:
              Cadastrar

            false:
              Entrar
          */}

          {
            loading

              ? 'Carregando...'

              : isRegister

                ? 'Cadastrar'

                : 'Entrar'
          }

        </button>

      </form>


      {/* ==========================================================
         TROCAR ENTRE LOGIN E CADASTRO
      ========================================================== */}

      <div className="auth-toggle">

        {/*
          Outro operador ternário.

          Dependendo do valor de isRegister
          exibimos um conteúdo diferente.
        */}

        {
          isRegister

          ? (

            <>
              Já tem uma conta?

              {/*
                Span clicável.

                Quando clicar:
                setIsRegister(false)

                Isso altera o estado
                e faz o React renderizar
                novamente a interface.
              */}
              <span
                onClick={() =>
                  setIsRegister(false)
                }
              >
                Entrar
              </span>

            </>

          )

          : (

            <>
              Não tem uma conta?

              <span
                onClick={() =>
                  setIsRegister(true)
                }
              >
                Cadastrar-se
              </span>

            </>

          )
        }

      </div>

    </div>

  </div>
);
};

// Exportação padrão do componente
export default Login;