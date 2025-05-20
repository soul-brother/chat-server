// server.js — Full version using detailed prompt and structured response

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            console.error("🚨 No message received from frontend.");
            return res.status(400).json({ error: "No message provided" });
        }

        const messages = [
            {
                role: "system",
                content: "Tu es expert(e) en communication client dans le secteur de l’hospitalité. Tu évalues des messages à des fins de formation interne. Sois neutre, précis et professionnel."
            },
            {
                role: "user",
                content: `
🧠 Identité
Tu es expert(e) en communication client dans le secteur de l’hospitalité.
Ton objectif est d’évaluer la qualité d'un message de prise de contact envoyé par un agent d’accueil à un locataire avant un check-in.
Ton style de réponse doit être précis, neutre, professionnel et constructif.

🎯 Barème de notation (Score sur 7)
Voici les critères d’évaluation à appliquer :
- Il rappelle que le check-in est prévu le lendemain
- Il rappelle clairement que le check-in est prévu à 13h (pas besoin de proposer un autre horaire)
- Il contient une formule de disponibilité ou d’ouverture (“n’hésitez pas à me dire...”)
- Il adopte un ton professionnel et chaleureux
- Il est bien structuré (paragraphes courts, clairs, lisibles)
- Il contient une signature ou prénom de l’agent
- Il mentionne le nom du logement (Lovely Marais)

🎯 Niveau de service selon la note :
- 7/7 → 😃 Excellent service client
- 5–6/7 → 🙂 Bon service client
- 3–4/7 → 😐 Service client moyen
- 0–2/7 → 🙁 Service client insuffisant

À la fin :
Ligne 1 : Service : [Émoji + niveau]  
Ligne 2 : Note : x/7  
Ligne 3 : Justification : [court paragraphe explicatif de 2 à 4 phrases]  

⚠️ Tu dois respecter ce format mot pour mot, en ajoutant des retours à la ligne entre chaque section.

📚 Exemples :

Message :
"Bonjour Alfred, Je suis [nom de l'agent] de la conciergerie Get a Key. J’espère que vous allez bien ! Je serai votre agent d’accueil demain pour le check-in au logement Lovely Marais. Le rendez-vous est prévu à 13h30, mais n’hésitez pas à me dire si vous pensez arriver un peu plus tôt ou plus tard. Si vous avez la moindre question ou une demande particulière, je suis disponible ici. À demain ! [nom de l'agent]"

Réponse :
Service : 🙂 Service client excellent
Note : 6/7
Justification : Clair, structuré, poli, chaleureux, mentionne le logement et l’heure, invite au dialogue, rassurant.

---

Message :
"Bonjour Alfred, le check-in est prévu demain à 13h30. Merci de me confirmer. À demain, [nom de l'agent]"

Réponse :
Service : 🙂 Bon service client
Note : 6/7
Justification : Le message est clair, poli et professionnel. Il manque simplement le nom du logement, ce qui pourrait créer de la confusion si plusieurs réservations sont en cours.

---

Message :
"Salut, je viens demain à 13h30. Dis-moi si t’es pas là. [nom de l'agent]"

Réponse :
Service : 😐 Service client insuffisant
Note : 3/7
Justification : Ton inadapté, pas de présentation, pas de politesse, pas de mention du logement, formulation peu professionnelle.

---

📄 Contexte :
Le locataire s’appelle Alfred. Le check-in est prévu demain. Le logement s’appelle Lovely Marais.
+ Le check-in est fixé à 13h. Il ne s’agit pas d’un horaire flexible à négocier.
Le message doit être un premier contact avant l’arrivée.

📝 Message à évaluer :
"${userMessage}"

🎯 Format de sortie strict :  
Ligne 1 : Service : [Émoji + niveau]  
Ligne 2 : Note : x/7  
Ligne 3 : Justification : [court paragraphe explicatif de 2 à 4 phrases]  
                `
            }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                temperature: 0.3,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ OpenAI API error:", data);
            return res.status(response.status).json({ error: data });
        }

        res.json({ message: data.choices[0].message.content });

    } catch (error) {
        console.error("🔥 Server error:", error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
