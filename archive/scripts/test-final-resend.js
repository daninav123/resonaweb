const { Resend } = require('resend');

async function testFinal() {
  const resend = new Resend('re_ChEje4iG_NUbFStgA9VAjEx7JUL15nxH5');

  console.log('🧪 Prueba final con dominio verificado...\n');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'ReSona Events <noreply@resonaevents.com>',
      to: ['danielnavarrocampos@icloud.com'],
      subject: '🎉 Sistema de Contacto Configurado - ReSona Events',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5ebbff; margin-bottom: 10px;">🎉 ¡Sistema de Email Configurado!</h1>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">✅ Configuración Completada</h2>
            <p>El sistema de contacto de ReSona Events está funcionando correctamente con:</p>
            <ul style="line-height: 1.8;">
              <li><strong>Proveedor:</strong> Resend</li>
              <li><strong>Dominio:</strong> resonaevents.com (✅ verificado)</li>
              <li><strong>Email de envío:</strong> noreply@resonaevents.com</li>
              <li><strong>Email de contacto:</strong> danielnavarrocampos@icloud.com</li>
            </ul>
          </div>

          <div style="background: #fff; border-left: 4px solid #5ebbff; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">📝 Siguiente Paso</h3>
            <p>Ve a <strong>http://localhost:3000/contacto</strong> y prueba el formulario de contacto.</p>
            <p>Cuando alguien envíe un mensaje:</p>
            <ol style="line-height: 1.8;">
              <li>Recibirás una notificación en este email</li>
              <li>El mensaje se guardará en la base de datos</li>
              <li>El cliente recibirá una confirmación automática</li>
            </ol>
          </div>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">🎯 Límites del Plan Gratuito</h3>
            <ul style="line-height: 1.8; margin-bottom: 0;">
              <li>100 emails/día</li>
              <li>3,000 emails/mes</li>
              <li>Más que suficiente para empezar</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center;">
            Email de prueba enviado el ${new Date().toLocaleString('es-ES')}<br>
            ReSona Events - Sistema de Alquiler de Equipos
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 ID del mensaje:', data.id);
    console.log('\n📍 Revisa tu email de iCloud: danielnavarrocampos@icloud.com');
    console.log('\n🎯 SIGUIENTE PASO:');
    console.log('   1. Abre http://localhost:3000/contacto');
    console.log('   2. Rellena el formulario');
    console.log('   3. Verifica que recibes el email');
    console.log('\n✅ TODO LISTO PARA USAR!\n');
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testFinal();
