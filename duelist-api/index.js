// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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

// 🛠️ CONFIGURACIÓN: Reemplaza estos valores con tus IDs reales
const GUILD_ID = '1386130057973596230'; 
const ROLE_IDS = {
    "Ace of Aces": "1510798616594219028",
    "Ace": "1386137056077680711",
    "Quasi-Ace": "1386131622788595835"
};

async function updateRanksCache() {
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch(); // Carga todos los miembros en memoria

        let tempCache = { "Ace of Aces": [], "Aces": [], "Quasi-Ace": [] };

        for (const [roleName, roleId] of Object.entries(ROLE_IDS)) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                role.members.forEach(member => {
                    // Guarda el apodo del servidor (el cual debería ser su nombre de Roblox)
                    tempCache[roleName].push(member.displayName); 
                });
            }
        }

        ranksCache = tempCache;
        console.log("Caché de rangos actualizado.");
    } catch (error) {
        console.error("Error al actualizar desde Discord:", error);
    }
}

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    updateRanksCache();
    setInterval(updateRanksCache, 2 * 60 * 1000); // Actualiza internamente cada 2 minutos
});

// Ruta que consultará Roblox
app.get('/get-ranks', (req, res) => {
    res.json(ranksCache);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Lee el Token de forma segura desde las variables de entorno de Render
client.login(process.env.DISCORD_TOKEN);