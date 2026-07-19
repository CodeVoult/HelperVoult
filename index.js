const { 
    Client, GatewayIntentBits, Partials, EmbedBuilder, 
    ActionRowBuilder, ChannelSelectMenuBuilder, PermissionsBitField, 
    ChannelType, Events, REST, Routes
} = require('discord.js');
const fs = require('fs');

// ==========================================
// ⚙️ CONFIGURACIÓN INICIAL DEL BOT
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const TOKEN = 'TU_TOKEN_AQUI'; 
const ZYROX_ID = 'TU_ID_AQUI'; // Tu ID personal para recibir los reportes al DM
const COLOR_ZYROX = '#FFD700'; // Un dorado premium muy elegante

// Sistema de base de datos local en JSON para guardar los settings
const dbPath = './database.json';
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}));
}

// Funciones para manejar la base de datos de configuraciones
const getSettings = (guildId) => JSON.parse(fs.readFileSync(dbPath))[guildId] || {};
const saveSettings = (guildId, data) => {
    const db = JSON.parse(fs.readFileSync(dbPath));
    db[guildId] = { ...db[guildId], ...data };
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
};

// ==========================================
// 🚀 DEFINICIÓN DE SLASH COMMANDS (Avanzado)
// ==========================================
const commands = [
    {
        name: 'reglas',
        description: 'Muestra el panel de reglas oficial del servidor de scripts ZYROX.',
    },
    {
        name: 'report',
        description: 'Reporta un bug del script directamente al creador.',
        options: [
            { name: 'descripcion', description: 'Explica el bug a detalle.', type: 3, required: true },
            { name: 'imagen', description: 'Adjunta una captura del error (Opcional).', type: 11, required: false }
        ]
    },
    {
        name: 'say',
        description: 'Envía un mensaje de forma anónima a través del bot.',
        options: [
            { name: 'mensaje', description: 'El texto que el bot dirá.', type: 3, required: true }
        ]
    },
    {
        name: 'ban',
        description: 'Banea a un usuario del servidor.',
        options: [
            { name: 'usuario', description: 'El usuario a banear.', type: 6, required: true },
            { name: 'motivo', description: 'La razón del baneo.', type: 3, required: false }
        ]
    },
    {
        name: 'kick',
        description: 'Expulsa a un usuario del servidor.',
        options: [
            { name: 'usuario', description: 'El usuario a expulsar.', type: 6, required: true },
            { name: 'motivo', description: 'La razón de la expulsión.', type: 3, required: false }
        ]
    },
    {
        name: 'timeout',
        description: 'Aísla temporalmente a un usuario.',
        options: [
            { name: 'usuario', description: 'El usuario a aislar.', type: 6, required: true },
            { name: 'minutos', description: 'Tiempo en minutos.', type: 4, required: true },
            { name: 'motivo', description: 'La razón del aislamiento.', type: 3, required: false }
        ]
    },
    {
        name: 'settings',
        description: 'Abre el panel avanzado de configuración del servidor.',
    }
];

// ==========================================
// 🟢 EVENTO: BOT INICIADO Y REGISTRO DE COMANDOS
// ==========================================
client.once(Events.ClientReady, async () => {
    console.log(`✅ Conectado como ${client.user.tag}`);
    console.log(`🐐 ZYROX BOT está en línea 24/7 y listo para operar.`);

    // Registrador global de Slash Commands
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ Slash Commands actualizados a nivel global (Premium mode).');
    } catch (error) {
        console.error('❌ Error registrando comandos:', error);
    }
});

// ==========================================
// 💬 EVENTO: AUTO-RESPUESTA A LA PALABRA "SCRIPT"
// ==========================================
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().includes('script')) {
        await message.reply(`Hola ${message.author}, el script está en la nube de delta, solo busca la palabra **ZYROX** y aparece. ¡Disfruta mucho el script! 🐐🔥`);
    }
});

// ==========================================
// 👋 EVENTO: BIENVENIDAS PERSONALIZADAS
// ==========================================
client.on(Events.GuildMemberAdd, async member => {
    const settings = getSettings(member.guild.id);
    if (settings.welcomeChannel) {
        const channel = member.guild.channels.cache.get(settings.welcomeChannel);
        if (channel) {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(COLOR_ZYROX)
                .setTitle('✨ ¡Un nuevo miembro ha llegado!')
                .setDescription(`${member} Hola, bienvenido a la comunidad de **ZYROX**, espero que la pases súper bien, nuestra comunidad es amable y respetuosa, y a la vez graciosa 🐐😁😆`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setImage('https://i.imgur.com/TuImagenEleganteDeBienvenida.jpg') // Pon el link a un banner tuyo si quieres
                .setFooter({ text: 'ZYROX Scripts • Sistema Premium', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            channel.send({ content: `${member}`, embeds: [welcomeEmbed] });
        }
    }
});

// ==========================================
// ⚡ EVENTO: MANEJO DE SLASH COMMANDS
// ==========================================
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, options, user, guild } = interaction;

    try {
        // 📜 1. COMANDO: /reglas
        if (commandName === 'reglas') {
            const reglasEmbed = new EmbedBuilder()
                .setColor(COLOR_ZYROX)
                .setTitle('📜 PANEL OFICIAL DE REGLAS | ZYROX SCRIPTS')
                .setDescription('Bienvenido al imperio de ZYROX. Para mantener la paz, lee las siguientes normativas:')
                .addFields(
                    { name: '1️⃣ Respeto Mutuo', value: 'Trata a todos con respeto. Cero toxicidad o insultos graves.' },
                    { name: '2️⃣ No Spam', value: 'Prohibido promocionar otros servidores, scripts o canales de YouTube sin permiso.' },
                    { name: '3️⃣ Uso Correcto de Canales', value: 'Reporta bugs en los canales correspondientes usando `/report`.' },
                    { name: '4️⃣ Prohibido el NSFW', value: 'Cualquier contenido explícito resultará en baneo inmediato.' }
                )
                .setFooter({ text: '© 2026 ZYROX Development', iconURL: guild.iconURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [reglasEmbed] });
        }

        // 🐞 2. COMANDO: /report
        if (commandName === 'report') {
            const descripcion = options.getString('descripcion');
            const imagen = options.getAttachment('imagen');

            // Embed que te llegará al DM
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Rojo para alertas de bug
                .setTitle('🚨 NUEVO REPORTE DE BUG 🚨')
                .addFields(
                    { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '📅 Fecha y Hora', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '📝 Descripción del Error', value: descripcion }
                )
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: 'Sistema Automatizado de ZYROX' });

            if (imagen) dmEmbed.setImage(imagen.url);

            // Enviar DM a ti (ZYROX)
            const zyroxUser = await client.users.fetch(ZYROX_ID);
            if (zyroxUser) {
                await zyroxUser.send({ embeds: [dmEmbed] });
            }

            // Respuesta pública en el canal
            await interaction.reply('El reporte se a enviado con éxito ✅🐐🛠️');
        }

        // 🤫 3. COMANDO: /say
        if (commandName === 'say') {
            const mensaje = options.getString('mensaje');
            // Revisa si tiene permisos para evitar abusos
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
            }
            
            await interaction.channel.send(mensaje);
            await interaction.reply({ content: 'Tu mensaje fue enviado de forma anónima. 🤫', ephemeral: true });
        }

        // 🔨 4. MODERACIÓN: /ban
        if (commandName === 'ban') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
                return interaction.reply({ content: 'No tienes permiso para banear.', ephemeral: true });

            const target = options.getUser('usuario');
            const reason = options.getString('motivo') || 'Ninguna razón proporcionada.';
            
            await guild.members.ban(target, { reason });
            
            const banEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`🔨 **${target.tag}** ha sido **baneado** del servidor.\n**Motivo:** ${reason}`);
            await interaction.reply({ embeds: [banEmbed] });
        }

        // 🥾 4. MODERACIÓN: /kick
        if (commandName === 'kick') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) 
                return interaction.reply({ content: 'No tienes permiso para expulsar.', ephemeral: true });

            const target = options.getMember('usuario');
            const reason = options.getString('motivo') || 'Ninguna razón proporcionada.';
            
            await target.kick(reason);
            
            const kickEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`🥾 **${target.user.tag}** ha sido **expulsado**.\n**Motivo:** ${reason}`);
            await interaction.reply({ embeds: [kickEmbed] });
        }

        // ⏳ 4. MODERACIÓN: /timeout
        if (commandName === 'timeout') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) 
                return interaction.reply({ content: 'No tienes permiso para aislar.', ephemeral: true });

            const target = options.getMember('usuario');
            const mins = options.getInteger('minutos');
            const reason = options.getString('motivo') || 'Ninguna razón proporcionada.';
            const ms = mins * 60 * 1000;
            
            await target.timeout(ms, reason);
            
            const timeoutEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`⏳ **${target.user.tag}** ha sido **aislado** por ${mins} minutos.\n**Motivo:** ${reason}`);
            await interaction.reply({ embeds: [timeoutEmbed] });
        }

        // ⚙️ 5. COMANDO: /settings (Panel Elegante)
        if (commandName === 'settings') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: 'Solo los administradores pueden usar este panel.', ephemeral: true });
            }

            const embedSettings = new EmbedBuilder()
                .setColor(COLOR_ZYROX)
                .setTitle('⚙️ Panel de Configuración Premium | ZYROX')
                .setDescription('Selecciona el canal en el menú de abajo para establecer dónde el bot enviará el majestuoso mensaje de bienvenida.')
                .setFooter({ text: 'Sistema de Configuración' });

            const channelSelect = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_welcome_channel')
                    .setPlaceholder('Selecciona el canal de bienvenidas')
                    .setChannelTypes(ChannelType.GuildText)
            );

            await interaction.reply({ embeds: [embedSettings], components: [channelSelect], ephemeral: true });
        }

    } catch (error) {
        console.error('Error ejecutando comando:', error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error crítico ejecutando este comando.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Hubo un error crítico ejecutando este comando.', ephemeral: true });
        }
    }
});

// ==========================================
// 🎛️ EVENTO: INTERACCIÓN CON EL MENÚ DE SETTINGS
// ==========================================
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChannelSelectMenu()) return;

    if (interaction.customId === 'select_welcome_channel') {
        const selectedChannelId = interaction.values[0];
        saveSettings(interaction.guild.id, { welcomeChannel: selectedChannelId });

        const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Configuración Actualizada')
            .setDescription(`El canal de bienvenidas ha sido configurado en <#${selectedChannelId}>. \n¡Tu bot ahora luce mucho más profesional!`);

        await interaction.update({ embeds: [successEmbed], components: [] });
    }
});

// Inicializar el Bot
client.login(TOKEN);
