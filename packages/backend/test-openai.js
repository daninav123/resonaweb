require('dotenv').config();

console.log('\n=== TEST OPENAI API ===\n');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 
  `Configurada (${process.env.OPENAI_API_KEY.substring(0, 20)}...)` : 
  '❌ NO CONFIGURADA');
console.log('Longitud:', process.env.OPENAI_API_KEY?.length || 0);
console.log('OPENAI_PROJECT_ID:', process.env.OPENAI_PROJECT_ID || '❌ NO CONFIGURADO');
console.log('OPENAI_ORG_ID:', process.env.OPENAI_ORG_ID || '(Opcional - no configurado)');
console.log('\n');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY no está configurada en .env');
  process.exit(1);
}

async function testOpenAI() {
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      project: process.env.OPENAI_PROJECT_ID,
      organization: process.env.OPENAI_ORG_ID,
    });

    console.log('Probando conexión con OpenAI...\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Di "Hola" en una palabra',
        },
      ],
      max_tokens: 10,
    });

    console.log('✅ OpenAI funciona correctamente!');
    console.log('Respuesta:', completion.choices[0].message.content);
    console.log('\n');
    
  } catch (error) {
    console.error('❌ ERROR al conectar con OpenAI:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Status:', error.status);
    console.error('\nError completo:', error);
    process.exit(1);
  }
}

testOpenAI();
