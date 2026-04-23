import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { nome, email, telefone, cpf, tipo, observacoes } = body;

    if (!nome || !email || !telefone || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Campos obrigatórios ausentes' }),
      };
    }

    // TODO: Integrar com CRM / DocuSign / Email
    // Exemplo: await sendToDocuSign({ nome, email, tipo });
    // Exemplo: await sendEmail({ to: email, template: 'cotacao-recebida' });

    console.log('Nova cotação recebida:', { nome, email, tipo, timestamp: new Date().toISOString() });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Cotação recebida com sucesso',
        protocolo: `FNT-${Date.now()}`,
      }),
    };
  } catch (err) {
    console.error('Erro ao processar cotação:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno' }),
    };
  }
};
