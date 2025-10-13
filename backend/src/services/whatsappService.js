const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

class WhatsAppService {
    async enviarMensaje(telefono, mensaje) {
        try {
            const message = await client.messages.create({
                from: `whatsapp:${twilioPhone}`,
                to: `whatsapp:+51${telefono}`,
                body: mensaje
            });
            
            console.log(`Mensaje enviado: ${message.sid}`);
            return { success: true, messageId: message.sid };
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            return { success: false, error: error.message };
        }
    }

    async enviarRecordatorioPago(cliente) {
        const mensaje = `Hola ${cliente.nombre},\n\nRecordatorio: Tienes un pago pendiente de S/ ${cliente.precio_mensual}.\n\nPor favor, realiza tu pago a la brevedad.\n\nGracias.\n*TV Jhaire*`;
        return await this.enviarMensaje(cliente.telefono, mensaje);
    }

    async enviarRecordatorioMasivo(clientes) {
        const resultados = [];
        
        for (const cliente of clientes) {
            const resultado = await this.enviarRecordatorioPago(cliente);
            resultados.push({
                cliente: `${cliente.nombre} ${cliente.apellido}`,
                ...resultado
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return resultados;
    }
}

module.exports = new WhatsAppService();