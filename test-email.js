require('dotenv').config({ path: './packages/backend/.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Probando configuración de email...\n');
  
  console.log('📧 Configuración:');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST);
  console.log('  SMTP_PORT:', process.env.SMTP_PORT);
  console.log('  SMTP_SECURE:', process.env.SMTP_SECURE);
  console.log('  SMTP_USER:', process.env.SMTP_USER);
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('  EMAIL_CONTACT:', process.env.EMAIL_CONTACT);
  console.log('');

  try {
    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔌 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con Gmail\n');

    // Enviar email de prueba
    console.log('📤 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@resona.com',
      to: process.env.EMAIL_CONTACT,
      subject: '✅ Prueba de Email - ReSona Events',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5ebbff;">✅ Email de Prueba</h2>
          <p>Este es un email de prueba para verificar que la configuración de Gmail funciona correctamente.</p>
          <p><strong>Hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p style="color: #888; font-size: 12px;">Este email fue enviado desde el script de prueba.</p>
        </div>
      `
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 ID del mensaje:', info.messageId);
    console.log('\n✅ TODO FUNCIONA CORRECTAMENTE');
    console.log('📍 Revisa tu bandeja de entrada en:', process.env.EMAIL_CONTACT);
    console.log('💡 Si no lo ves, revisa la carpeta de SPAM\n');

  } catch (error) {
    console.error('❌ Error al enviar email:');
    console.error('Tipo:', error.code);
    console.error('Mensaje:', error.message);
    console.error('\n⚠️ POSIBLES SOLUCIONES:');
    
    if (error.code === 'EAUTH') {
      console.error('1. La contraseña de App Password es incorrecta');
      console.error('2. Verifica que copiaste correctamente: ofpf nyzz dekq kenn');
      console.error('3. Asegúrate de que 2FA está habilitado en tu cuenta de Gmail');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('1. No hay conexión a internet');
      console.error('2. Gmail está bloqueado por firewall');
    } else {
      console.error('Revisa la configuración del .env');
    }
  }
}

testEmail();
