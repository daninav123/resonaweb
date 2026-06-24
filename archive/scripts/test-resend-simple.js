const { Resend } = require('resend');

async function test() {
  const resend = new Resend('re_ChEje4iG_NUbFStgA9VAjEx7JUL15nxH5');

  console.log('📤 Enviando email...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['danielnavarrocampos@icloud.com'],
      subject: '✅ Test ReSona Events',
      html: '<h1>Funciona!</h1><p>El email de contacto está configurado correctamente.</p>'
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email enviado!');
    console.log('📧 ID:', data.id);
    console.log('\n📍 Revisa tu Gmail: danielnavarrocampos1933@gmail.com');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
