// whatsappUtils.mjs - Utilidades de WhatsApp con emojis

export const formatearTelefono = (telefono) => {
    if (!telefono) return null;
    let numero = telefono.replace(/\D/g, '');
    if (numero.startsWith('51')) return numero;
    if (numero.startsWith('9') && numero.length === 9) return '51' + numero;
    if (numero.length === 9) return '51' + numero;
    return numero;
};

const e = {
    wave: '👋',
    card: '💳',
    phone: '📱',
    bank: '🏦',
    doc: '📄',
    check: '✅',
    pray: '🙏',
    warn: '⚠️',
    tel: '📞',
    party: '🎉',
    tv: '📺',
    money: '💰',
    cal: '📅',
    star: '🌟',
    tool: '🔧',
    sat: '📡'
};

export const obtenerMediosPago = () => {
    return `${e.card} *MEDIOS DE PAGO:*

${e.phone} *YAPE/PLIN*
991-569-419 (Francisca)
995-151-453 (Damian)

${e.bank} *TRANSFERENCIAS*
BCP: 570-04329682069 (Francisca)
BCP: 570-71655133-0-75 (Damian)
Interbank: 772-300-6808874
Caja Trujillo: 792-321005070
BN: 048-01086832

${e.doc} Envía tu voucher por WhatsApp
${e.check} Confirmación inmediata`;
};

export const mensajesWhatsApp = {
    recordatorioPago: (cliente, monto) => 
        `Hola ${cliente.nombre} ${e.wave}

Recordatorio amigable: tu pago mensual de *S/ ${parseFloat(monto).toFixed(2)}* vence pronto.

${obtenerMediosPago()}

Si ya pagaste, ignora este mensaje.

Gracias por tu preferencia ${e.pray}
*Telecomunicaciones Jhair EIRL*`,

    recordatorioDeuda: (cliente, mesesDeuda, totalDeuda) =>
        `${cliente.nombre}, recordatorio importante ${e.warn}

${mesesDeuda > 0 
    ? `Tienes *${mesesDeuda} ${mesesDeuda === 1 ? 'mes' : 'meses'}* pendiente${mesesDeuda === 1 ? '' : 's'} por *S/ ${parseFloat(totalDeuda).toFixed(2)}*`
    : `Tu pago de *S/ ${parseFloat(cliente.precio_mensual).toFixed(2)}* vence HOY`
}

Para evitar la suspensión, realiza tu pago antes de las 6:00 PM.

${obtenerMediosPago()}

${e.tel} Consultas: 951-451-453

*Telecomunicaciones Jhair EIRL*`,

    confirmacionPago: (cliente, monto, recibo) =>
        `Hola ${cliente.nombre} ${e.wave}

${e.check} *PAGO CONFIRMADO*

Monto: *S/ ${parseFloat(monto).toFixed(2)}*
Recibo: ${recibo}
Fecha: ${new Date().toLocaleDateString('es-PE')}

Gracias por tu puntualidad ${e.party}

*Telecomunicaciones Jhair EIRL*`,

    bienvenida: (cliente) => {
        const mes = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
        return `Hola ${cliente.nombre} ${e.wave}

Bienvenido a ${mes}!

${e.tv} Plan: *${cliente.tipo_servicio || 'Estándar'}*
${e.money} Pago mensual: *S/ ${parseFloat(cliente.precio_mensual).toFixed(2)}*
${e.cal} Vencimiento: 30 de cada mes

${obtenerMediosPago()}

Que tengas un excelente mes! ${e.star}
*Telecomunicaciones Jhair EIRL*`;
    },

    nuevoCliente: (cliente) =>
        `Bienvenido a Telecomunicaciones Jhair! ${e.party}

Hola ${cliente.nombre}, gracias por confiar en nosotros.

${e.check} Tu servicio está activo
${e.tv} Plan: *${cliente.tipo_servicio || 'Estándar'}*
${e.money} Pago mensual: *S/ ${parseFloat(cliente.precio_mensual).toFixed(2)}*
${e.cal} Vence cada 30 del mes

${obtenerMediosPago()}

${e.tel} Soporte 24/7: 951-451-453
${e.tool} Asistencia técnica inmediata

Disfruta tu servicio! ${e.sat}
*Telecomunicaciones Jhair EIRL*`,

    reactivacion: (cliente) =>
        `Hola ${cliente.nombre} ${e.wave}

Excelente noticia! ${e.party}

Tu servicio ha sido *REACTIVADO*

Ya puedes disfrutar de:
${e.tv} Cable TV
${e.sat} Internet

${obtenerMediosPago()}

Mantén tus pagos al día para evitar suspensiones.

Gracias por tu preferencia ${e.pray}
*Telecomunicaciones Jhair EIRL*`,

    suspension: (cliente) =>
        `Hola ${cliente.nombre}

Lamentamos informarte que tu servicio ha sido *SUSPENDIDO* por falta de pago.

Para reactivar:
1️⃣ Regulariza tu deuda
2️⃣ Contáctanos: 951-451-453
3️⃣ Reactivación inmediata

${obtenerMediosPago()}

Estamos para ayudarte ${e.tel}
*Telecomunicaciones Jhair EIRL*`,

    personalizado: (cliente, mensaje) =>
        `Hola ${cliente.nombre} ${e.wave}

${mensaje}

${obtenerMediosPago()}

Saludos,
*Telecomunicaciones Jhair EIRL*`
};

export const enviarWhatsApp = (telefono, mensaje) => {
    const numeroFormateado = formatearTelefono(telefono);
    if (!numeroFormateado) {
        alert('❌ Número de teléfono inválido');
        return;
    }
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${numeroFormateado}?text=${mensajeCodificado}`;
    const ventana = window.open(url, '_blank');
    if (!ventana) {
        alert('⚠️ Por favor, permite las ventanas emergentes');
    }
};

export const obtenerMensajeAutomatico = (cliente) => {
    const mesesDeuda = cliente.meses_deuda || 0;
    const totalDeuda = mesesDeuda * parseFloat(cliente.precio_mensual || 0);
    if (mesesDeuda > 2) {
        return mensajesWhatsApp.recordatorioDeuda(cliente, mesesDeuda, totalDeuda);
    } else if (mesesDeuda > 0) {
        return mensajesWhatsApp.recordatorioDeuda(cliente, mesesDeuda, totalDeuda);
    } else {
        return mensajesWhatsApp.recordatorioPago(cliente, cliente.precio_mensual);
    }
};