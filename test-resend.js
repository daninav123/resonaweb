require('dotenv').config({ path: './packages/backend/.env' });
const { Resend } = require('resend');

async function testResend() {
  console.log('🧪 Probando configuración de Resend...\n');
  
  console.log('📧 Configuración:');
  console.log('  EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ No configurada');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('  EMAIL_CONTACT:', process.env.EMAIL_CONTACT);
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY no está configurada en .env');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('📤 Enviando email de prueba con Resend...');
    
    const { data, error } = await resend.emails.send({
      from: 'ReSona Events <noreply@resonaevents.com>',
      to: [process.env.EMAIL_CONTACT],
      subject: '✅ Prueba de Email - ReSona Events (Resend)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5ebbff;">✅ Email de Prueba con Resend</h2>
          <p>Este es un email de prueba para verificar que la configuración de Resend funciona correctamente.</p>
          <p><strong>Hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ Ventajas de Resend:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>100 emails/día gratis</li>
              <li>Mejor deliverability</li>
              <li>Funciona vía HTTPS (no bloqueado por firewalls)</li>
              <li>Dashboard profesional</li>
            </ul>
          </div>
          <p style="color: #888; font-size: 12px;">Este email fue enviado desde el script de prueba.</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error al enviar email:');
      console.error('Código:', error.statusCode);
      console.error('Mensaje:', error.message);
      
      if (error.message.includes('API key')) {
        console.error('\n⚠️ La API key parece ser inválida');
        console.error('Verifica que copiaste correctamente: re_ChEje4iG_NUbFStgA9VAjEx7JUL15nxH5');
      }
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 ID del mensaje:', data.id);
    console.log('\n✅ TODO FUNCIONA CORRECTAMENTE CON RESEND');
    console.log('📍 Revisa tu bandeja de entrada en:', process.env.EMAIL_CONTACT);
    console.log('💡 Si no lo ves en unos segundos, revisa la carpeta de SPAM');
    console.log('\n📊 Dashboard de Resend: https://resend.com/emails\n');

  } catch (error) {
    console.error('❌ Error inesperado:');
    console.error(error.message);
    console.error('\n⚠️ Verifica que el paquete "resend" está instalado:');
    console.error('npm install resend');
  }
}

testResend();
