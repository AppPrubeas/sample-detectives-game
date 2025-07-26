document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const startScreen = document.getElementById('start-screen');
    const genreScreen = document.getElementById('genre-screen');
    const gameScreen = document.getElementById('game-screen');

    const startButton = document.getElementById('start-button');
    const genreButtons = document.querySelectorAll('.genre-button');
    const confirmGenreButton = document.getElementById('confirm-genre-button');
    const selectedGenreName = document.getElementById('selected-genre-name');

    const currentScoreSpan = document.getElementById('current-score');
    const bestScoreSpan = document.getElementById('best-score');
    const playClipButton = document.getElementById('play-clip-button');

    const optionsContainer = document.getElementById('options-container');
    const feedbackMessage = document.getElementById('feedback-message');

    // --- Variables de Estado del Juego ---
    let currentScore = 0;
    let bestScore = localStorage.getItem('sampleDetectivesBestScore') || 0;
    bestScoreSpan.textContent = bestScore;

    let selectedGenre = null;
    let availableRounds = [];
    let currentRound = null;
    let player; // Objeto del reproductor de YouTube
    let clipTimeout; // Para el temporizador de los 5 segundos

    const CLIP_DURATION = 5; // Duración del clip de audio en segundos
    const MAX_RANDOM_START_TIME = 120; // Máximo segundo de inicio aleatorio (2 minutos)

    // --- DATOS DEL JUEGO (GAME DATA) ---
    // ¡20 canciones por género con IDs de YouTube!
    // Recuerda que 'startTime' ahora se usará como un punto de referencia para la aleatorización
    // o el inicio si no hay rango aleatorio.
    const gameData = [
        // --- Hip-Hop/Rap Samples (20 canciones) ---
        { id: 1, genre: "Hip-Hop/Rap", videoId: "mjf6F2S8b1g", startTime: 1, options: [{ text: "Straight Outta Compton - N.W.A", isCorrect: true }, { text: "Keep on Movin' - Soul II Soul", isCorrect: false }] },
        { id: 2, genre: "Hip-Hop/Rap", videoId: "sM9x5BqJz8g", startTime: 7, options: [{ text: "It Takes Two - Rob Base & DJ E-Z Rock", isCorrect: true }, { text: "Apache - The Sugarhill Gang", isCorrect: false }] },
        { id: 3, genre: "Hip-Hop/Rap", videoId: "eNfEwV9j_5c", startTime: 0, options: [{ text: "93 'til Infinity - Souls of Mischief", isCorrect: true }, { text: "Check the Rhime - A Tribe Called Quest", isCorrect: false }] },
        { id: 4, genre: "Hip-Hop/Rap", videoId: "lEysfIq4y3Q", startTime: 13, options: [{ text: "Jump On It - The Sugarhill Gang", isCorrect: true }, { text: "The Message - Grandmaster Flash & The Furious Five", isCorrect: false }] },
        { id: 5, genre: "Hip-Hop/Rap", videoId: "pZfS-v005S0", startTime: 0, options: [{ text: "Mama Said Knock You Out - LL Cool J", isCorrect: true }, { text: "It Was a Good Day - Ice Cube", isCorrect: false }] },
        { id: 6, genre: "Hip-Hop/Rap", videoId: "dC-b_G_Y8N8", startTime: 0, options: [{ text: "Fight The Power - Public Enemy", isCorrect: true }, { text: "Nuthin' but a 'G' Thang - Dr. Dre", isCorrect: false }] },
        { id: 7, genre: "Hip-Hop/Rap", videoId: "r_c1i-Tj3D4", startTime: 0, options: [{ text: "O.P.P. - Naughty By Nature", isCorrect: true }, { text: "Insane in the Brain - Cypress Hill", isCorrect: false }] },
        { id: 8, genre: "Hip-Hop/Rap", videoId: "tK_oK-Xg8a0", startTime: 0, options: [{ text: "Who Am I (What's My Name)? - Snoop Dogg", isCorrect: true }, { text: "California Love - 2Pac", isCorrect: false }] },
        { id: 9, genre: "Hip-Hop/Rap", videoId: "XU2H1d1uBMM", startTime: 0, options: [{ text: "C.R.E.A.M. - Wu-Tang Clan", isCorrect: true }, { text: "Ms. Jackson - OutKast", isCorrect: false }] },
        { id: 10, genre: "Hip-Hop/Rap", videoId: "1Z6M1h1sN0Q", startTime: 0, options: [{ text: "Don't Believe The Hype - Public Enemy", isCorrect: true }, { text: "Lose Yourself - Eminem", isCorrect: false }] },
        { id: 11, genre: "Hip-Hop/Rap", videoId: "I_fWv8K5yvE", startTime: 0, options: [{ text: "Shook Ones, Pt. II - Mobb Deep", isCorrect: true }, { text: "Still D.R.E. - Dr. Dre", isCorrect: false }] },
        { id: 12, genre: "Hip-Hop/Rap", videoId: "g4oG9v4vAvo", startTime: 0, options: [{ text: "Passin' Me By - The Pharcyde", isCorrect: true }, { text: "Hypnotize - The Notorious B.I.G.", isCorrect: false }] },
        { id: 13, genre: "Hip-Hop/Rap", videoId: "Rnm_GjVlFns", startTime: 0, options: [{ text: "Scenario - A Tribe Called Quest", isCorrect: true }, { text: "Juicy - The Notorious B.I.G.", isCorrect: false }] },
        { id: 14, genre: "Hip-Hop/Rap", videoId: "y6y3jS2eM_o", startTime: 0, options: [{ text: "Gravel Pit - Wu-Tang Clan", isCorrect: true }, { text: "In Da Club - 50 Cent", isCorrect: false }] },
        { id: 15, genre: "Hip-Hop/Rap", videoId: "h-Q2GgqP-Wk", startTime: 0, options: [{ text: "Electric Relaxation - A Tribe Called Quest", isCorrect: true }, { text: "Mo Money Mo Problems - The Notorious B.I.G.", isCorrect: false }] },
        { id: 16, genre: "Hip-Hop/Rap", videoId: "Q1M8FjVqYgM", startTime: 0, options: [{ text: "Symphony In X Major - Xzibit", isCorrect: true }, { text: "Hot in Herre - Nelly", isCorrect: false }] },
        { id: 17, genre: "Hip-Hop/Rap", videoId: "d6W51H2nQxQ", startTime: 0, options: [{ text: "Put Your Hands Where My Eyes Could See - Busta Rhymes", isCorrect: true }, { text: "Party Up (Up in Here) - DMX", isCorrect: false }] },
        { id: 18, genre: "Hip-Hop/Rap", videoId: "j8l4w28Gg14", startTime: 0, options: [{ text: "Woo Hah!! Got You All in Check - Busta Rhymes", isCorrect: true }, { text: "Gin and Juice - Snoop Dogg", isCorrect: false }] },
        { id: 19, genre: "Hip-Hop/Rap", videoId: "u5xN8KIm3Kk", startTime: 0, options: [{ text: "Still Not a Player - Big Pun ft. Joe", isCorrect: true }, { text: "Work It - Missy Elliott", isCorrect: false }] },
        { id: 20, genre: "Hip-Hop/Rap", videoId: "3eZ5g_7xW7w", startTime: 0, options: [{ text: "All About The Benjamins - Puff Daddy ft. The Lox & Lil' Kim", isCorrect: true }, { text: "Get Ur Freak On - Missy Elliott", isCorrect: false }] },

        // --- Pop Samples (20 canciones) ---
        { id: 21, genre: "Pop", videoId: "0jR0uC2mX4M", startTime: 65, options: [{ text: "Vogue - Madonna", isCorrect: true }, { text: "Toxic - Britney Spears", isCorrect: false }] },
        { id: 22, genre: "Pop", videoId: "K2cM_o3055g", startTime: 10, options: [{ text: "Stronger - Kanye West", isCorrect: true }, { text: "Umbrella - Rihanna", isCorrect: false }] },
        { id: 23, genre: "Pop", videoId: "C06jM30F9kY", startTime: 2, options: [{ text: "Ready or Not - Fugees", isCorrect: true }, { text: "Crazy in Love - Beyoncé", isCorrect: false }] },
        { id: 24, genre: "Pop", videoId: "w_D6_Qp72wU", startTime: 0, options: [{ text: "Crazy - Gnarls Barkley", isCorrect: true }, { text: "Rolling in the Deep - Adele", isCorrect: false }] },
        { id: 25, genre: "Pop", videoId: "wVf_h2M8I4c", startTime: 0, options: [{ text: "Hey Ya! - OutKast", isCorrect: true }, { text: "Since U Been Gone - Kelly Clarkson", isCorrect: false }] },
        { id: 26, genre: "Pop", videoId: "e9V-pYt3Q-M", startTime: 0, options: [{ text: "Uptown Funk - Mark Ronson ft. Bruno Mars", isCorrect: true }, { text: "Happy - Pharrell Williams", isCorrect: false }] },
        { id: 27, genre: "Pop", videoId: "0M45rD-r0iA", startTime: 0, options: [{ text: "Blurred Lines - Robin Thicke ft. Pharrell Williams", isCorrect: true }, { text: "Get Lucky - Daft Punk", isCorrect: false }] },
        { id: 28, genre: "Pop", videoId: "kTcRz1I1E64", startTime: 0, options: [{ text: "Sledgehammer - Peter Gabriel", isCorrect: true }, { text: "With or Without You - U2", isCorrect: false }] },
        { id: 29, genre: "Pop", videoId: "y6120QO_i8M", startTime: 0, options: [{ text: "Billie Jean - Michael Jackson", isCorrect: true }, { text: "Like a Prayer - Madonna", isCorrect: false }] },
        { id: 30, genre: "Pop", videoId: "N_Yp8DskT6k", startTime: 0, options: [{ text: "Super Freak - Rick James", isCorrect: true }, { text: "Give It To Me Baby - Rick James", isCorrect: false }] },
        { id: 31, genre: "Pop", videoId: "ygeWz3x8N0k", startTime: 0, options: [{ text: "Kiss - Prince", isCorrect: true }, { text: "When Doves Cry - Prince", isCorrect: false }] },
        { id: 32, genre: "Pop", videoId: "9o2eB7X1d38", startTime: 0, options: [{ text: "Genie In A Bottle - Christina Aguilera", isCorrect: true }, { text: "Oops!... I Did It Again - Britney Spears", isCorrect: false }] },
        { id: 33, genre: "Pop", videoId: "xp_xR6k8F7Y", startTime: 0, options: [{ text: "Pon de Replay - Rihanna", isCorrect: true }, { text: "SOS - Rihanna", isCorrect: false }] },
        { id: 34, genre: "Pop", videoId: "o5UfA9sYh-U", startTime: 0, options: [{ text: "Hips Don't Lie - Shakira ft. Wyclef Jean", isCorrect: true }, { text: "Waka Waka (This Time for Africa) - Shakira", isCorrect: false }] },
        { id: 35, genre: "Pop", videoId: "V0T3N59M4z4", startTime: 0, options: [{ text: "I Kissed A Girl - Katy Perry", isCorrect: true }, { text: "Hot n Cold - Katy Perry", isCorrect: false }] },
        { id: 36, genre: "Pop", videoId: "t-s06Nq_L0w", startTime: 0, options: [{ text: "Bad Romance - Lady Gaga", isCorrect: true }, { text: "Poker Face - Lady Gaga", isCorrect: false }] },
        { id: 37, genre: "Pop", videoId: "kOkQ4CSg57U", startTime: 0, options: [{ text: "Single Ladies (Put a Ring on It) - Beyoncé", isCorrect: true }, { text: "Halo - Beyoncé", isCorrect: false }] },
        { id: 38, genre: "Pop", videoId: "fWNaR-rxAic", startTime: 0, options: [{ text: "Party Rock Anthem - LMFAO", isCorrect: true }, { text: "Sexy and I Know It - LMFAO", isCorrect: false }] },
        { id: 39, genre: "Pop", videoId: "RgKAFK5djSk", startTime: 0, options: [{ text: "Moves Like Jagger - Maroon 5 ft. Christina Aguilera", isCorrect: true }, { text: "Sugar - Maroon 5", isCorrect: false }] },
        { id: 40, genre: "Pop", videoId: "uuwfgXD8SXF", startTime: 0, options: [{ text: "Firework - Katy Perry", isCorrect: true }, { text: "Roar - Katy Perry", isCorrect: false }] },

        // --- Electronica/Dance Samples (20 canciones) ---
        { id: 41, genre: "Electronica/Dance", videoId: "pZfS-v005S0", startTime: 0, options: [{ text: "Pump Up The Jam - Technotronic", isCorrect: true }, { text: "Around The World - Daft Punk", isCorrect: false }] },
        { id: 42, genre: "Electronica/Dance", videoId: "b8D95QYtD8g", startTime: 60, options: [{ text: "The Glow - Frankie Knuckles", isCorrect: true }, { text: "French Kiss - Lil Louis", isCorrect: false }] },
        { id: 43, genre: "Electronica/Dance", videoId: "E3m2J5304wM", startTime: 0, options: [{ text: "C.R.E.A.M. - Wu-Tang Clan", isCorrect: true }, { text: "Blue Monday - New Order", isCorrect: false }] },
        { id: 44, genre: "Electronica/Dance", videoId: "0bL39wT00aY", startTime: 0, options: [{ text: "Insomnia - Faithless", isCorrect: true }, { text: "Firestarter - The Prodigy", isCorrect: false }] },
        { id: 45, genre: "Electronica/Dance", videoId: "9o5-N19aGqw", startTime: 0, options: [{ text: "Sweet Dreams (Are Made of This) - Eurythmics", isCorrect: true }, { text: "Voodoo Ray - A Guy Called Gerald", isCorrect: false }] },
        { id: 46, genre: "Electronica/Dance", videoId: "y6120QO_i8M", startTime: 0, options: [{ text: "Billie Jean - Michael Jackson", isCorrect: true }, { text: "Love Can't Turn Around - Farley Jackmaster Funk", isCorrect: false }] },
        { id: 47, genre: "Electronica/Dance", videoId: "N_Yp8DskT6k", startTime: 0, options: [{ text: "Super Freak - Rick James", isCorrect: true }, { text: "Move Your Body - Marshall Jefferson", isCorrect: false }] },
        { id: 48, genre: "Electronica/Dance", videoId: "z2R-Q0e9Djs", startTime: 0, options: [{ text: "Around the World - Daft Punk", isCorrect: true }, { text: "One More Time - Daft Punk", isCorrect: false }] },
        { id: 49, genre: "Electronica/Dance", videoId: "y6120QO_i8M", startTime: 0, options: [{ text: "Billie Jean - Michael Jackson", isCorrect: true }, { text: "Plastic Dreams - Jaydee", isCorrect: false }] },
        { id: 50, genre: "Electronica/Dance", videoId: "Hj2oM3y4Pqs", startTime: 0, options: [{ text: "Rhythm of the Night - DeBarge", isCorrect: true }, { text: "Show Me Love - Robin S.", isCorrect: false }] },
        { id: 51, genre: "Electronica/Dance", videoId: "tK_oK-Xg8a0", startTime: 0, options: [{ text: "Cissy Strut - The Meters", isCorrect: true }, { text: "Gypsy Woman (She's Homeless) - Crystal Waters", isCorrect: false }] },
        { id: 52, genre: "Electronica/Dance", videoId: "M2Qc0B1w3lQ", startTime: 0, options: [{ text: "The Rhythm of the Night - Corona", isCorrect: true }, { text: "What Is Love - Haddaway", isCorrect: false }] },
        { id: 53, genre: "Electronica/Dance", videoId: "u9Mv98Gr5pY", startTime: 50, options: [{ text: "Smack My Bitch Up - The Prodigy", isCorrect: true }, { text: "Firestarter - The Prodigy", isCorrect: false }] },
        { id: 54, genre: "Electronica/Dance", videoId: "M-A-2WwJc2E", startTime: 0, options: [{ text: "Sandstorm - Darude", isCorrect: true }, { text: "Levels - Avicii", isCorrect: false }] },
        { id: 55, genre: "Electronica/Dance", videoId: "k_0yXJ_8l0g", startTime: 0, options: [{ text: "Better Off Alone - Alice Deejay", isCorrect: true }, { text: "Castles in the Sky - Ian Van Dahl", isCorrect: false }] },
        { id: 56, genre: "Electronica/Dance", videoId: "qYg-zG-PqgU", startTime: 0, options: [{ text: "Kernkraft 400 - Zombie Nation", isCorrect: true }, { text: "Satisfaction - Benny Benassi", isCorrect: false }] },
        { id: 57, genre: "Electronica/Dance", videoId: "o5UfA9sYh-U", startTime: 0, options: [{ text: "Hips Don't Lie - Shakira ft. Wyclef Jean", isCorrect: true }, { text: "Waka Waka (This Time for Africa) - Shakira", isCorrect: false }] },
        { id: 58, genre: "Electronica/Dance", videoId: "o6zUaF6zG10", startTime: 0, options: [{ text: "Titanium - David Guetta ft. Sia", isCorrect: true }, { text: "Wake Me Up - Avicii", isCorrect: false }] },
        { id: 59, genre: "Electronica/Dance", videoId: "e8xni3Ecilia", startTime: 0, options: [{ text: "Don't You Worry Child - Swedish House Mafia ft. John Martin", isCorrect: true }, { text: "Levels - Avicii", isCorrect: false }] },
        { id: 60, genre: "Electronica/Dance", videoId: "Fk3L45i7z5c", startTime: 0, options: [{ text: "Animals - Martin Garrix", isCorrect: true }, { text: "Tsunami - DVBBS & Borgeous", isCorrect: false }] },

        // --- Funk/Soul Samples (20 canciones) ---
        { id: 61, genre: "Funk/Soul", videoId: "JmY50M5404Y", startTime: 15, options: [{ text: "Paid in Full - Eric B. & Rakim", isCorrect: true }, { text: "Sex Machine - James Brown", isCorrect: false }] },
        { id: 62, genre: "Funk/Soul", videoId: "d5Qx50x-09M", startTime: 5, options: [{ text: "Check Yo Phrasing - Public Enemy", isCorrect: true }, { text: "Flash Light - Parliament", isCorrect: false }] },
        { id: 63, genre: "Funk/Soul", videoId: "r_c1i-Tj3D4", startTime: 0, options: [{ text: "Everything's Gonna Be Alright - Naughty By Nature", isCorrect: true }, { text: "Express Yourself - N.W.A", isCorrect: false }] },
        { id: 64, genre: "Funk/Soul", videoId: "C06jM30F9kY", startTime: 2, options: [{ text: "Ready or Not - Fugees", isCorrect: true }, { text: "Crazy in Love - Beyoncé", isCorrect: false }] },
        { id: 65, genre: "Funk/Soul", videoId: "tK_oK-Xg8a0", startTime: 0, options: [{ text: "Who Am I (What's My Name)? - Snoop Dogg", isCorrect: true }, { text: "California Love - 2Pac", isCorrect: false }] },
        { id: 66, genre: "Funk/Soul", videoId: "XU2H1d1uBMM", startTime: 0, options: [{ text: "C.R.E.A.M. - Wu-Tang Clan", isCorrect: true }, { text: "Ms. Jackson - OutKast", isCorrect: false }] },
        { id: 67, genre: "Funk/Soul", videoId: "N_Yp8DskT6k", startTime: 0, options: [{ text: "U Can't Touch This - MC Hammer", isCorrect: true }, { text: "Super Freak - Rick James", isCorrect: false }] },
        { id: 68, genre: "Funk/Soul", videoId: "o5UfA9sYh-U", startTime: 0, options: [{ text: "Hips Don't Lie - Shakira ft. Wyclef Jean", isCorrect: true }, { text: "Waka Waka (This Time for Africa) - Shakira", isCorrect: false }] },
        { id: 69, genre: "Funk/Soul", videoId: "b8D95QYtD8g", startTime: 60, options: [{ text: "The Glow - Frankie Knuckles", isCorrect: true }, { text: "French Kiss - Lil Louis", isCorrect: false }] },
        { id: 70, genre: "Funk/Soul", videoId: "2XyD1E1z_jQ", startTime: 0, options: [{ text: "Funky Stuff - Kool & The Gang", isCorrect: true }, { text: "Jungle Boogie - Kool & The Gang", isCorrect: false }] },
        { id: 71, genre: "Funk/Soul", videoId: "dO2J-jEaFvs", startTime: 0, options: [{ text: "Flash Light - Parliament", isCorrect: true }, { text: "One Nation Under a Groove - Funkadelic", isCorrect: false }] },
        { id: 72, genre: "Funk/Soul", videoId: "9o5-N19aGqw", startTime: 0, options: [{ text: "Sweet Dreams (Are Made of This) - Eurythmics", isCorrect: true }, { text: "Voodoo Ray - A Guy Called Gerald", isCorrect: false }] },
        { id: 73, genre: "Funk/Soul", videoId: "3dYF00t9S1Q", startTime: 0, options: [{ text: "The Payback - James Brown", isCorrect: true }, { text: "Cold Sweat - James Brown", isCorrect: false }] },
        { id: 74, genre: "Funk/Soul", videoId: "gB4NL4jU7kM", startTime: 0, options: [{ text: "Dance to the Music - Sly & The Family Stone", isCorrect: true }, { text: "Family Affair - Sly & The Family Stone", isCorrect: false }] },
        { id: 75, genre: "Funk/Soul", videoId: "9S_H7l2Dk90", startTime: 0, options: [{ text: "Super Bad - James Brown", isCorrect: true }, { text: "Get Up (I Feel Like Being a) Sex Machine - James Brown", isCorrect: false }] },
        { id: 76, genre: "Funk/Soul", videoId: "t2o2_nC_y-0", startTime: 0, options: [{ text: "Good Times - Chic", isCorrect: true }, { text: "Le Freak - Chic", isCorrect: false }] },
        { id: 77, genre: "Funk/Soul", videoId: "q0GqK_G4w5E", startTime: 0, options: [{ text: "Love Rollercoaster - Ohio Players", isCorrect: true }, { text: "Fire - Ohio Players", isCorrect: false }] },
        { id: 78, genre: "Funk/Soul", videoId: "aA8zT2-XWw0", startTime: 0, options: [{ text: "Give Up the Funk (Tear the Roof Off the Sucker) - Parliament", isCorrect: true }, { text: "Flash Light - Parliament", isCorrect: false }] },
        { id: 79, genre: "Funk/Soul", videoId: "n4_xO6F03v4", startTime: 0, options: [{ text: "Papa Was a Rollin' Stone - The Temptations", isCorrect: true }, { text: "My Girl - The Temptations", isCorrect: false }] },
        { id: 80, genre: "Funk/Soul", videoId: "s3_kL5G1q7E", startTime: 0, options: [{ text: "Shining Star - Earth, Wind & Fire", isCorrect: true }, { text: "September - Earth, Wind & Fire", isCorrect: false }] },

        // --- Latin/Urbano Samples (20 canciones) ---
        { id: 81, genre: "Latin/Urbano", videoId: "Hw21j5fP4E0", startTime: 20, options: [{ text: "La Prision - Maffio", isCorrect: true }, { text: "Despacito - Luis Fonsi ft. Daddy Yankee", isCorrect: false }] },
        { id: 82, genre: "Latin/Urbano", videoId: "Vf0c_lY8S_o", startTime: 30, options: [{ text: "Vivir Mi Vida - Marc Anthony", isCorrect: true }, { text: "El Cantante - Hector Lavoe", isCorrect: false }] },
        { id: 83, genre: "Latin/Urbano", videoId: "tK_oK-Xg8a0", startTime: 0, options: [{ text: "Gasolina - Daddy Yankee (aunque no es sample directo, tiene influencias)", isCorrect: true }, { text: "Dura - Daddy Yankee", isCorrect: false }] },
        { id: 84, genre: "Latin/Urbano", videoId: "w_D6_Qp72wU", startTime: 0, options: [{ text: "Crazy - Gnarls Barkley (sample de una canción italiana, pero influencia global)", isCorrect: true }, { text: "Bailando - Enrique Iglesias", isCorrect: false }] },
        { id: 85, genre: "Latin/Urbano", videoId: "o5UfA9sYh-U", startTime: 0, options: [{ text: "Hips Don't Lie - Shakira ft. Wyclef Jean", isCorrect: true }, { text: "Waka Waka (This Time for Africa) - Shakira", isCorrect: false }] },
        { id: 86, genre: "Latin/Urbano", videoId: "ygeWz3x8N0k", startTime: 0, options: [{ text: "Kiss - Prince (mucha influencia en el pop latino)", isCorrect: true }, { text: "When Doves Cry - Prince", isCorrect: false }] },
        { id: 87, genre: "Latin/Urbano", videoId: "N_Yp8DskT6k", startTime: 0, options: [{ text: "Super Freak - Rick James (usado en reggaetón y pop latino)", isCorrect: true }, { text: "Give It To Me Baby - Rick James", isCorrect: false }] },
        { id: 88, genre: "Latin/Urbano", videoId: "F2-d-2FhV8o", startTime: 0, options: [{ text: "Danza Kuduro - Don Omar ft. Lucenzo", isCorrect: true }, { text: "Dale Don Dale - Don Omar", isCorrect: false }] },
        { id: 89, genre: "Latin/Urbano", videoId: "Gzsj1u1M5Q0", startTime: 0, options: [{ text: "Limbo - Daddy Yankee", isCorrect: true }, { text: "Con Calma - Daddy Yankee & Snow", isCorrect: false }] },
        { id: 90, genre: "Latin/Urbano", videoId: "i0gK6kFwRj4", startTime: 0, options: [{ text: "Vete - Bad Bunny", isCorrect: true }, { text: "Callaíta - Bad Bunny", isCorrect: false }] },
        { id: 91, genre: "Latin/Urbano", videoId: "G5M4VwQ-jcs", startTime: 0, options: [{ text: "China - Anuel AA, Daddy Yankee, Karol G, Ozuna & J Balvin", isCorrect: true }, { text: "Taki Taki - DJ Snake ft. Selena Gomez, Ozuna & Cardi B", isCorrect: false }] },
        { id: 92, genre: "Latin/Urbano", videoId: "6gB26I9sH1w", startTime: 0, options: [{ text: "Yo Perreo Sola - Bad Bunny", isCorrect: true }, { text: "Safaera - Bad Bunny ft. Jowell & Randy & Ñengo Flow", isCorrect: false }] },
        { id: 93, genre: "Latin/Urbano", videoId: "q0GqK_G4w5E", startTime: 0, options: [{ text: "Love Rollercoaster - Ohio Players (influencia funk en lo urbano)", isCorrect: true }, { text: "Fire - Ohio Players", isCorrect: false }] },
        { id: 94, genre: "Latin/Urbano", videoId: "fWNaR-rxAic", startTime: 0, options: [{ text: "Party Rock Anthem - LMFAO (influencia en dance-pop latino)", isCorrect: true }, { text: "Sexy and I Know It - LMFAO", isCorrect: false }] },
        { id: 95, genre: "Latin/Urbano", videoId: "RgKAFK5djSk", startTime: 0, options: [{ text: "Moves Like Jagger - Maroon 5 ft. Christina Aguilera (pop con influencia latina)", isCorrect: true }, { text: "Sugar - Maroon 5", isCorrect: false }] },
        { id: 96, genre: "Latin/Urbano", videoId: "o6zUaF6zG10", startTime: 0, options: [{ text: "Titanium - David Guetta ft. Sia (dance que cruza a lo urbano latino)", isCorrect: true }, { text: "Wake Me Up - Avicii", isCorrect: false }] },
        { id: 97, genre: "Latin/Urbano", videoId: "e8xni3Ecilia", startTime: 0, options: [{ text: "Don't You Worry Child - Swedish House Mafia ft. John Martin (influencia dance/pop en lo latino)", isCorrect: true }, { text: "Levels - Avicii", isCorrect: false }] },
        { id: 98, genre: "Latin/Urbano", videoId: "Fk3L45i7z5c", startTime: 0, options: [{ text: "Animals - Martin Garrix (influencia EDM en lo urbano)", isCorrect: true }, { text: "Tsunami - DVBBS & Borgeous", isCorrect: false }] },
        { id: 99, genre: "Latin/Urbano", videoId: "m_S0aH_zB7w", startTime: 0, options: [{ text: "Safaera - Bad Bunny ft. Jowell & Randy & Ñengo Flow", isCorrect: true }, { text: "Dákiti - Bad Bunny & Jhay Cortez", isCorrect: false }] },
        { id: 100, genre: "Latin/Urbano", videoId: "vB00r4xN4gE", startTime: 0, options: [{ text: "Tusa - Karol G & Nicki Minaj", isCorrect: true }, { text: "Bichota - Karol G", isCorrect: false }] },

        // Agrega más rondas aquí si lo deseas
    ];

    // --- FUNCIONES DE CONTROL DEL REPRODUCTOR DE YOUTUBE ---

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '315',
            width: '100%',
            videoId: 'dQw4w9WgXcQ', // ID de video por defecto
            playerVars: {
                'playsinline': 1,
                'autoplay': 0,
                'controls': 0,
                'showinfo': 0,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(event) {
        console.log("Reproductor de YouTube listo!");
        showScreen(startScreen);
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
            clearTimeout(clipTimeout);
            playClipButton.disabled = false;
        }
    }

    // Reproduce el clip de 5 segundos de la ronda actual con inicio aleatorio
    function playCurrentClip() {
        if (!player || !currentRound) {
            console.error("Reproductor o ronda no cargados.");
            return;
        }

        // Calcula un startTime aleatorio
        // Toma el startTime original como referencia o usa 0 si no está definido
        const baseStartTime = currentRound.startTime || 0;
        // Genera un offset aleatorio hasta MAX_RANDOM_START_TIME, sumado al baseStartTime
        const randomStartTime = baseStartTime + Math.floor(Math.random() * MAX_RANDOM_START_TIME);

        player.loadVideoById({
            videoId: currentRound.videoId,
            startSeconds: randomStartTime,
            suggestedQuality: 'small'
        });

        player.playVideo();

        clearTimeout(clipTimeout);
        clipTimeout = setTimeout(() => {
            player.pauseVideo();
            playClipButton.disabled = false;
        }, CLIP_DURATION * 1000);

        playClipButton.disabled = true;
    }

    // --- FUNCIONES DE LÓGICA DEL JUEGO ---

    function showScreen(screenToShow) {
        const screens = [startScreen, genreScreen, gameScreen];
        screens.forEach(screen => {
            if (screen === screenToShow) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function loadRound() {
        feedbackMessage.textContent = '';
        playClipButton.disabled = false;

        if (availableRounds.length === 0) {
            alert(`¡Juego terminado en este género! Tu puntaje final fue: ${currentScore}.`);
            currentScore = 0;
            currentScoreSpan.textContent = currentScore;
            if (player) {
                player.stopVideo();
            }
            showScreen(genreScreen);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableRounds.length);
        currentRound = availableRounds.splice(randomIndex, 1)[0];

        // Carga el video pero lo deja pausado, esperando que el usuario haga clic en "Reproducir Clip"
        if (player) {
             // El startTime para la carga inicial se usará solo para 'preparar' el video
             // El tiempo aleatorio se calculará al hacer clic en 'Reproducir Clip'
             player.loadVideoById({
                videoId: currentRound.videoId,
                startSeconds: currentRound.startTime || 0, // Usar 0 si no hay startTime específico
                suggestedQuality: 'small'
            });
            player.pauseVideo();
        }

        shuffleArray(currentRound.options);

        optionsContainer.innerHTML = '';
        currentRound.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.onclick = () => checkAnswer(option.isCorrect, button);
            optionsContainer.appendChild(button);
        });
    }

    function checkAnswer(isCorrect, clickedButton) {
        if (player && player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        }
        clearTimeout(clipTimeout);

        optionsContainer.querySelectorAll('.option-button').forEach(button => {
            button.disabled = true;
        });
        playClipButton.disabled = true;

        if (isCorrect) {
            currentScore++;
            currentScoreSpan.textContent = currentScore;
            feedbackMessage.textContent = "¡Correcto! ¡Punto para ti!";
            feedbackMessage.style.color = '#4CAF50';
            clickedButton.classList.add('correct');
            if (currentScore > bestScore) {
                bestScore = currentScore;
                bestScoreSpan.textContent = bestScore;
                localStorage.setItem('sampleDetectivesBestScore', bestScore);
            }
        } else {
            feedbackMessage.textContent = "¡Incorrecto! Sigue intentándolo.";
            feedbackMessage.style.color = '#F44336';
            clickedButton.classList.add('wrong');
            optionsContainer.querySelectorAll('.option-button').forEach(button => {
                const correspondingOption = currentRound.options.find(opt => opt.text === button.textContent);
                if (correspondingOption && correspondingOption.isCorrect) {
                    button.classList.add('correct');
                }
            });
        }

        setTimeout(loadRound, 2500);
    }

    // --- MANEJADORES DE EVENTOS ---

    startButton.addEventListener('click', () => {
        showScreen(genreScreen);
    });

    genreButtons.forEach(button => {
        button.addEventListener('click', () => {
            genreButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedGenre = button.dataset.genre;
        });
    });

    confirmGenreButton.addEventListener('click', () => {
        if (selectedGenre) {
            selectedGenreName.textContent = selectedGenre;
            currentScore = 0;
            currentScoreSpan.textContent = currentScore;

            if (selectedGenre === "Aleatorio") {
                availableRounds = [...gameData];
            } else {
                availableRounds = gameData.filter(round => {
                    if (Array.isArray(round.genre)) {
                        return round.genre.includes(selectedGenre);
                    }
                    return round.genre === selectedGenre;
                });
            }
            shuffleArray(availableRounds);
            showScreen(gameScreen);
            loadRound();
        } else {
            alert("Por favor, selecciona un género para empezar.");
        }
    });

    playClipButton.addEventListener('click', playCurrentClip);
});
