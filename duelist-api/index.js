// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Caché en memoria para almacenar las listas de jugadores
let ranksCache = {
    "Ace of Aces": [],
    "Ace": [],
    "Quasi-Ace": []
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// 🛠️ CONFIGURACIÓN: IDs reales aplicados correctamente
const GUILD_ID = '1386130057973596230'; 
const ROLE_IDS = {
    "Ace of Aces": "1510798616594219028",
    "Ace": "1386137056077680711",
    "Quasi-Ace": "1386131622788595835"
};

// Función para mapear el servidor de Discord y actualizar la caché
async function updateRanksCache() {
    try {
        console.log("Actualizando la lista de rangos desde Discord...");
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch(); // Carga todos los miembros en memoria

        // Corregido: "Ace" en singular para coincidir perfectamente con ROLE_IDS
        let tempCache = { "Ace of Aces": [], "Ace": [], "Quasi-Ace": [] };

        for (const [roleName, roleId] of Object.entries(ROLE_IDS)) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                role.members.forEach(member => {
                    // Guarda el apodo del servidor
                    tempCache[roleName].push(member.displayName); 
                });
            } else {
                console.warn(`⚠️ Advertencia: No se encontró el rol con ID [${roleId}] asignado a [${roleName}]`);
            }
        }

        ranksCache = tempCache;
        console.log("✅ Caché de rangos actualizado correctamente:", ranksCache);
    } catch (error) {
        console.error("❌ Error al actualizar desde Discord:", error.message);
    }
}

client.once('ready', () => {
    console.log(`🤖 Bot conectado como ${client.user.tag}`);
    updateRanksCache();
    setInterval(updateRanksCache, 2 * 60 * 1000); // Actualiza internamente cada 2 minutos
});

// Ruta que consultará Roblox
app.get('/get-ranks', (req, res) => {
    res.json(ranksCache);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// 🔒 Control de errores al iniciar sesión
console.log("Intentando conectar el bot a Discord...");

if (!process.env.DISCORD_TOKEN) {
    console.error("❌ ERROR CRÍTICO: La variable de entorno 'DISCORD_TOKEN' está vacía en Render.");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error("❌ ERROR FATAL AL INICIAR SESIÓN CON EL BOT DE DISCORD:");
    console.error(error.message);
    process.exit(1);
});