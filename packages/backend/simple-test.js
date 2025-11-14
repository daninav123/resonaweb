require('dotenv').config();

async function test() {
  console.log('=== CONFIG ===');
  console.log('API Key:', process.env.OPENAI_API_KEY ? 'OK (len: ' + process.env.OPENAI_API_KEY.length + ')' : 'MISSING');
  console.log('Project:', process.env.OPENAI_PROJECT_ID || 'MISSING');
  
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      project: process.env.OPENAI_PROJECT_ID,
    });

    console.log('\n=== TESTING ===');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hola' }],
      max_tokens: 5,
    });

    console.log('SUCCESS:', response.choices[0].message.content);
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

test();
