(function() {
    'use strict';

    const STORAGE_KEY = 'questBoardData_v7';
    const THEME_KEY = 'questBoardTheme_v1';
    const RANK_XP = { common: 25, rare: 50, epic: 100, legendary: 200 };
    const GOLD_PER_XP = 5;
    const SMALL_TASK_BONUS = 10;
    const SMALL_TASK_THRESHOLD = 3;

    const LEVEL_TITLES_BY_THEME = {
      medieval: [
        { min: 1, title: 'Novice Adventurer', sub: '⚔️ Your journey begins' },
        { min: 3, title: 'Squire of the Board', sub: '🛡️ Steadily climbing' },
        { min: 5, title: 'Knight Errant', sub: '🗡️ A true quest-taker' },
        { min: 8, title: 'Champion of Chores', sub: '🏅 Master of the mundane' },
        { min: 12, title: 'Lord of Productivity', sub: '👑 The board bends to your will' },
        { min: 18, title: 'Mythic Taskmaster', sub: '✨ Legendary discipline' },
        { min: 25, title: 'Ascended Hero', sub: '🌟 Beyond mortal to-do lists' }
      ],
      pirate: [
        { min: 1, title: 'Deckhand', sub: '🧹 Swabbing the planks, one quest at a time' },
        { min: 3, title: "Ship's Cook", sub: '🍲 Steady hands in rough weather' },
        { min: 5, title: 'Able Sailor', sub: '⛵ Learning the ropes' },
        { min: 8, title: 'Bosun', sub: '🪢 Keeper of the ship\'s order' },
        { min: 12, title: 'Navigator', sub: '🧭 You know the way, even when the stars hide' },
        { min: 18, title: 'First Mate', sub: '⚔️ Second only to the Captain' },
        { min: 25, title: 'Captain', sub: '⚓ The ship answers to you' },
        { min: 35, title: 'Pirate Lord', sub: '🏴‍☠️ Fearsome, beloved, and well-rested' },
        { min: 50, title: 'Legend of the Seven Seas', sub: '🌊 Shanties are sung of your dishes' }
      ],
      forest: [
        { min: 1, title: 'Bud', sub: '🌱 Something small is waking' },
        { min: 3, title: 'Sprout', sub: '🌿 Reaching for the light' },
        { min: 5, title: 'Sapling', sub: '🌳 Standing on your own' },
        { min: 8, title: 'Bloom', sub: '🌸 You are showing up, flowering' },
        { min: 12, title: 'Gardener', sub: '🧺 You tend what you love' },
        { min: 18, title: 'Keeper of the Grove', sub: '🍃 The quiet things trust you' },
        { min: 25, title: 'Ancient Oak', sub: '🌲 Rooted, weathered, kind' },
        { min: 35, title: 'Heartwood', sub: '🌳 Deep rings. Steady. Beloved.' },
        { min: 50, title: 'Green Forever', sub: '🌿 Songs grow from your footsteps' }
      ]
    };

    let currentTheme = 'medieval';
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (['medieval','pirate','forest','scifi','neon','redalert'].includes(saved)) currentTheme = saved;
    } catch (e) { /* ignore */ }

    function getLevelInfo(level) {
      const titles = LEVEL_TITLES_BY_THEME[currentTheme] || LEVEL_TITLES_BY_THEME.medieval;
      let info = titles[0];
      for (const t of titles) if (level >= t.min) info = t;
      return info;
    }

    function xpForNextLevel(level) { return 50 + (level * 50); }
    function goldForXp(xp) { return Math.max(1, Math.round(xp / GOLD_PER_XP)); }

    const REWARD_PRESETS = {
      quick: [
        { emoji: '🐱', text: '5 min with a cat' },
        { emoji: '🐈', text: '10 min cuddle with a cat' },
        { emoji: '🐕', text: '5 min with the dogs' },
        { emoji: '☁️', text: '5 min daydreaming' },
        { emoji: '💭', text: '10 min staring out a window' },
        { emoji: '☕', text: 'A warm drink, slowly' },
        { emoji: '🍫', text: 'One treat' },
        { emoji: '🌳', text: '2 min outside, deep breaths' },
        { emoji: '🫧', text: '1 min of quiet, eyes closed' },
        { emoji: '🍎', text: 'A snack, sitting down' },
        { emoji: '🎵', text: 'One favourite song, loud' },
        { emoji: '🛏️', text: '5 min lying flat, no phone' }
      ],
      medium: [
        { emoji: '🚪', text: '30 min alone in your room (unmasking time)' },
        { emoji: '💭', text: '30 min daydreaming, no interruptions' },
        { emoji: '📖', text: 'Read a chapter of a comfort book' },
        { emoji: '✍️', text: '30 min writing, just for you' },
        { emoji: '🎨', text: '30 min drawing, no pressure to finish' },
        { emoji: '🎲', text: 'One hour of D&D prep or play' },
        { emoji: '🎧', text: 'A podcast or album, uninterrupted' },
        { emoji: '📱', text: '15 min of screen time that is ONLY yours' },
        { emoji: '🛁', text: 'A long, unhurried shower or bath' },
        { emoji: '🎮', text: '30 min of a game or comfort show' },
        { emoji: '🛌', text: 'A real nap, no guilt' },
        { emoji: '🍕', text: 'Order or make your favourite food' },
        { emoji: '🧋', text: 'Bubble tea, fancy coffee, or a nice drink' },
        { emoji: '🪟', text: 'Sit by a window with no task for 20 min' },
        { emoji: '🐾', text: 'One-on-one time with a specific pet' }
      ],
      big: [
        { emoji: '🏖️', text: 'A whole lazy afternoon, guilt-free' },
        { emoji: '🎬', text: 'Movie night of your choosing' },
        { emoji: '🛍️', text: 'A small purchase you actually want' },
        { emoji: '🍽️', text: 'Takeaway from a favourite place' },
        { emoji: '🎟️', text: 'A trip out somewhere you like' },
        { emoji: '💆', text: 'A long bath + music + no interruptions' },
        { emoji: '🚪', text: 'A full evening alone (unmasking)' },
        { emoji: '📚', text: 'A new book, game, or small luxury' },
        { emoji: '🛌', text: 'A full day of rest, no explanation needed' },
        { emoji: '🎁', text: 'Something you have been wanting for a while' },
        { emoji: '🐉', text: 'A whole D&D session or worldbuilding day' },
        { emoji: '💭', text: 'A full daydreaming session, no timer' }
      ]
    };

    const ALL_REWARDS = [
      ...REWARD_PRESETS.quick.map(r => ({ ...r, tier: 'quick' })),
      ...REWARD_PRESETS.medium.map(r => ({ ...r, tier: 'medium' })),
      ...REWARD_PRESETS.big.map(r => ({ ...r, tier: 'big' }))
    ];

    const TEMPLATES = [
      { cat: 'big-adventure', emoji: '🗂️', title: 'Big Life Admin — tiny steps', rank: 'legendary',
        deadline: 'no rush — one step at a time', reward: '🎁 A day of rest, no explanation needed',
        tags: ['big-adventure', 'admin', 'tiny-steps'],
        desc: 'For any long bureaucratic process — benefits, visas, insurance, enrolment. Every step is 5–10 minutes. Stopping after any step is fine.',
        steps: ['# 🌱 Phase 1 — Understand it (no commitments)','📖 Find ONE official page about what you need to do','📝 Write 3 bullet points on what you learn','💭 Jot down why this matters to you (messy is fine)','# 🔍 Phase 2 — Find out what is needed','🔍 Find the office, website, or helpline','📋 Write 3 questions to ask them','📞 Call or email with those questions','📝 Write down exactly what they said, including the documents list','# 🗂️ Phase 3 — Gather documents','📁 Make one folder (physical or digital) for this process','🪪 Find your ID and photocopy or scan it','📷 Get any photos you need (or plan when)','📞 Book any appointments you need','📄 Write down what each appointment needs to cover','🗓️ Attend the appointments','📄 Collect any letters or reports and check the details','# 🧾 Phase 4 — Fill the forms','📥 Get the form (download or pick up)','🧾 Fill in just the easiest section first','🧾 Fill in the next section','🧾 Fill in anything left','👀 Read it through once','🖨️ Make an extra copy of everything','# 📬 Phase 5 — Submit & wait','📬 Submit the application','🎫 Photograph the receipt / reference number','⏳ Set a reminder to follow up in 2 weeks','💗 Celebrate — submitting is the hard part','# 🎉 Phase 6 — Outcome','📬 Check the details when the response arrives','🎉 Save any reference numbers somewhere safe']},
      { cat: 'big-adventure', emoji: '🏥', title: 'Hospital Visit — tiny steps', rank: 'epic',
        deadline: 'as scheduled', reward: '🚪 A full evening alone (unmasking)', tags: ['big-adventure', 'health', 'tiny-steps'],
        desc: 'Before, during and after — each part small.',
        steps: ['# 🌙 The day before','📅 Check the time and place','📋 Write down your questions','🪪 Put ID, cards and letters in one bag','🎧 Put headphones in the bag','🚗 Sort out transport','# 🏥 The day','💧 Drink some water','🍎 Eat something small','📝 Open your notes app for the visit','💊 Ask about medication changes','📅 Book any follow-up before leaving','# 🛌 Afterwards','🎧 Headphones on for the way home','🛌 Lie down for 10 minutes','💗 Anything else today can wait']},
      { cat: 'big-adventure', emoji: '📦', title: 'Declutter — tiny steps', rank: 'epic',
        deadline: 'no rush', reward: '🛍️ A small purchase you actually want', tags: ['big-adventure', 'home', 'tiny-steps'],
        desc: 'One drawer at a time. Stop when the timer stops.',
        steps: ['# 🧰 Set up (5 min)','📦 Grab 4 bags or boxes','🏷️ Label them Keep / Donate / Sell / Throw','📍 Pick ONE drawer, shelf or pile','# ⏱️ Sort (20 min)','⏱️ Start a 20-minute timer','🧺 Sort that one spot only','🗑️ Take the Throw bag out right away','# 🚪 Wrap up','🎁 Put the Donate bag by the door','📸 Photograph one item to sell (optional)','💗 Stop here. You did the thing.']},

      { cat: 'pet-care', emoji: '🐱', title: 'Fresh Water for the Pets',
        desc: ['💧 Empty and refill every water bowl', '🧼 Rinse the bowls first', '👀 Quick check that everyone drinks'],
        rank: 'common', reward: '🐱 5 min with a cat', deadline: 'today', tags: ['daily-friendly'] },
      { cat: 'pet-care', emoji: '🍽️', title: 'Feed the Pets',
        desc: ['🥫 Prepare the correct portions', '🐾 Place bowls where each pet eats', '🧽 Wipe the feeding area'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['daily-friendly'] },
      { cat: 'pet-care', emoji: '🥣', title: 'Warm Up the Dogs\' Dinner',
        desc: ['🥣 Measure out the food', '🔥 Warm it gently, if that is what they like', '🐕 Set it down and let them enjoy'],
        rank: 'common', reward: '🐕 5 min with the dogs', deadline: 'today', tags: ['daily-friendly'] },
      { cat: 'pet-care', emoji: '🧹', title: 'Litter Box / Cage Tidy',
        desc: ['🧴 Scoop all boxes', '🗑️ Bag and bin the waste', '🌬️ Quick air-out of the room'],
        rank: 'common', reward: '🍫 One treat', deadline: 'today', tags: ['daily-friendly'] },
      { cat: 'pet-care', emoji: '🧽', title: 'Deep Clean Pet Areas',
        desc: ['🧴 Empty and wash the full boxes or cage', '🌞 Let everything dry', '🪣 Refill with fresh litter or bedding'],
        rank: 'rare', reward: '🚪 30 min alone in your room (unmasking time)', deadline: 'this week', tags: ['sensory'] },
      { cat: 'pet-care', emoji: '💊', title: 'Medication for a Pet That Needs It',
        desc: ['📋 Read the dose carefully', '🐾 Approach calmly, one pet at a time', '🎉 Reward yourself for every successful dose'],
        rank: 'rare', reward: '🧋 Bubble tea, fancy coffee, or a nice drink', deadline: 'as scheduled', tags: ['care', 'hard'] },
      { cat: 'pet-care', emoji: '🐾', title: 'Gentle Care for a Pet That Needs It',
        desc: ['🩹 Check any sore spots or needs', '🧴 Clean or apply what is needed', '🤲 Slow, kind handling', '💗 Sit with them after'],
        rank: 'rare', reward: '🐾 One-on-one time with a specific pet', deadline: 'as needed', tags: ['care', 'emotional'] },
      { cat: 'pet-care', emoji: '🪮', title: 'Brush the Pets',
        desc: ['🪮 Brush one pet at a time', '🧼 Dump the fur outside', '🐈 Stop when they want you to'],
        rank: 'common', reward: '🐈 10 min cuddle with a cat', deadline: 'this week', tags: ['gentle'] },
      { cat: 'pet-care', emoji: '🧸', title: 'Clean Pet Beds & Blankets',
        desc: ['🧺 Strip and wash pet bedding', '🌞 Dry thoroughly', '🐾 Put back, watch them approve'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'this week', tags: [] },
      { cat: 'pet-care', emoji: '🧴', title: 'Pet Supply Check',
        desc: ['📦 Check food, litter, meds stock', '📝 Note what is running low', '📱 Add to a list or cart'],
        rank: 'common', reward: '🍫 One treat', deadline: 'this week', tags: ['admin'] },
      { cat: 'pet-care', emoji: '🎾', title: 'Play Session with the Pets',
        desc: ['🎣 Wand, ball, or toy — 10 min per pet', '🐾 Let them win sometimes', '😺 Notice which pet wants what'],
        rank: 'common', reward: '🎵 One favourite song, loud', deadline: 'today', tags: ['joy'] },
      { cat: 'pet-care', emoji: '👁️', title: 'Wellness Check on Pets That Need It',
        desc: ['🐾 Check mobility and comfort', '👀 Eyes, ears, coat, claws', '📝 Note anything that changed', '💬 Mention to family or the vet if needed'],
        rank: 'rare', reward: '🛏️ 5 min lying flat, no phone', deadline: 'this week', tags: ['care', 'emotional'] },

      { cat: 'self-care', emoji: '🚿', title: 'Shower or Bath',
        desc: ['🛁 Get in — that is the win', '🧴 Wash hair if you have energy', '🧖 Dry off, dress in soft clothes'],
        rank: 'rare', reward: '🛁 A long, unhurried shower or bath', deadline: 'anytime', tags: ['body', 'hard'] },
      { cat: 'self-care', emoji: '🦷', title: 'Brush Your Teeth',
        desc: ['🪥 2 min, or even 30 seconds counts', '💧 Rinse', '🪞 That is enough'],
        rank: 'common', reward: '🍫 One treat', deadline: 'today', tags: ['body', 'daily-friendly'] },
      { cat: 'self-care', emoji: '💇', title: 'Wash Your Hair',
        desc: ['🚿 Get hair fully wet', '🧴 Shampoo (conditioner optional)', '🌬️ Air-dry or quick towel'],
        rank: 'common', reward: '🎵 One favourite song, loud', deadline: 'this week', tags: ['body'] },
      { cat: 'self-care', emoji: '👕', title: 'Fresh Clothes Day',
        desc: ['👚 Pick out soft, comfortable clothes', '🧺 Put the old ones in the wash', '🪞 Say something kind to yourself'],
        rank: 'common', reward: '🍫 One treat', deadline: 'today', tags: ['body', 'gentle'] },
      { cat: 'self-care', emoji: '💊', title: 'Take Your Meds / Supplements',
        desc: ['💊 Whatever you need today', '💧 With water', '🕐 Set a reminder if that helps'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['body', 'daily-friendly'] },
      { cat: 'self-care', emoji: '🍽️', title: 'Eat a Real Meal',
        desc: ['🍽️ Something you will actually eat', '🪑 Sit down to eat it', '💗 No guilt about what it is'],
        rank: 'rare', reward: '📱 15 min of screen time that is ONLY yours', deadline: 'today', tags: ['body', 'fuel'] },
      { cat: 'self-care', emoji: '💧', title: 'Drink Some Water',
        desc: ['💧 Fill a glass or bottle', '🚰 Sip it where you are', '🔄 Refill once if you can'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['body', 'daily-friendly'] },
      { cat: 'self-care', emoji: '😴', title: 'Rest Without Apology',
        desc: ['🛌 Lie down', '📱 Optional: phone, music, nothing', '💗 This is allowed. Full stop.'],
        rank: 'rare', reward: '🛌 A real nap, no guilt', deadline: 'anytime', tags: ['rest', 'essential'] },
      { cat: 'self-care', emoji: '🧴', title: 'Wash Your Face',
        desc: ['💧 Warm water', '🧴 Cleanser or just water', '🧖 Pat dry, moisturise if you want'],
        rank: 'common', reward: '🌳 2 min outside, deep breaths', deadline: 'today', tags: ['body'] },
      { cat: 'self-care', emoji: '🪥', title: 'Hair & Skin Reset',
        desc: ['🪮 Detangle or brush hair', '🧴 Lotion on hands and arms', '🪞 Look at yourself kindly'],
        rank: 'common', reward: '🎧 A podcast or album, uninterrupted', deadline: 'this week', tags: ['body', 'gentle'] },
      { cat: 'self-care', emoji: '👟', title: 'Move Your Body Gently',
        desc: ['🚶 A short walk, or stretching', '🪟 Or just open a window and breathe', '💗 No performance required'],
        rank: 'rare', reward: '🌳 2 min outside, deep breaths', deadline: 'this week', tags: ['body', 'rest'] },
      { cat: 'self-care', emoji: '🧘', title: 'Sensory Reset',
        desc: ['🎧 Headphones or silence', '💡 Dim the lights', '🛌 5–10 min in a comfortable spot', '🫧 No input, no output'],
        rank: 'common', reward: '🫧 1 min of quiet, eyes closed', deadline: 'anytime', tags: ['rest', 'unmask'] },

      { cat: 'unmask', emoji: '🚪', title: 'Claim 30 Minutes Alone',
        desc: ['🚪 Close the door', '📱 Tell whoever needs to know you need this time', '🫧 Unmask fully — stim, talk to yourself, whatever you need', '💗 This is not selfish. It is maintenance.'],
        rank: 'rare', reward: '🚪 30 min alone in your room (unmasking time)', deadline: 'today', tags: ['unmask', 'essential'] },
      { cat: 'unmask', emoji: '🎧', title: 'Headphones On, World Off',
        desc: ['🎧 Put on something soothing or familiar', '🚪 Go to a space where you can drop the mask', '🫧 20 min minimum', '💗 No explaining yourself'],
        rank: 'common', reward: '🎧 A podcast or album, uninterrupted', deadline: 'anytime', tags: ['unmask'] },
      { cat: 'unmask', emoji: '🛏️', title: 'Bedroom Reset',
        desc: ['🛏️ Straighten the bed (or just pull the blanket up)', '🧺 Clear the floor or a small surface', '🕯️ Make it somewhere you can breathe'],
        rank: 'common', reward: '🛌 A real nap, no guilt', deadline: 'this week', tags: ['unmask', 'home'] },
      { cat: 'unmask', emoji: '🫧', title: 'A Stim That Makes You Feel Good',
        desc: ['🎵 Music, rocking, a texture, a fidget, whatever', '🚪 Somewhere you feel safe', '💗 10 min of permission to be fully you', '🫧 No performative anything'],
        rank: 'common', reward: '🎵 One favourite song, loud', deadline: 'anytime', tags: ['unmask', 'joy'] },
      { cat: 'unmask', emoji: '💬', title: 'Say No to One Thing',
        desc: ['📋 Notice one request you can decline', '💬 Say no — kindly, briefly, and no explanation required', '🫧 Sit with the discomfort, then breathe', '💗 This is a skill. Celebrate it.'],
        rank: 'epic', reward: '🚪 A full evening alone (unmasking)', deadline: 'this week', tags: ['unmask', 'hard', 'essential'] },
      { cat: 'unmask', emoji: '🎨', title: 'Time in a Special Interest',
        desc: ['🎨 Whatever lights you up', '⏱️ 30 min minimum, no productivity required', '💗 This is not laziness — it is fuel'],
        rank: 'rare', reward: '🎨 30 min drawing, no pressure to finish', deadline: 'this week', tags: ['unmask', 'joy'] },

      { cat: 'rest', emoji: '🛌', title: 'Rest Without Guilt',
        desc: ['🛌 Get horizontal', '📱 Phone face-down, or on, your call', '💗 This counts as a task. Truly.'],
        rank: 'rare', reward: '🛌 A real nap, no guilt', deadline: 'anytime', tags: ['rest', 'essential'] },
      { cat: 'rest', emoji: '🎬', title: 'Comfort Watch / Listen',
        desc: ['🎬 A familiar show, movie, or video', '🍵 Something warm to drink', '💗 No multitasking allowed'],
        rank: 'common', reward: '🎮 30 min of a game or comfort show', deadline: 'anytime', tags: ['rest'] },
      { cat: 'rest', emoji: '☕', title: 'A Slow Morning',
        desc: ['☕ Make a warm drink', '🪑 Sit somewhere you like', '📱 Nothing on the to-do list for 20 min', '💗 Let it be slow'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'this week', tags: ['rest'] },
      { cat: 'rest', emoji: '🌳', title: 'Step Outside',
        desc: ['🚶 Just outside, even 2 min', '🌬️ Breathe deeply three times', '👀 Notice one thing around you', '💗 Short counts'],
        rank: 'common', reward: '🌳 2 min outside, deep breaths', deadline: 'anytime', tags: ['rest', 'outside'] },
      { cat: 'rest', emoji: '🚿', title: 'A Very Long Bath or Shower',
        desc: ['🛁 Warm water', '🎵 Music if you want', '🫧 No rush. No timer.', '💗 This is restorative'],
        rank: 'rare', reward: '🛁 A long, unhurried shower or bath', deadline: 'this week', tags: ['rest', 'body'] },
      { cat: 'rest', emoji: '🌙', title: 'Early, Slow Bedtime',
        desc: ['🌙 Get into bed a bit earlier', '📱 Something calm', '💤 Let sleep come when it comes'],
        rank: 'common', reward: '🛏️ 5 min lying flat, no phone', deadline: 'tonight', tags: ['rest'] },
      { cat: 'rest', emoji: '☁️', title: 'A Good Daydream',
        desc: ['🪟 Somewhere comfortable, or a walk', '💭 Let your mind drift', '🫧 No goal, no timer, no guilt', '💗 This is a real restorative activity'],
        rank: 'common', reward: '💭 30 min daydreaming, no interruptions', deadline: 'anytime', tags: ['rest', 'joy'] },

      { cat: 'creative', emoji: '✍️', title: 'Write Something, Just for You',
        desc: ['✍️ A scene, a paragraph, a line, whatever comes', '🖊️ No editing, no goal', '💗 Even one sentence counts'],
        rank: 'common', reward: '✍️ 30 min writing, just for you', deadline: 'anytime', tags: ['creative', 'joy'] },
      { cat: 'creative', emoji: '🎨', title: 'Draw Something',
        desc: ['🎨 A character, a doodle, a shape', '🖊️ No pressure to finish or share', '💗 The doing is the point'],
        rank: 'common', reward: '🎨 30 min drawing, no pressure to finish', deadline: 'anytime', tags: ['creative', 'joy'] },
      { cat: 'creative', emoji: '🎲', title: 'D&D Prep or Play',
        desc: ['🎲 Character, worldbuilding, notes, or a session', '📖 Any amount counts', '💗 This is fuel, not procrastination'],
        rank: 'rare', reward: '🎲 One hour of D&D prep or play', deadline: 'this week', tags: ['creative', 'joy'] },
      { cat: 'creative', emoji: '🐉', title: 'Worldbuilding Session',
        desc: ['🐉 A location, an NPC, a piece of lore', '📓 Write or sketch it, no matter how rough', '💗 Fill your own creative well'],
        rank: 'rare', reward: '🐉 A whole D&D session or worldbuilding day', deadline: 'this week', tags: ['creative'] },
      { cat: 'creative', emoji: '📖', title: 'Read for Pleasure',
        desc: ['📖 A book, fic, or comic you actually want', '🪑 Somewhere comfortable', '💗 No productivity required'],
        rank: 'common', reward: '📖 Read a chapter of a comfort book', deadline: 'anytime', tags: ['creative', 'rest'] },

      { cat: 'health', emoji: '🏥', title: 'Clinic / Hospital Appointment',
        desc: ['📅 Check date, time, and place', '🪪 Gather ID, insurance, letters', '📝 Write down questions in advance', '🎧 Headphones for the journey', '🛌 Rest when you get home'],
        rank: 'epic', reward: '🚪 A full evening alone (unmasking)', deadline: 'as scheduled', tags: ['health', 'hard'] },
      { cat: 'health', emoji: '🩺', title: 'Book a Doctor\'s Appointment',
        desc: ['📞 Call or book online', '📝 Note the reason in a line or two', '📅 Pick a time that works', '💗 The booking is the win'],
        rank: 'rare', reward: '🧋 Bubble tea, fancy coffee, or a nice drink', deadline: 'this week', tags: ['health', 'admin'] },
      { cat: 'health', emoji: '💊', title: 'Prescription Refill',
        desc: ['📋 Check what is running low', '📞 Call the pharmacy or book online', '🚗 Pick up when ready', '🗄️ Put them where you will find them'],
        rank: 'rare', reward: '🍫 One treat', deadline: 'this week', tags: ['health', 'admin'] },
      { cat: 'health', emoji: '🦷', title: 'Dentist or Specialist Visit',
        desc: ['📅 Check appointment details', '🪪 ID, insurance, letters', '🧘 Ask for breaks if you need them', '💗 Rest afterwards'],
        rank: 'epic', reward: '🚪 A full evening alone (unmasking)', deadline: 'as scheduled', tags: ['health', 'hard'] },
      { cat: 'health', emoji: '📋', title: 'Health Admin Day',
        desc: ['📋 One form or one phone call', '💧 Water nearby', '⏱️ 20 min max, then stop', '💗 Partial counts'],
        rank: 'rare', reward: '🚪 30 min alone in your room (unmasking time)', deadline: 'this week', tags: ['health', 'admin'] },

      { cat: 'home', emoji: '🧺', title: 'One Load of Laundry',
        desc: ['🧺 Gather and start the load', '🌬️ Move to dryer or hang', '🧺 Fold, or leave in the basket — still a win'],
        rank: 'rare', reward: '🚪 30 min alone in your room (unmasking time)', deadline: 'this week', tags: ['home'] },
      { cat: 'home', emoji: '🍽️', title: 'Dishes (Any Amount)',
        desc: ['🍽️ Do the dishes that exist', '🧽 Or just the ones that smell', '💗 Partial counts'],
        rank: 'common', reward: '🍫 One treat', deadline: 'today', tags: ['home', 'daily-friendly'] },
      { cat: 'home', emoji: '🧹', title: '15-Minute Tidy',
        desc: ['⏱️ Set a 15 min timer', '🧹 Pick one small area', '💗 Stop when the timer goes. Really.'],
        rank: 'common', reward: '📱 15 min of screen time that is ONLY yours', deadline: 'today', tags: ['home'] },
      { cat: 'home', emoji: '🛏️', title: 'Make Your Bed',
        desc: ['🛏️ Pull up the covers', '🪟 Open the curtains', '💗 Small thing, real effect'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['home', 'daily-friendly'] },
      { cat: 'home', emoji: '🛏️', title: 'Change Your Bedsheets',
        desc: ['🛏️ Strip the old sheets', '🧺 Put them straight in the wash', '🛏️ Put fresh sheets on (or ask for help)', '💗 Fresh sheets = instant mood boost'],
        rank: 'rare', reward: '🛁 A long, unhurried shower or bath', deadline: 'this week', tags: ['home', 'sensory'] },
      { cat: 'home', emoji: '🛌', title: 'Change Bedding on a Pet Bed',
        desc: ['🛏️ Strip the pet bedding', '🧺 Wash and dry', '🐾 Put it back and let them inspect'],
        rank: 'common', reward: '🐈 10 min cuddle with a cat', deadline: 'this month', tags: ['home', 'pet-care'] },
      { cat: 'home', emoji: '🧴', title: 'Bathroom Quick Reset',
        desc: ['🧴 Wipe the sink', '🚽 Quick toilet brush', '🪞 Optional: mirror', '💗 Not a deep clean — just a reset'],
        rank: 'common', reward: '🎵 One favourite song, loud', deadline: 'this week', tags: ['home'] },
      { cat: 'home', emoji: '🚿', title: 'Clean the Shower / Bath',
        desc: ['🧴 Spray or scrub the walls', '🚿 Rinse thoroughly', '💗 One section is a win'],
        rank: 'rare', reward: '🚪 30 min alone in your room (unmasking time)', deadline: 'this month', tags: ['home', 'sensory'] },
      { cat: 'home', emoji: '🧊', title: 'Fridge Check',
        desc: ['🧊 Look for anything expired', '🗑️ Bin the obvious', '📝 Note what needs replacing'],
        rank: 'common', reward: '🍎 A snack, sitting down', deadline: 'this week', tags: ['home', 'admin'] },
      { cat: 'home', emoji: '🧽', title: 'Wipe Kitchen Counters',
        desc: ['🧽 Clear the surfaces', '🧴 Spray and wipe', '💗 Just the counters — not the whole kitchen'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['home', 'daily-friendly'] },
      { cat: 'home', emoji: '🧹', title: 'Sweep or Vacuum One Room',
        desc: ['🧹 Pick ONE room (or even one corner)', '🧹 Sweep or vacuum', '💗 Stop when that room is done'],
        rank: 'rare', reward: '🎧 A podcast or album, uninterrupted', deadline: 'this week', tags: ['home'] },
      { cat: 'home', emoji: '🪟', title: 'Wipe Down Windows / Mirrors',
        desc: ['🧴 Spray and wipe one or two', '🪟 No need to do every window', '💗 Streaks are fine'],
        rank: 'common', reward: '🍫 One treat', deadline: 'this month', tags: ['home'] },
      { cat: 'home', emoji: '🧺', title: 'Put Laundry Away',
        desc: ['🧺 Take the basket to your room', '👕 Put things in their spots', '💗 Basket empty = huge win'],
        rank: 'rare', reward: '🛌 A real nap, no guilt', deadline: 'this week', tags: ['home', 'hard'] },

      { cat: 'food', emoji: '🍳', title: 'Make Something to Eat',
        desc: ['🍳 Even toast or cereal counts', '🥗 Or leftovers, or a snack plate', '🪑 Sit and eat it, not standing'],
        rank: 'rare', reward: '🍕 Order or make your favourite food', deadline: 'today', tags: ['fuel'] },
      { cat: 'food', emoji: '🥘', title: 'Cook a Proper Meal',
        desc: ['📋 Pick ONE simple recipe', '🛒 Check you have the ingredients', '🔪 Prep as you go, not all at once', '🍽️ Plate up and sit down to eat', '💗 Leftovers = tomorrow off'],
        rank: 'epic', reward: '🍽️ Takeaway from a favourite place', deadline: 'this week', tags: ['food', 'hard'] },
      { cat: 'food', emoji: '🥤', title: 'Sip Something Warm',
        desc: ['☕ Tea, coffee, cocoa, broth', '🪑 Somewhere comfortable', '💗 Let it be a pause, not a task'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['fuel', 'rest'] },
      { cat: 'food', emoji: '🥗', title: 'A Vegetable or a Fruit',
        desc: ['🥗 Any vegetable or fruit you will actually eat', '🍽️ Any form: raw, cooked, frozen, blended', '💗 Fed is best. This is a bonus, not a rule.'],
        rank: 'common', reward: '🍎 A snack, sitting down', deadline: 'today', tags: ['fuel'] },
      { cat: 'food', emoji: '📝', title: 'Plan Tomorrow\'s Meals',
        desc: ['📝 One meal is enough to plan', '🛒 Add missing items to a shopping list', '💗 Reduces tomorrow\'s decisions'],
        rank: 'common', reward: '🎧 A podcast or album, uninterrupted', deadline: 'tonight', tags: ['food', 'admin'] },
      { cat: 'food', emoji: '🧊', title: 'Freezer / Pantry Sort',
        desc: ['🧊 Check what is in the freezer', '📝 Note what needs using up first', '🗑️ Bin anything freezer-burnt'],
        rank: 'common', reward: '🍫 One treat', deadline: 'this month', tags: ['food', 'admin'] },

      { cat: 'boundaries', emoji: '🛡️', title: 'State One Need Clearly',
        desc: ['📝 Decide one thing you need today', '💬 Say it once, plainly, to whoever needs to hear it', '💗 No apologising for having needs', '🫧 Let the awkwardness pass'],
        rank: 'epic', reward: '🚪 A full evening alone (unmasking)', deadline: 'today', tags: ['boundaries', 'hard'] },
      { cat: 'boundaries', emoji: '⏸️', title: 'Pause Before Saying Yes',
        desc: ['📋 When asked for something, pause', '💬 Say: "Let me check and get back to you."', '🫧 You do not owe an instant answer', '💗 This is a boundary, not rudeness'],
        rank: 'rare', reward: '🚪 30 min alone in your room (unmasking time)', deadline: 'today', tags: ['boundaries'] },
      { cat: 'boundaries', emoji: '🚪', title: 'Close Your Door for 20 Min',
        desc: ['🚪 Close the door', '📱 Say: 20 min, then I am back', '🫧 Use the time to unmask', '💗 This is a legitimate need'],
        rank: 'rare', reward: '🧘 20 min of quiet, eyes closed', deadline: 'today', tags: ['boundaries', 'unmask'] },
      { cat: 'boundaries', emoji: '💗', title: 'Do One Thing for YOU Today',
        desc: ['📋 Notice one thing you want, not a duty', '✅ Do it, however small', '💗 Your needs matter as much as anyone else\'s'],
        rank: 'epic', reward: '🎁 Something you have been wanting for a while', deadline: 'today', tags: ['boundaries', 'essential'] },
      { cat: 'boundaries', emoji: '📵', title: 'Phone on Silent for an Hour',
        desc: ['📵 Silent, not vibrate', '🚪 Somewhere you can breathe', '🫧 One hour, no obligations', '💗 The world will still be there'],
        rank: 'rare', reward: '🧘 20 min of quiet, eyes closed', deadline: 'today', tags: ['boundaries', 'rest'] },

      { cat: 'tiny', emoji: '🌬️', title: 'Three Deep Breaths',
        desc: ['🌬️ Breathe in for 4', '⏸️ Hold for 4', '🌬️ Out for 6', '💗 That is the whole quest'],
        rank: 'common', reward: '🍫 One treat', deadline: 'anytime', tags: ['tiny', 'rest'] },
      { cat: 'tiny', emoji: '🪟', title: 'Open a Window',
        desc: ['🪟 Open one window', '🌬️ Let air move through', '💗 30 seconds is plenty'],
        rank: 'common', reward: '🌳 2 min outside, deep breaths', deadline: 'anytime', tags: ['tiny'] },
      { cat: 'tiny', emoji: '🧊', title: 'Drink a Glass of Water',
        desc: ['💧 One glass', '🚰 Cold or room temp', '💗 Hydration is a whole quest'],
        rank: 'common', reward: '☕ A warm drink, slowly', deadline: 'today', tags: ['tiny', 'daily-friendly'] },
      { cat: 'tiny', emoji: '😺', title: 'Say Hi to a Cat',
        desc: ['🐱 Find a cat', '🤲 Gentle hello, or just sit nearby', '💗 This is a real task. It counts.'],
        rank: 'common', reward: '🐱 5 min with a cat', deadline: 'anytime', tags: ['tiny', 'joy'] },
      { cat: 'tiny', emoji: '🐕', title: 'Say Hi to the Dogs',
        desc: ['🐕 Find a dog', '🤲 Gentle hello, or just sit nearby', '💗 They are always happy you exist'],
        rank: 'common', reward: '🐕 5 min with the dogs', deadline: 'anytime', tags: ['tiny', 'joy'] },
      { cat: 'tiny', emoji: '🛏️', title: 'Flop on the Bed for 2 Min',
        desc: ['🛏️ Lie down', '🫧 Do nothing', '⏱️ 2 min, then reassess', '💗 Sometimes the answer is horizontal'],
        rank: 'common', reward: '🛏️ 5 min lying flat, no phone', deadline: 'anytime', tags: ['tiny', 'rest'] },
      { cat: 'tiny', emoji: '🎧', title: 'One Favourite Song',
        desc: ['🎧 Pick a song you love', '🔊 Headphones if you have them', '💗 Eyes closed if you can', '🎵 That is the quest. Done.'],
        rank: 'common', reward: '🎵 One favourite song, loud', deadline: 'anytime', tags: ['tiny', 'joy'] },
      { cat: 'tiny', emoji: '💭', title: 'Daydream for 5 Minutes',
        desc: ['🪟 Anywhere comfortable', '☁️ Let your mind wander', '🫧 No goal, no guilt', '💗 A tiny escape is a real restorative'],
        rank: 'common', reward: '☁️ 5 min daydreaming', deadline: 'anytime', tags: ['tiny', 'joy'] }
    ];

    const CATEGORY_LABELS = {
      'big-adventure': '🗺️ Big Adventures',
      'pet-care': '🐾 Pet Care',
      'self-care': '💗 Self-Care',
      'unmask': '🚪 Unmasking & Alone Time',
      'rest': '🛌 Rest & Recovery',
      'creative': '🎨 Writing, Art & D&D',
      'health': '🏥 Health & Appointments',
      'home': '🏠 Home & Routine',
      'food': '🍽️ Cooking & Food',
      'boundaries': '🛡️ Boundaries & Needs',
      'tiny': '✨ Tiny Wins'
    };

    const FLAVOUR_CARDS = [
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'One (1) good night\'s sleep. Last seen approximately three weeks ago, possibly under the bed. Reward: 50 gold and a quiet morning.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'One (1) matching sock. Last seen entering the laundry void. Suspected accomplice: the tumble dryer. Reward: the other sock.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'A moment of peace. Evasive. Known to appear only when you have forgotten to look for it. Reward: keep it if you find it.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'The last biscuit. Description: crumbs only. Not dangerous, but deeply disappointing. Reward: we suspect it was never there.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'One (1) pair of scissors. Believed to be hiding in plain sight. Reward: moderate satisfaction and a finished task.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'One missing pen lid. Small. Blue. May be under the sofa with the crumbs and the lost marbles. Reward: 10 copper.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'A clean flat surface. Suffering from mysterious nightly deposits of Stuff. Reward: place something on it while it lasts.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'One (1) functioning motivation. Last seen prior to opening this board. Reward: infinite tiny steps.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'One (1) unsent text message. Very shy. Known to hide in drafts forever. Reward: closure.' },
      { cat: 'wanted', emoji: '📜', title: 'WANTED', body: 'A moment of silence. Not to be confused with loneliness. Reward: presence and a cup of tea.' },

      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Baker\'s apprentice sought. Must tolerate early mornings and the smell of warm bread. Bread provided. Apply within.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Blanket fort inspector required. Experience with cushions preferred. The pay is a nap. Training provided on the job.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Wanted: someone to sit quietly and look out the window. No conversation necessary. Tea supplied. Do not disturb after 3pm.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Lost cat in the rafters. Please do not shout. Please do not chase. Please leave a fish. The cat will come down when it is ready.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Dishes sought. Returning any quantity accepted, however small. Half a plate still counts as a dish. The kitchen thanks you.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'A traveller is looking for a kind voice. Approach gently, offer a warm drink. No advice required. Company only.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Bard will perform tonight. Requests accepted. The only song on the setlist is one you already like.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'A nap has been scheduled. Attendance is mandatory. Blankets will be provided. Bring your own pillow.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'Someone left their worries at the door. They will be stored in a box until morning. Retrieval optional.' },
      { cat: 'tavern', emoji: '🍺', title: 'TAVERN NOTICE', body: 'House rule: If you are tired, you are allowed to stop. No further explanation will be asked of you.' },

      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'The laundry pile has grown to the ceiling. The Lord of the Manor requests aid. Bring your strongest basket. The mountain will fall one sock at a time.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'The sink has begun its rebellion. Tonight we fight. Two plates is a victory. Three is a legend.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'A great beast has taken up residence on the bedroom floor. It is made of clothes. Approach with bravery and a bin bag.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'The litter tray scouts report movement. Your presence is requested at the scene. Reward: the continued approval of the cats.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'The dust bunnies have declared war. We are not asking for a full campaign. We are asking for one corner.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'Rally, good soul. The day has asked you for one thing. One small thing. And you are enough for that.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'The fridge is cold, and empty of the good cheese. An expedition is warranted. Bring a shopping list. Bring your appetite.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'A letter has been waiting. A call has been unreturned. One small step, brave one, and then rest.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'A summons: to have a shower today, and be celebrated for it as though you had slain a dragon. Because you have.' },
      { cat: 'call', emoji: '⚔️', title: 'CALL TO ARMS', body: 'The plants are thirsty. This is your gentle reminder, not your duty. A splash of water is a whole victory.' },

      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'My grandmother once gave me a tip:\nIn difficult times, move forward in small steps.\nDo what you have to do, but little by little.\nWash the dishes. Remove the dust. Write a letter. Make a soup.\nYou see? You are advancing step by step.\nTake a step and stop. Rest a little. Praise yourself.\nTake another step. Then another.', attribution: '— A verse often pinned up in the north, author unknown' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'If the mountain seems too big today,\nthen climb a hill instead.\nIf morning brings you sadness,\nit\'s okay to stay in bed.\nA day is not a lifetime.\nA rest is not defeat.\nDon\'t think of it as failure.\nJust a quiet, kind retreat.', attribution: '— A wandering bard, name lost to tavern smoke' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'Do not ask the mountain\nto explain its height tonight.\nFind the stone beneath you.\nLet it hold you right.\nOne step is not a small thing\nwhen the dark has made you slow.\nOne breath can be a doorway.\nOne seed can learn to grow.', attribution: '— From the Bard\'s Field Notes, page 12' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'A lamp is burning in the window,\nsmall against the night.\nIt does not chase the darkness.\nIt only offers light.', attribution: '— A verse often left at the inns of weary travellers' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'I planted one small seed today.\nI watered what I could.\nThe earth gave back no answer,\nbut the earth understood.', attribution: '— A garden verse, passed around quietly' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'The river does not apologise\nfor taking the long way.\nIt rests in a bend,\ngathers itself beneath a bridge,\nthen moves again.', attribution: '— From a journal found at a riverside camp' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'In the margin of the morning\nwrite one sentence, plain and true:\n"I am here, and that is something.\nI am learning what to do."', attribution: '— Left by a retired tutor at a village inn' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'The field lies brown beneath the frost.\nIt has not ceased to be.\nBeneath the quiet, roots are holding\nwhat the eye cannot see.\nRest is not a broken promise.\nSleep is not a wasted day.', attribution: '— A winter verse, warmth in its heart' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'Begin again with softer shoes,\nwith less to prove and say.\nLet the first light find your face\nbefore it finds your way.\nWash one cup and open one door.\nPut your feet upon the floor.', attribution: '— From a song sung at first light' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'Do what you can,\nwith what you have,\nwhere you are.', attribution: '— Attributed to a famously sensible wanderer' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'Done is better than perfect.\nA half-step still moves you forward.\nOne percent is better than no percent.', attribution: '— Scribbled on a tavern napkin, unsigned' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'You are imperfect,\nyou are wired for struggle,\nbut you are worthy of love and belonging.', attribution: '— A passing bard, name forgotten' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'Sometimes you climb out of bed in the morning\nand you think, I\'m not going to make it,\nbut you laugh inside —\nremembering all the times you\'ve felt that way.', attribution: '— A verse scrawled on the wall of an inn' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'You notice things other people walk past.\nThat is not a flaw.\nThat is a gift wearing a disguise.', attribution: '— From a bard who understood' },
      { cat: 'bard', emoji: '🎻', title: 'BARD\'S VERSE', body: 'The only people who don\'t fail\nare those who don\'t try.\nSo find out how it works,\nand try again.', attribution: '— A note left at an inventor\'s workbench' },

      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Lost: one tabby cat. Answers to "Mochi." Extremely fluffy. Do not approach with empty hands. If found, sit quietly and wait. They will come to you.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Found: one (1) orange cat sitting in a box. The box was empty. The cat is now the box. Do not question it.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Lost: my spot on the sofa. Suspect is a cat. Description: warm, smug, unwilling to move. Negotiations ongoing.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Found: one (1) whisker. Owner unknown. If you are missing a whisker, please come forward. The cat is not concerned.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Lost: the appeal of my phone. Found: a cat purring on my chest. It has been two hours. I am not seeking the phone anymore.' },
      { cat: 'lost', emoji: '🐕', title: 'LOST & FOUND', body: 'Found: a wagging tail. Attached to a dog who is very proud of something. We have not yet discovered what. Reward: a belly rub.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Found: a paw under the bathroom door. Owner is impatient. Please open the door. Then close it. Then open it again.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Lost: one (1) crumpled receipt. Suspected thief: a cat who enjoys the sound. Reward: it is now a toy.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Found: a cat asleep in a sunbeam. Do not move the sunbeam. Do not move the cat. Enjoy from a distance.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Lost: my heart. Last seen walking into the room on four little paws. Please return immediately. Or don\'t. It\'s fine.' },
      { cat: 'lost', emoji: '🐈', title: 'LOST & FOUND', body: 'Found: one (1) very good cat. Believed to be yours. Yes, specifically yours. They chose you. This is not a mistake.' },

      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'Let it be known that on this day, rest is not a reward. It is a requirement. — The Crown' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'Henceforth, no citizen shall be required to explain why they need a quiet moment. It is hereby protected. — Royal Seal' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'Be it known that drinking water, eating something, and lying down for ten minutes are considered acts of self-governance, not indulgence. — The Crown' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'The Kingdom recognises that some days the bravest act is getting out of bed. It is hereby celebrated as such. — Royal Proclamation' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'It shall be lawful to leave a task half-done if you are tired. Half a task is a whole act of kindness to yourself. — By order of the Crown' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'Citizens are reminded that they are allowed to want things, not only to be needed by others. Their wanting is valid. — Royal Seal' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'The Kingdom declares this day a day for gentleness. If you cannot be gentle with yourself, we will do it for you. — The Crown' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'Notice is given that the phrase "I should have" is hereby banned from this household until further notice. — Royal Proclamation' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'Let it be recorded that a shower, a meal, and clean clothes are three separate quests, each worthy of a reward. — Keeper of the Board' },
      { cat: 'decree', emoji: '👑', title: 'KINGDOM DECREE', body: 'It is decreed that you are doing better than you think. Evidence: you are here, trying. — Signed, The Crown' },

      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'Someone left a small note here. It says: "You are allowed to be a soft thing in a world that asks you to be hard."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'A tiny scrap of paper. On it: "The cats would like to remind you that you are doing your best, and your best is warm."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'A note from no one in particular: "Whatever you are carrying today, set down the bit you can. The rest will wait."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'A small feather is taped here. Beneath it, a line: "Light things are not weak. They are light."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'A dried leaf, and this: "You are allowed to change your mind, change your pace, or change nothing at all today."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'Someone has drawn a tiny sun here. Under it: "This is a reminder that you are your own weather sometimes."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'A note in careful handwriting: "If today is hard, make it smaller. One breath. One sip. One kind thought. That is enough."' },
      { cat: 'misc', emoji: '🍃', title: 'PINNED BY THE WINDOW', body: 'A little card: "You do not have to earn rest. It was yours all along."' }
    ];

    const FLAVOUR_CAT_LABELS_BY_THEME = {
      medieval: {
        wanted: 'Wanted Poster', tavern: 'Tavern Notice', call: 'Call to Arms',
        bard: "Bard's Verse", lost: 'Lost & Found', decree: 'Kingdom Decree',
        misc: 'Pinned by the Window'
      },
      pirate: {
        wanted: 'Wanted at Sea', tavern: 'Posted at the Docks', call: 'All Hands on Deck',
        bard: 'A Shanty or Verse', lost: 'Missing from the Crew', decree: "Captain's Orders",
        misc: 'Washed Up on the Shore'
      },
      forest: {
        wanted: 'A Notice by the Path', tavern: 'Posted in the Village', call: 'The Hedgerow Speaks',
        bard: 'A Verse in the Leaves', lost: 'Missing from the Garden', decree: 'A Word from the Grove',
        misc: 'Tucked Between the Pages'
      }
    };

    LEVEL_TITLES_BY_THEME.scifi = [
      { min: 1, title: 'Cadet', sub: '🛰️ Systems booting' }, { min: 3, title: 'Technician', sub: '🔧 Signal strengthening' },
      { min: 5, title: 'Netrunner', sub: '🌐 Jacked in' }, { min: 8, title: 'Systems Captain', sub: '🚀 Running a tight ship' },
      { min: 12, title: 'Grid Commander', sub: '⚡ The network obeys' }, { min: 18, title: 'Quantum Architect', sub: '✨ Bending the code' },
      { min: 25, title: 'Ascended Intelligence', sub: '🌟 Beyond the mainframe' }];
    LEVEL_TITLES_BY_THEME.neon = LEVEL_TITLES_BY_THEME.redalert = LEVEL_TITLES_BY_THEME.scifi;
    FLAVOUR_CAT_LABELS_BY_THEME.scifi = FLAVOUR_CAT_LABELS_BY_THEME.neon = FLAVOUR_CAT_LABELS_BY_THEME.redalert =
      { wanted: 'Bounty Alert', tavern: 'Cantina Chatter', call: 'Incoming Signal', bard: 'Audio Log', lost: 'Lost Cargo', decree: 'System Directive', misc: 'Data Fragment' };
    function currentFlavourLabel(cat) {
      const byTheme = FLAVOUR_CAT_LABELS_BY_THEME[currentTheme] || FLAVOUR_CAT_LABELS_BY_THEME.medieval;
      return byTheme[cat] || 'Notice';
    }

    const THEME_TEXT = {
      medieval: {
        xpLabel: 'Experience',
        streakLabel: 'Day Streak',
        noticeBoardTitle: '📌 The Notice Board',
        scratchLabel: '✎ Scratchpad',
        scratchPlaceholder: 'Jot anything here — it saves as you type.',
        ceremonyLabel: '⚔️ Quest Complete ⚔️',
        ceremonyAccept: 'Claim Reward',
        streakShowBtn: '🔥 Show Streak'
      },
      pirate: {
        xpLabel: 'Plunder',
        streakLabel: 'Days at Sea',
        noticeBoardTitle: "📖 The Captain's Log",
        scratchLabel: "✎ Ship's Log",
        scratchPlaceholder: 'Jot anything here, sailor — it saves as you type.',
        ceremonyLabel: '⚓ Voyage Complete ⚓',
        ceremonyAccept: 'Take Yer Prize',
        streakShowBtn: '🏮 Show Lantern'
      },
      forest: {
        xpLabel: 'Growth',
        streakLabel: 'Days Tended',
        noticeBoardTitle: '🍃 The Garden Gate',
        scratchLabel: '✎ Garden Notes',
        scratchPlaceholder: 'Jot anything here — it saves as you write.',
        ceremonyLabel: '🌿 Tended 🌿',
        ceremonyAccept: 'Rest a While',
        streakShowBtn: '🕯️ Show Candle'
      }
    };

    THEME_TEXT.scifi = { xpLabel: 'Data Core', streakLabel: 'Cycles Online', noticeBoardTitle: '📡 Incoming Transmissions', scratchLabel: '✎ Data Pad', scratchPlaceholder: 'Jot anything here — it autosaves.', ceremonyLabel: '◈ Mission Complete ◈', ceremonyAccept: 'Claim Cache', streakShowBtn: '⚡ Show Uptime' };
    THEME_TEXT.neon = Object.assign({}, THEME_TEXT.scifi, { xpLabel: 'Neon Charge', streakLabel: 'Nights Lit', noticeBoardTitle: '🌆 The Street Feed', scratchLabel: '✎ Burner Notes' });
    THEME_TEXT.redalert = Object.assign({}, THEME_TEXT.scifi, { xpLabel: 'Power Core', streakLabel: 'Days Active', noticeBoardTitle: '🚨 Ship Alerts', scratchLabel: "✎ Captain's Log", ceremonyLabel: '◈ Objective Secured ◈' });
    function currentText() {
      return THEME_TEXT[currentTheme] || THEME_TEXT.medieval;
    }

    const DEFAULT_DATA = {
      quests: [
        {
          id: 'q1', title: 'Shower or Bath', emoji: '🛁', rank: 'rare',
          desc: 'Get in — that is the win.',
          steps: [
            { text: '🛁 Get in', done: false },
            { text: '🧴 Wash hair if you have energy', done: false },
            { text: '🧖 Dry off, dress in soft clothes', done: false }
          ],
          reward: '🛁 A long, unhurried shower or bath',
          deadline: 'anytime', day: null, completed: false, completedAt: null, pinned: true
        },
        {
          id: 'q2', title: 'Claim 30 Minutes Alone', emoji: '🚪', rank: 'rare',
          desc: 'Unmasking time. This is maintenance, not selfishness.',
          steps: [
            { text: '🚪 Close the door', done: false },
            { text: '📱 Tell whoever needs to know you need this time', done: false },
            { text: '🫧 Unmask fully — stim, talk to yourself, whatever you need', done: false },
            { text: '💗 Sit with the quiet for a bit', done: false }
          ],
          reward: '🚪 30 min alone in your room (unmasking time)',
          deadline: 'today', day: null, completed: false, completedAt: null, pinned: true
        }
      ],
      notices: [
        { id: 'n1', text: 'Fresh water for the pets', emoji: '💧', when: 'daily', xp: 15, day: null, daily: true, completed: false, lastCompletedDate: null, reward: '🐱 5 min with a cat' },
        { id: 'n2', text: 'Take your meds', emoji: '💊', when: 'daily', xp: 15, day: null, daily: true, completed: false, lastCompletedDate: null, reward: '' },
        { id: 'n3', text: 'Brush your teeth', emoji: '🦷', when: 'daily', xp: 15, day: null, daily: true, completed: false, lastCompletedDate: null, reward: '🍫 One treat' },
        { id: 'n4', text: 'Say hi to each pet', emoji: '😺', when: 'daily', xp: 10, day: null, daily: true, completed: false, lastCompletedDate: null, reward: '' },
        { id: 'n5', text: 'Three deep breaths', emoji: '🌬️', when: 'anytime', xp: 10, day: null, daily: false, completed: false, completedAt: null, reward: '🍫 One treat' },
        { id: 'n6', text: 'Drink a glass of water', emoji: '💧', when: 'daily', xp: 10, day: null, daily: true, completed: false, lastCompletedDate: null, reward: '' }
      ],
      events: [],
      meta: {
        xpTotal: 0, level: 1, streak: 0,
        lastActiveDate: null, lastStreakDate: null,
        streakEnabled: false, streakGraceDays: 2
      }
    };

    let state = loadState();
    const THEME_SHOP = { medieval:{label:'⚔️ Medieval',price:0}, pirate:{label:'🏴‍☠️ Pirate',price:100}, forest:{label:'🌿 Forest',price:100}, scifi:{label:'🌐 Sci-Fi Grid',price:150}, neon:{label:'🌆 Neon Nights',price:150}, redalert:{label:'🚨 Red Alert',price:150} };
    const DEFAULT_SHOP = [
      {id:'f1',emoji:'🛌',text:'A real nap, no guilt',price:0},{id:'f2',emoji:'☕',text:'A warm drink, slowly',price:0},
      {id:'f3',emoji:'🛁',text:'A long, unhurried shower or bath',price:0},{id:'f4',emoji:'🍎',text:'A snack, sitting down',price:0},
      {id:'f5',emoji:'🫧',text:'1 min of quiet, eyes closed',price:0},
      {id:'p1',emoji:'🍫',text:'One treat',price:15},{id:'p2',emoji:'🎮',text:'30 min of a game or comfort show',price:25},
      {id:'p3',emoji:'🧋',text:'Bubble tea, fancy coffee, or a nice drink',price:40},{id:'p4',emoji:'🎬',text:'Movie night of your choosing',price:60},
      {id:'p5',emoji:'🍕',text:'Order or make your favourite food',price:80},{id:'p6',emoji:'🛍️',text:'A small purchase you actually want',price:150}];
    const PERKS = [
      {id:'quill',emoji:'🪶',name:"Scribe's Quill",desc:'Add and edit your own notice cards',price:50,once:true},
      {id:'lucky',emoji:'🍀',name:'Lucky Coin',desc:'+25% gold from everything you complete',price:120,once:true},
      {id:'shield',emoji:'🛡️',name:'Streak Shield',desc:'Saves your streak after a long gap (stackable)',price:40,once:false}];

    function ensureEconomy() {
      const m = state.meta;
      if (m.gold === undefined) m.gold = 0;
      if (!Array.isArray(m.ownedThemes)) m.ownedThemes = ['medieval'];
      if (!m.ownedThemes.includes(currentTheme)) m.ownedThemes.push(currentTheme);
      if (!m.perks) m.perks = {};
      if (m.shields === undefined) m.shields = 0;
      if (!Array.isArray(state.shopItems)) state.shopItems = JSON.parse(JSON.stringify(DEFAULT_SHOP));
      if (!Array.isArray(state.customCards)) state.customCards = [];
      // daily small-task tracking
      if (typeof m.smallTasksToday !== 'number') m.smallTasksToday = 0;
      if (m.smallTasksDate === undefined) m.smallTasksDate = null;
      if (m.smallTaskBonusGiven === undefined) m.smallTaskBonusGiven = false;
    }
    ensureEconomy();
    const allCards = () => FLAVOUR_CARDS.concat(state.customCards || []);

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.quests) && Array.isArray(parsed.notices)) {
            if (!Array.isArray(parsed.events)) parsed.events = [];
            if (!parsed.meta) parsed.meta = { xpTotal: 0, level: 1, streak: 0, lastActiveDate: null, lastStreakDate: null, streakEnabled: false, streakGraceDays: 2 };
            if (parsed.meta.streakEnabled === undefined) parsed.meta.streakEnabled = false;
            if (parsed.meta.streakGraceDays === undefined) parsed.meta.streakGraceDays = 2;
            parsed.quests.forEach(q => {
              if (q.completed === undefined) q.completed = false;
              if (q.completedAt === undefined) q.completedAt = null;
              if (q.reward === undefined) q.reward = '';
              if (q.pinned === undefined) q.pinned = false;
              if (q.stepsCollapsed === undefined) q.stepsCollapsed = false;
              if (!Array.isArray(q.steps)) {
                if (Array.isArray(q.desc)) {
                  q.steps = q.desc.map(line => ({ text: line, done: false }));
                  q.desc = '';
                } else { q.steps = []; }
              } else { q.steps.forEach(s => { if (s.done === undefined) s.done = false; }); }
            });
            parsed.notices.forEach(n => {
              if (n.completed === undefined) n.completed = false;
              if (n.daily === undefined) n.daily = false;
              if (n.lastCompletedDate === undefined) n.lastCompletedDate = null;
              if (n.completedAt === undefined) n.completedAt = null;
              if (typeof n.xp === 'string') n.xp = parseInt(n.xp.replace(/\D/g, ''), 10) || 15;
              if (n.xp === undefined) n.xp = 15;
              if (n.reward === undefined) n.reward = '';
            });
            return parsed;
          }
        }
      } catch (e) { console.warn('Could not load saved data:', e); }
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (e) { console.error('Could not save:', e); showToast('⚠️ Could not save — storage full?'); }
    }

    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
    function todayKey() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    function dateKeyFrom(year, month, day) {
      return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }

    function applyDailyReset() {
      const today = todayKey();
      let changed = false;
      // small task daily bonus reset
      if (state.meta.smallTasksDate !== today) {
        state.meta.smallTasksDate = today;
        state.meta.smallTasksToday = 0;
        state.meta.smallTaskBonusGiven = false;
        changed = true;
      }
      state.notices.forEach(n => {
        if (n.daily && n.completed && n.lastCompletedDate !== today) {
          n.completed = false; n.completedAt = null; changed = true;
        }
      });
      const meta = state.meta;
      if (meta.lastStreakDate) {
        const last = new Date(meta.lastStreakDate + 'T00:00:00');
        const now = new Date(today + 'T00:00:00');
        const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays > meta.streakGraceDays + 1) {
          if (meta.shields > 0) { meta.shields--; const y = new Date(); y.setDate(y.getDate() - 1); meta.lastStreakDate = dateKeyFrom(y.getFullYear(), y.getMonth(), y.getDate()); showToast('🛡️ Streak Shield used — your streak is safe'); }
          else meta.streak = 0;
          changed = true;
        }
      }
      if (changed) saveState();
    }

    // Award XP and gold. Returns { xp, gold, leveledUp, smallBonus }.
    function awardXP(amount, sourceEl, opts) {
      opts = opts || {};
      const isSmallTask = !!opts.isSmallTask;
      if (amount <= 0 && !isSmallTask) return { xp: 0, gold: 0 };

      let gold = goldForXp(amount);
      if (state.meta.perks && state.meta.perks.lucky) gold = Math.ceil(gold * 1.25);

      // small task daily bonus
      let smallBonus = false;
      if (isSmallTask) {
        const today = todayKey();
        if (state.meta.smallTasksDate !== today) {
          state.meta.smallTasksDate = today;
          state.meta.smallTasksToday = 0;
          state.meta.smallTaskBonusGiven = false;
        }
        state.meta.smallTasksToday += 1;
        if (!state.meta.smallTaskBonusGiven && state.meta.smallTasksToday >= SMALL_TASK_THRESHOLD) {
          state.meta.smallTaskBonusGiven = true;
          gold += SMALL_TASK_BONUS;
          smallBonus = true;
        }
      }

      state.meta.xpTotal += amount;
      state.meta.gold = (state.meta.gold || 0) + gold;

      let lvl = 1, xpRemaining = state.meta.xpTotal, xpNeeded = xpForNextLevel(lvl);
      while (xpRemaining >= xpNeeded) { xpRemaining -= xpNeeded; lvl++; xpNeeded = xpForNextLevel(lvl); }
      const leveledUp = lvl > state.meta.level;
      state.meta.level = lvl;

      const today = todayKey();
      if (state.meta.lastStreakDate !== today) {
        if (state.meta.lastStreakDate) {
          const last = new Date(state.meta.lastStreakDate + 'T00:00:00');
          const now = new Date(today + 'T00:00:00');
          const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
          if (diffDays <= state.meta.streakGraceDays + 1) state.meta.streak += 1;
          else state.meta.streak = 1;
        } else state.meta.streak = 1;
        state.meta.lastStreakDate = today;
      }
      saveState();
      renderHeroPanel();
      if (sourceEl) {
        const rect = sourceEl.getBoundingClientRect();
        showXPPopup(amount, gold, rect.left + rect.width / 2, rect.top + rect.height / 3);
      } else {
        showXPPopup(amount, gold, window.innerWidth/2, window.innerHeight/2);
      }
      pulseGold();
      if (smallBonus) {
        setTimeout(() => showToast(`🌿 A little something extra: +${SMALL_TASK_BONUS} 🪙 for tending three small things today`), 400);
      }
      if (leveledUp) {
        triggerLevelUpAnimation();
        const info = getLevelInfo(state.meta.level);
        showToast(`⬆️ LEVEL UP! Level ${state.meta.level} — ${info.title}`);
      }
      return { xp: amount, gold, leveledUp, smallBonus };
    }

    function pulseGold() {
      const el = document.getElementById('goldBlock');
      if (!el) return;
      el.classList.remove('gold-pulse');
      void el.offsetWidth;
      el.classList.add('gold-pulse');
    }

    // Safe setter for textContent
    function safeSetText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function renderHeroPanel() {
      const meta = state.meta;
      const level = meta.level;
      const info = getLevelInfo(level);
      safeSetText('levelNum', level);
      safeSetText('heroTitle', info.title);
      safeSetText('heroSubtitle', info.sub);

      let totalConsumed = 0;
      for (let i = 1; i < level; i++) totalConsumed += xpForNextLevel(i);
      const xpIntoLevel = meta.xpTotal - totalConsumed;
      const xpNeeded = xpForNextLevel(level);
      const pct = Math.min(100, (xpIntoLevel / xpNeeded) * 100);
      safeSetText('xpCurrent', xpIntoLevel);
      safeSetText('xpNext', xpNeeded);
      safeSetText('xpTotal', meta.xpTotal);
      safeSetText('goldCount', meta.gold || 0);
      const barEl = document.getElementById('xpBar');
      if (barEl) barEl.style.width = pct + '%';

      const t = currentText();
      safeSetText('xpLabel', t.xpLabel);
      safeSetText('streakLabel', t.streakLabel);
      safeSetText('streakShowBtn', t.streakShowBtn);

      const block = document.getElementById('streakBlock');
      const showBtn = document.getElementById('showStreakBtn');
      if (block) {
        if (meta.streakEnabled) {
          block.classList.remove('hidden');
          block.style.display = '';
          if (showBtn) showBtn.style.display = 'none';
          safeSetText('streakCount', meta.streak);
          const icon = document.getElementById('streakIcon');
          if (icon) {
            if (meta.streak > 0) icon.classList.add('active'); else icon.classList.remove('active');
          }
        } else {
          block.classList.add('hidden');
          block.style.display = 'none';
          if (showBtn) showBtn.style.display = 'flex';
        }
      }
    }

    function triggerLevelUpAnimation() {
      const badge = document.getElementById('levelBadge');
      if (!badge) return;
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    }

    function showXPPopup(amount, gold, x, y) {
      const el = document.createElement('div');
      el.className = 'xp-popup';
      let html = `+${amount} XP`;
      if (gold && gold > 0) html += ` <span class="gold-part">· +${gold} 🪙</span>`;
      el.innerHTML = html;
      el.style.left = (x - 60) + 'px';
      el.style.top = y + 'px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }

    function showRewardCeremony(questTitle, rewardText, xpAmount, goldAmount, icon) {
      const iconEl = document.getElementById('ceremonyIcon');
      const titleEl = document.getElementById('ceremonyTitle');
      const rewardEl = document.getElementById('ceremonyReward');
      const xpEl = document.getElementById('ceremonyXp');
      const goldEl = document.getElementById('ceremonyGold');
      const overlay = document.getElementById('rewardOverlay');
      if (iconEl) iconEl.textContent = icon || '🏆';
      if (titleEl) titleEl.textContent = questTitle;
      if (rewardEl) {
        if (rewardText) {
          rewardEl.innerHTML = `🎁 ${escapeHtml(rewardText)}<div class="ceremony-reward-sub">Your well-earned prize</div>`;
        } else {
          rewardEl.innerHTML = `✨ XP Only<div class="ceremony-reward-sub">The satisfaction of a job done</div>`;
        }
      }
      if (xpEl) xpEl.textContent = `+${xpAmount} XP`;
      if (goldEl) goldEl.textContent = `+${goldAmount} 🪙 gold`;
      if (overlay) overlay.classList.add('active');
      spawnSparkles();
    }

    function closeRewardCeremony() {
      const overlay = document.getElementById('rewardOverlay');
      if (overlay) overlay.classList.remove('active');
    }

    function spawnSparkles() {
      let emojis;
      if (currentTheme === 'pirate') emojis = ['💰', '⚓', '🪙', '✨', '🏴‍☠️', '🗺️', '🧭', '🌟'];
      else if (currentTheme === 'forest') emojis = ['🌿', '🍃', '🌸', '✨', '🌱', '🪶', '🐝', '🌼'];
      else emojis = ['✨', '⭐', '🌟', '💫', '🎉', '🏆', '🐱', '💗', '🎲'];
      for (let i = 0; i < 16; i++) {
        setTimeout(() => {
          const s = document.createElement('div');
          s.className = 'sparkle';
          s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          s.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 320) + 'px';
          s.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 220) + 'px';
          const angle = Math.random() * Math.PI * 2;
          const dist = 90 + Math.random() * 160;
          s.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
          s.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
          document.body.appendChild(s);
          setTimeout(() => s.remove(), 1600);
        }, i * 55);
      }
    }

    const questPostersEl = document.getElementById('questPosters');
    const noticesGridEl = document.getElementById('noticesGrid');

    const isPhase = s => /^#\s/.test((s && s.text) || '');
    const STEP_XP = 5;
    function escapeHtml(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function pinClassFor(rank) {
      if (rank === 'legendary') return 'pin-gold';
      if (rank === 'epic') return 'pin-gold';
      if (rank === 'rare') return 'pin-blue';
      return '';
    }

    function renderQuests() {
      if (!state.quests.length) {
        questPostersEl.innerHTML = '<div class="empty-state">No quests yet. Click "＋ Add Quest" or browse the template library above.</div>';
        return;
      }
      questPostersEl.innerHTML = state.quests.map(q => {
        const xp = RANK_XP[q.rank] || 50;
        const gold = goldForXp(xp);
        const completedClass = q.completed ? ' completed' : '';
        const allSteps = Array.isArray(q.steps) ? q.steps : [];
        const steps = allSteps.filter(s => !isPhase(s));
        const hasSteps = steps.length > 0;
        const doneSteps = steps.filter(s => s.done).length;
        const allStepsDone = hasSteps && doneSteps === steps.length;
        const pct = hasSteps ? Math.round((doneSteps / steps.length) * 100) : 0;

        const isLong = hasSteps && steps.length > 6 && !q.focus;
        const isExpanded = q.stepsExpanded === true;
        const scrollClass = isLong && !isExpanded ? ' collapsed' : '';

        let stepsBody;
        if (q.focus && !q.completed) {
          const ni = allSteps.findIndex(s => !isPhase(s) && !s.done);
          let ph = '';
          for (let k = ni; k >= 0; k--) if (isPhase(allSteps[k])) { ph = allSteps[k].text.replace(/^#\s*/, ''); break; }
          stepsBody = ni < 0 ? '<div class="focus-step">All done! 🎉</div>'
            : (ph ? `<div class="poster-step phase">${escapeHtml(ph)}</div>` : '') +
              `<div class="poster-step focus-step" data-step-idx="${ni}"><div class="step-box"></div><div class="step-text">${escapeHtml(allSteps[ni].text)}</div></div>`;
        } else {
          stepsBody = allSteps.map((s, i) => isPhase(s)
            ? `<div class="poster-step phase">${escapeHtml(s.text.replace(/^#\s*/, ''))}</div>`
            : `<div class="poster-step${s.done ? ' done' : ''}" data-step-idx="${i}"><div class="step-box">${s.done ? '✓' : ''}</div><div class="step-text">${escapeHtml(s.text)}</div>${s.done ? '' : '<button class="step-split" data-action="split-step" title="Break this step into smaller ones">↳ smaller</button>'}</div>`).join('');
        }
        let stepsHtml = '';
        if (hasSteps) {
          stepsHtml = `
            <div class="poster-steps">
              <div class="poster-steps-header">
                <span>🧭 Steps</span>
                <span class="progress-text">${doneSteps} / ${steps.length} <button class="focus-btn" data-action="toggle-focus">${q.focus ? '☰ all' : '🎯 focus'}</button></span>
              </div>
              <div class="poster-step-progress">
                <div class="poster-step-progress-inner" style="width:${pct}%"></div>
              </div>
              <div class="poster-steps-scroll${scrollClass}">${stepsBody}</div>
              ${isLong ? `<button class="poster-steps-toggle" data-action="toggle-steps">${isExpanded ? '▲ Show less' : `▼ Show all ${steps.length} steps`}</button>` : ''}
            </div>
          `;
        } else if (q.desc && typeof q.desc === 'string') {
          stepsHtml = `<div class="poster-desc">${escapeHtml(q.desc)}</div>`;
        }

        const rewardHtml = q.reward
          ? `<div class="poster-reward-box">
               <div class="reward-label">🎁 Reward</div>
               <div class="reward-text">${escapeHtml(q.reward)}</div>
             </div>`
          : '';

        let btnLabel = '⚔️ Complete Quest';
        let btnDisabled = '';
        if (q.completed) { btnLabel = '✓ Completed'; btnDisabled = 'disabled'; }
        else if (hasSteps && !allStepsDone) { btnLabel = `🧭 ${doneSteps} / ${steps.length} steps — keep going`; btnDisabled = 'disabled'; }

        const stampText = currentTheme === 'pirate' ? 'SHIP-SHAPE' : currentTheme === 'forest' ? 'TENDED' : 'DONE';
        const stampSubText = currentTheme === 'pirate' ? 'VOYAGE COMPLETE' : currentTheme === 'forest' ? 'WELL TENDED' : 'QUEST COMPLETE';
        const stampHtml = q.completed
          ? `<div class="done-stamp">${stampText}<span class="stamp-inner">${stampSubText}</span></div>`
          : '';

        const pinHtml = q.pinned
          ? `<div class="push-pin ${pinClassFor(q.rank)}"><div class="pin-head"></div><div class="pin-needle"></div></div>`
          : '';

        return `
          <div class="quest-poster-wrap${completedClass}${(q.steps || []).length > 12 ? ' quest-poster-wide' : ''}" data-id="${escapeHtml(q.id)}" draggable="true">
            ${pinHtml}
            <div class="quest-poster${completedClass}">
              ${stampHtml}
              <div class="poster-actions">
                <button class="icon-btn pin${q.pinned ? ' active' : ''}" data-action="toggle-pin" title="${q.pinned ? 'Unpin' : 'Pin'}">📌</button>
                <button class="icon-btn edit" data-action="edit" title="Edit">✏️</button>
                <button class="icon-btn delete" data-action="delete" title="Delete">🗑️</button>
              </div>
              <div class="poster-title">
                <span class="emoji-badge">${escapeHtml(q.emoji || '⚔️')}</span>
                ${escapeHtml(q.title || 'Untitled Quest')}
              </div>
              ${stepsHtml}
              ${rewardHtml}
              <div class="poster-footer">
                <span class="poster-deadline">📅 ${escapeHtml(q.deadline || '—')}</span>
                <span class="poster-xp">+${xp} XP · +${gold} 🪙</span>
              </div>
              <button class="complete-btn" data-action="complete" ${btnDisabled}>${btnLabel}</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderNotices() {
      if (!state.notices.length) {
        noticesGridEl.innerHTML = '<div class="empty-state">No notices pinned. Click "＋ Add Notice" to add one.</div>';
        return;
      }
      noticesGridEl.innerHTML = state.notices.map(n => {
        const completedClass = n.completed ? ' completed' : '';
        const btnLabel = n.completed ? '✓ Done' : '✓ Mark Done';
        const dailyBadge = n.daily ? `<span class="notice-daily-badge">🔁 daily</span>` : '';
        const gold = goldForXp(n.xp || 15);
        const rewardMini = n.reward
          ? `<div class="notice-reward-mini" title="${escapeHtml(n.reward)}">🎁 ${escapeHtml(n.reward)}</div>`
          : '';
        const stampText = currentTheme === 'pirate' ? 'SECURED' : currentTheme === 'forest' ? 'TENDED' : 'DONE';
        const stampSubText = currentTheme === 'pirate' ? 'CONFIRMED' : currentTheme === 'forest' ? 'WELL TENDED' : 'COMPLETE';
        const stamp = n.completed
          ? `<div class="notice-stamp">${stampText}<span class="stamp-inner">${stampSubText}</span></div>`
          : '';
        return `
          <div class="notice-sticky${completedClass}" data-id="${escapeHtml(n.id)}" draggable="true">
            ${stamp}
            <div class="notice-actions">
              <button class="icon-btn edit" data-action="edit" title="Edit">✏️</button>
              <button class="icon-btn delete" data-action="delete" title="Delete">🗑️</button>
            </div>
            <div class="notice-text">
              <span class="small-emoji">${escapeHtml(n.emoji || '📌')}</span>
              ${escapeHtml(n.text || 'Untitled')}
            </div>
            <div class="notice-meta">
              <span>${escapeHtml(n.when || '—')}</span>
              <span class="notice-xp-badge">+${n.xp || 15} XP · +${gold} 🪙</span>
            </div>
            ${rewardMini}
            ${dailyBadge ? `<div style="margin-top:5px;">${dailyBadge}</div>` : ''}
            <button class="notice-complete-btn" data-action="complete" ${n.completed ? 'disabled' : ''}>${btnLabel}</button>
          </div>
        `;
      }).join('');
    }

    function renderAll() {
      renderQuests();
      renderNotices();
      renderCalendar(currentYear, currentMonth);
      renderDayView();
      renderNoticeBoard();
      renderScratchpad();
      renderHeroPanel();
      applyThemeText();
    }

    function applyThemeText() {
      const t = currentText();
      safeSetText('nbTitle', t.noticeBoardTitle);
      safeSetText('nbScratchLabel', t.scratchLabel);
      const ta = document.getElementById('nbScratchpad');
      if (ta) ta.placeholder = t.scratchPlaceholder;
      safeSetText('ceremonyLabel', t.ceremonyLabel);
      safeSetText('ceremonyAccept', t.ceremonyAccept);
    }

    const today = { getFullYear: () => new Date().getFullYear(), getMonth: () => new Date().getMonth(), getDate: () => new Date().getDate() };
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();
    let selectedDateKey = todayKey();

    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    function getEventsForMonth(year, month) {
      const events = {};
      const maxDay = new Date(year, month + 1, 0).getDate();
      const addEvent = (day, type) => {
        const d = parseInt(day, 10);
        if (isNaN(d) || d < 1 || d > maxDay) return;
        if (!events[d]) events[d] = [];
        events[d].push(type);
      };
      state.quests.forEach(q => { if (q.day) addEvent(q.day, 'quest'); });
      state.notices.forEach(n => { if (n.day) addEvent(n.day, n.daily ? 'daily' : 'notice'); });
      const prefix = `${year}-${String(month+1).padStart(2,'0')}-`;
      (state.events || []).forEach(ev => {
        if (ev.dateKey && ev.dateKey.startsWith(prefix)) {
          const dayNum = parseInt(ev.dateKey.slice(8, 10), 10);
          addEvent(dayNum, 'calendar-event');
        }
      });
      return events;
    }

    function getCalendarEventsForDate(dateKey) {
      const evs = (state.events || []).filter(ev => ev.dateKey === dateKey);
      return evs.slice().sort((a, b) => {
        const ta = (a.time || '').trim();
        const tb = (b.time || '').trim();
        if (!ta && !tb) return 0;
        if (!ta) return 1;
        if (!tb) return -1;
        const norm = (s) => {
          const m = s.toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
          if (!m) return s.toLowerCase();
          let h = parseInt(m[1], 10);
          const min = m[2] ? parseInt(m[2], 10) : 0;
          const ap = m[3];
          if (ap === 'pm' && h < 12) h += 12;
          if (ap === 'am' && h === 12) h = 0;
          return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
        };
        return norm(ta).localeCompare(norm(tb));
      });
    }

    function renderCalendar(year, month) {
      monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
      const firstDay = new Date(year, month, 1).getDay();
      const weekdays = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const eventsMap = getEventsForMonth(year, month);

      calendarGrid.innerHTML = '';
      weekdays.forEach(day => {
        const d = document.createElement('div');
        d.classList.add('weekday'); d.textContent = day;
        calendarGrid.appendChild(d);
      });
      for (let i = 0; i < firstDay; i++) {
        const e = document.createElement('div');
        e.classList.add('calendar-day');
        e.style.opacity = '0.25'; e.style.pointerEvents = 'none';
        e.style.background = '#2e2012'; e.style.boxShadow = 'inset 0 -2px 0 #1a110a';
        e.style.borderColor = '#4d3823';
        calendarGrid.appendChild(e);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        const isToday = (year === today.getFullYear() && month === today.getMonth() && d === today.getDate());
        if (isToday) dayDiv.classList.add('today');
        const dateKey = dateKeyFrom(year, month, d);
        if (dateKey === selectedDateKey) dayDiv.classList.add('selected');

        const num = document.createElement('div');
        num.classList.add('day-number'); num.textContent = d;
        dayDiv.appendChild(num);

        const calendarEventsOnDay = getCalendarEventsForDate(dateKey);
        if (calendarEventsOnDay.length) {
          const lines = document.createElement('div');
          lines.classList.add('day-event-lines');
          calendarEventsOnDay.slice(0, 3).forEach(ev => {
            const line = document.createElement('div');
            line.classList.add('day-event-line');
            line.textContent = `${ev.emoji || '📅'} ${ev.title}`;
            line.title = `${ev.title}${ev.time ? ' · ' + ev.time : ''}`;
            lines.appendChild(line);
          });
          if (calendarEventsOnDay.length > 3) {
            const more = document.createElement('div');
            more.classList.add('day-event-line');
            more.style.fontStyle = 'italic';
            more.textContent = `+${calendarEventsOnDay.length - 3} more…`;
            lines.appendChild(more);
          }
          dayDiv.appendChild(lines);
        }

        const evs = eventsMap[d] || [];
        const evContainer = document.createElement('div');
        evContainer.classList.add('day-events');
        evs.slice(0, 4).forEach(t => {
          const dot = document.createElement('div');
          dot.classList.add('event-dot');
          if (t === 'quest') dot.classList.add('quest');
          if (t === 'daily') dot.classList.add('daily');
          if (t === 'calendar-event') dot.classList.add('calendar-event');
          evContainer.appendChild(dot);
        });
        if (evs.length > 4) {
          const more = document.createElement('span');
          more.style.fontSize = '0.6rem'; more.style.color = '#7a3b1e';
          more.style.fontWeight = 'bold'; more.textContent = `+${evs.length - 4}`;
          evContainer.appendChild(more);
        }
        dayDiv.appendChild(evContainer);

        dayDiv.addEventListener('click', () => {
          selectedDateKey = dateKeyFrom(year, month, d);
          renderCalendar(currentYear, currentMonth);
          renderDayView();
        });
        calendarGrid.appendChild(dayDiv);
      }
      const totalCells = firstDay + daysInMonth;
      const remaining = (7 - (totalCells % 7)) % 7;
      for (let i = 0; i < remaining; i++) {
        const e = document.createElement('div');
        e.classList.add('calendar-day');
        e.style.opacity = '0.2'; e.style.pointerEvents = 'none';
        e.style.background = '#2e2012'; e.style.borderColor = '#4d3823';
        calendarGrid.appendChild(e);
      }
    }

    document.getElementById('prevMonthBtn').addEventListener('click', () => {
      currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar(currentYear, currentMonth);
    });
    document.getElementById('nextMonthBtn').addEventListener('click', () => {
      currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar(currentYear, currentMonth);
    });

    const dvTitleEl = document.getElementById('dvTitle');
    const dvWeekdayEl = document.getElementById('dvWeekday');
    const dvTodayBtn = document.getElementById('dvTodayBtn');
    const dvEventsList = document.getElementById('dvEventsList');
    const dvQuestsList = document.getElementById('dvQuestsList');
    const dvNoticesList = document.getElementById('dvNoticesList');

    function renderDayView() {
      if (!selectedDateKey) selectedDateKey = todayKey();
      const [y, m, d] = selectedDateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const weekdayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      dvTitleEl.textContent = `${d} ${monthNames[m-1]} ${y}`;
      dvWeekdayEl.textContent = weekdayNames[dateObj.getDay()].toUpperCase();

      const isTodaySelected = (selectedDateKey === todayKey());
      if (isTodaySelected) {
        dvTodayBtn.disabled = true;
        dvTodayBtn.style.opacity = '0.5';
      } else {
        dvTodayBtn.disabled = false;
        dvTodayBtn.style.opacity = '1';
      }

      const dayEvents = getCalendarEventsForDate(selectedDateKey);
      document.getElementById('dvEventsCount').textContent = dayEvents.length;
      if (!dayEvents.length) {
        dvEventsList.innerHTML = '<div class="dv-empty">No events. Free day!</div>';
      } else {
        dvEventsList.innerHTML = dayEvents.map(ev => `
          <div class="dv-item event-item" data-event-id="${escapeHtml(ev.id)}">
            <div class="dv-item-body">
              <div class="dv-item-title">${escapeHtml(ev.emoji || '📅')} ${escapeHtml(ev.title)}</div>
              ${ev.time ? `<div class="dv-item-meta">🕐 ${escapeHtml(ev.time)}</div>` : ''}
              ${ev.note ? `<div class="dv-item-meta">📝 ${escapeHtml(ev.note)}</div>` : ''}
            </div>
            <div class="dv-item-actions">
              <button data-action="edit-event" title="Edit">✏️</button>
              <button data-action="delete-event" class="danger" title="Delete">🗑️</button>
            </div>
          </div>
        `).join('');
      }

      const dayQuests = state.quests.filter(q => parseInt(q.day, 10) === d);
      document.getElementById('dvQuestsCount').textContent = dayQuests.length;
      if (!dayQuests.length) {
        dvQuestsList.innerHTML = '<div class="dv-empty">No quests scheduled for this day.</div>';
      } else {
        dvQuestsList.innerHTML = dayQuests.map(q => `
          <div class="dv-item${q.completed ? ' done-item' : ''}">
            <div class="dv-item-body">
              <div class="dv-item-title">${escapeHtml(q.emoji || '⚔️')} ${escapeHtml(q.title)}${q.completed ? ' ✓' : ''}</div>
              ${q.reward ? `<div class="dv-item-meta">🎁 ${escapeHtml(q.reward)}</div>` : ''}
            </div>
          </div>
        `).join('');
      }

      const dayNotices = state.notices.filter(n => {
        if (parseInt(n.day, 10) === d) return true;
        if (isTodaySelected && n.daily) return true;
        return false;
      });
      document.getElementById('dvNoticesCount').textContent = dayNotices.length;
      if (!dayNotices.length) {
        dvNoticesList.innerHTML = '<div class="dv-empty">No notices on this day.</div>';
      } else {
        dvNoticesList.innerHTML = dayNotices.map(n => `
          <div class="dv-item notice-item${n.completed ? ' done-item' : ''}">
            <div class="dv-item-body">
              <div class="dv-item-title">${escapeHtml(n.emoji || '📌')} ${escapeHtml(n.text)}${n.completed ? ' ✓' : ''}</div>
              ${n.daily ? `<div class="dv-item-meta">🔁 daily${isTodaySelected && parseInt(n.day, 10) !== d ? ' · auto today' : ''}</div>` : ''}
            </div>
          </div>
        `).join('');
      }
    }

    dvTodayBtn.addEventListener('click', () => {
      selectedDateKey = todayKey();
      currentYear = today.getFullYear();
      currentMonth = today.getMonth();
      renderCalendar(currentYear, currentMonth);
      renderDayView();
    });

    document.getElementById('dvAddEventBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEventModal(null, selectedDateKey);
    });

    dvEventsList.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const item = e.target.closest('.dv-item');
      if (!item) return;
      const id = item.dataset.eventId;
      const ev = (state.events || []).find(x => x.id === id);
      if (!ev) return;
      const action = actionEl.dataset.action;
      if (action === 'edit-event') openEventModal(ev, ev.dateKey);
      else if (action === 'delete-event') {
        if (confirm(`Delete event "${ev.title}"?`)) {
          state.events = state.events.filter(x => x.id !== id);
          saveState();
          renderDayView();
          renderCalendar(currentYear, currentMonth);
          showToast('🗑️ Event removed');
        }
      }
    });

    const eventModal = document.getElementById('eventModal');
    const eventModalTitle = document.getElementById('eventModalTitle');
    const eventIdEl = document.getElementById('eventId');
    const eventDateKeyEl = document.getElementById('eventDateKey');
    const eventTitleEl = document.getElementById('eventTitle');
    const eventEmojiEl = document.getElementById('eventEmoji');
    const eventTimeEl = document.getElementById('eventTime');
    const eventNoteEl = document.getElementById('eventNote');

    function openEventModal(ev, dateKey) {
      if (ev) {
        eventModalTitle.textContent = '✏️ Edit Event';
        eventIdEl.value = ev.id;
        eventDateKeyEl.value = ev.dateKey;
        eventTitleEl.value = ev.title || '';
        eventEmojiEl.value = ev.emoji || '';
        eventTimeEl.value = ev.time || '';
        eventNoteEl.value = ev.note || '';
      } else {
        eventModalTitle.textContent = '📅 New Event';
        eventIdEl.value = '';
        eventDateKeyEl.value = dateKey || todayKey();
        eventTitleEl.value = '';
        eventEmojiEl.value = '';
        eventTimeEl.value = '';
        eventNoteEl.value = '';
      }
      eventModal.classList.add('active');
      setTimeout(() => eventTitleEl.focus(), 50);
    }

    function closeEventModal() { eventModal.classList.remove('active'); }

    document.getElementById('eventCancel').addEventListener('click', closeEventModal);
    eventModal.addEventListener('click', (e) => { if (e.target === eventModal) closeEventModal(); });

    document.getElementById('eventSave').addEventListener('click', () => {
      const title = eventTitleEl.value.trim();
      if (!title) { showToast('⚠️ Event needs a title'); eventTitleEl.focus(); return; }
      const dateKey = eventDateKeyEl.value || todayKey();
      if (!state.events) state.events = [];
      const existing = eventIdEl.value ? state.events.find(x => x.id === eventIdEl.value) : null;
      const ev = {
        id: eventIdEl.value || uid(),
        dateKey,
        title,
        emoji: eventEmojiEl.value.trim() || '📅',
        time: eventTimeEl.value.trim(),
        note: eventNoteEl.value.trim()
      };
      if (eventIdEl.value) {
        const i = state.events.findIndex(x => x.id === eventIdEl.value);
        if (i >= 0) state.events[i] = ev;
        showToast('✓ Event updated');
      } else {
        state.events.push(ev);
        showToast('📅 Event added');
      }
      saveState();
      renderCalendar(currentYear, currentMonth);
      closeEventModal();
      setTimeout(() => renderDayView(), 30);
    });

    const NB_STORAGE_KEY = 'questBoardNoticeBoard_v1';

    function loadNoticeBoard() {
      try {
        const raw = localStorage.getItem(NB_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) { /* ignore */ }
      return { cardIndex: null, cardDate: null, scratchpad: '' };
    }
    function saveNoticeBoard(nb) {
      try { localStorage.setItem(NB_STORAGE_KEY, JSON.stringify(nb)); }
      catch (e) { /* ignore */ }
    }

    let noticeBoard = loadNoticeBoard();
    const flushNB = () => { const t = document.getElementById('nbScratchpad'); if (t) noticeBoard.scratchpad = t.value; saveNoticeBoard(noticeBoard); };
    window.addEventListener('pagehide', flushNB);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flushNB(); });
    document.addEventListener('focusout', e => { if (e.target && e.target.id === 'nbScratchpad') flushNB(); });

    function pickFlavourCard(forceNew) {
      const todayStr = todayKey();
      if (!forceNew && noticeBoard.cardDate === todayStr && noticeBoard.cardIndex !== null
          && allCards()[noticeBoard.cardIndex]) {
        return allCards()[noticeBoard.cardIndex];
      }
      let idx;
      if (allCards().length > 1 && noticeBoard.cardIndex !== null) {
        do { idx = Math.floor(Math.random() * allCards().length); }
        while (idx === noticeBoard.cardIndex);
      } else {
        idx = Math.floor(Math.random() * allCards().length);
      }
      noticeBoard.cardIndex = idx;
      noticeBoard.cardDate = todayStr;
      saveNoticeBoard(noticeBoard);
      return allCards()[idx];
    }

    function renderNoticeBoard() {
      const cardEl = document.getElementById('nbCard');
      if (!cardEl) return;
      const card = pickFlavourCard(false);
      if (!card) { cardEl.innerHTML = ''; return; }
      const label = card.cat === 'custom' ? (card.title || currentFlavourLabel('custom')) : currentFlavourLabel(card.cat);
      const bodyHtml = card.body.split('\n').map(l => escapeHtml(l)).join('<br>');
      const attributionHtml = card.attribution
        ? `<span class="nb-card-attribution">${escapeHtml(card.attribution)}</span>`
        : '';
      cardEl.innerHTML = `
        <div class="nb-card-category">${escapeHtml(label)}</div>
        <div class="nb-card-body">
          
          ${bodyHtml}
          ${attributionHtml}
        </div>
      `;
    }

    function renderScratchpad() {
      const ta = document.getElementById('nbScratchpad');
      if (!ta) return;
      ta.value = noticeBoard.scratchpad || '';
    }

    function bindNoticeBoard() {
      const rerollBtn = document.getElementById('nbRerollBtn');
      if (rerollBtn) {
        rerollBtn.addEventListener('click', () => {
          pickFlavourCard(true);
          renderNoticeBoard();
          showToast('🎲 A new notice has been pinned');
        });
      }

      const clearBtn = document.getElementById('nbClearBtn');
      const ta = document.getElementById('nbScratchpad');
      if (clearBtn && ta) {
        clearBtn.addEventListener('click', () => {
          if (!ta.value.trim()) return;
          if (confirm('Clear the scratchpad?')) {
            ta.value = '';
            noticeBoard.scratchpad = '';
            saveNoticeBoard(noticeBoard);
            showToast('🗑️ Scratchpad cleared');
          }
        });
      }

      if (ta) {
        let saveTimer = null;
        ta.addEventListener('input', () => {
          noticeBoard.scratchpad = ta.value;
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => saveNoticeBoard(noticeBoard), 400);
        });
      }
    }

    function buildRewardPresets(container, selectedDisplay, inputEl) {
      container.innerHTML = '';
      const featured = [
        ...REWARD_PRESETS.quick.slice(0, 6),
        ...REWARD_PRESETS.medium.slice(0, 6),
        ...REWARD_PRESETS.big.slice(0, 4)
      ];
      featured.forEach(preset => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'reward-chip';
        chip.innerHTML = `<span>${preset.emoji}</span> ${preset.text}`;
        const label = `${preset.emoji} ${preset.text}`;
        chip.addEventListener('click', () => {
          inputEl.value = label;
          container.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedDisplay.textContent = label;
        });
        container.appendChild(chip);
      });
    }

    let activeQuestCat = 'all';
    let activeNoticeCat = 'all';

    function buildTemplateCats(container, which) {
      container.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'template-cat-btn active';
      allBtn.textContent = '✨ All';
      allBtn.dataset.cat = 'all';
      container.appendChild(allBtn);
      Object.keys(CATEGORY_LABELS).forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'template-cat-btn';
        btn.textContent = CATEGORY_LABELS[cat];
        btn.dataset.cat = cat;
        container.appendChild(btn);
      });
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.template-cat-btn');
        if (!btn) return;
        container.querySelectorAll('.template-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (which === 'quest') activeQuestCat = btn.dataset.cat;
        else activeNoticeCat = btn.dataset.cat;
        renderTemplateList(which);
      });
    }

    function renderTemplateList(which) {
      const listEl = which === 'quest'
        ? document.getElementById('templateList')
        : document.getElementById('noticeTemplateList');
      const cat = which === 'quest' ? activeQuestCat : activeNoticeCat;
      const source = which === 'quest' ? TEMPLATES : TEMPLATES.filter(t => t.cat === 'tiny' || t.cat === 'pet-care' || t.cat === 'self-care' || t.cat === 'creative' || t.cat === 'home' || t.cat === 'food');
      const filtered = cat === 'all' ? source : source.filter(t => t.cat === cat);

      if (!filtered.length) {
        listEl.innerHTML = '<div style="color:#7a5a3b;font-style:italic;font-size:0.8rem;padding:8px;">No templates in this category yet.</div>';
        return;
      }
      listEl.innerHTML = filtered.map((t) => {
        const tags = (t.tags || []).map(tag => `<span class="tpl-tag">${escapeHtml(tag)}</span>`).join('');
        const stepInfo = t.steps ? ` · ${t.steps.length} steps` : '';
        return `
          <button type="button" class="template-item" data-idx="${TEMPLATES.indexOf(t)}" data-which="${which}">
            <span class="tpl-emoji">${escapeHtml(t.emoji)}</span>
            <span class="tpl-body">
              <span class="tpl-title">${escapeHtml(t.title)}</span>
              <span class="tpl-meta">${escapeHtml(t.deadline)}${stepInfo} · reward: ${escapeHtml(t.reward)}</span>
              ${tags ? `<span class="tpl-tags">${tags}</span>` : ''}
            </span>
          </button>
        `;
      }).join('');
    }

    function loadTemplateIntoQuestForm(t) {
      document.getElementById('questTitle').value = t.title;
      document.getElementById('questEmoji').value = t.emoji;
      document.getElementById('questRank').value = t.rank;
      document.getElementById('questReward').value = t.reward;
      document.getElementById('questDeadline').value = t.deadline;
      document.getElementById('rewardSelectedText').textContent = t.reward || 'No reward chosen yet';
      rewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));

      if (t.steps && t.steps.length) {
        document.getElementById('questDesc').value = t.desc || '';
        buildStepsEditor(t.steps.map(s => ({ text: s, done: false })));
      } else if (t.desc) {
        document.getElementById('questDesc').value = Array.isArray(t.desc) ? t.desc.join('\n') : t.desc;
        buildStepsEditor([]);
      } else {
        document.getElementById('questDesc').value = '';
        buildStepsEditor([]);
      }
      showToast(`📜 Template loaded: ${t.title}`);
    }

    function loadTemplateIntoNoticeForm(t) {
      document.getElementById('noticeText').value = t.title;
      document.getElementById('noticeEmoji').value = t.emoji;
      document.getElementById('noticeWhen').value = t.deadline;
      const xpMap = { common: 15, rare: 25, epic: 40, legendary: 60 };
      document.getElementById('noticeXp').value = xpMap[t.rank] || 15;
      document.getElementById('noticeReward').value = t.reward;
      document.getElementById('noticeRewardSelectedText').textContent = t.reward || 'No reward chosen';
      noticeRewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
      showToast(`📜 Template loaded: ${t.title}`);
    }

    document.getElementById('questModal').addEventListener('click', (e) => {
      const item = e.target.closest('.template-item');
      if (!item) return;
      const t = TEMPLATES[parseInt(item.dataset.idx, 10)];
      if (!t) return;
      loadTemplateIntoQuestForm(t);
    });

    document.getElementById('noticeModal').addEventListener('click', (e) => {
      const item = e.target.closest('.template-item');
      if (!item) return;
      const t = TEMPLATES[parseInt(item.dataset.idx, 10)];
      if (!t) return;
      loadTemplateIntoNoticeForm(t);
    });

    buildTemplateCats(document.getElementById('templateCats'), 'quest');
    buildTemplateCats(document.getElementById('noticeTemplateCats'), 'notice');
    renderTemplateList('quest');
    renderTemplateList('notice');

    function renderLibrary() {
      const grid = document.getElementById('libraryGrid');
      grid.innerHTML = TEMPLATES.map((t, idx) => {
        const stepBadge = t.steps ? `<span class="lib-badge">🧭 ${t.steps.length} steps</span>` : '';
        const firstDesc = t.steps ? t.steps[0] : (Array.isArray(t.desc) ? t.desc[0] : t.desc) || '';
        return `
          <button type="button" class="lib-card" data-idx="${idx}">
            <div class="lib-title"><span class="lib-emoji">${escapeHtml(t.emoji)}</span>${escapeHtml(t.title)}</div>
            <div class="lib-desc">${escapeHtml(firstDesc)}</div>
            <div class="lib-reward">🎁 ${escapeHtml(t.reward || 'XP only')}</div>
            ${stepBadge}
            <div class="lib-desc" style="font-size:0.62rem;opacity:0.7;">${CATEGORY_LABELS[t.cat] || ''} · ${escapeHtml(t.deadline)}</div>
          </button>
        `;
      }).join('');
      grid.querySelectorAll('.lib-card').forEach(card => {
        card.addEventListener('click', () => {
          const t = TEMPLATES[parseInt(card.dataset.idx, 10)];
          if (!t) return;
          document.getElementById('libraryModal').classList.remove('active');
          openQuestModal(null);
          loadTemplateIntoQuestForm(t);
        });
      });
    }

    document.getElementById('openLibraryBtn').addEventListener('click', () => {
      renderLibrary();
      document.getElementById('libraryModal').classList.add('active');
    });
    document.getElementById('libraryClose').addEventListener('click', () => {
      document.getElementById('libraryModal').classList.remove('active');
    });
    document.getElementById('libraryModal').addEventListener('click', (e) => {
      if (e.target.id === 'libraryModal') e.currentTarget.classList.remove('active');
    });

    const stepsEditorEl = document.getElementById('stepsEditor');
    let editingSteps = [];

    function buildStepsEditor(steps) {
      editingSteps = steps.map(s => ({ text: s.text || '', done: !!s.done }));
      renderStepsEditor();
    }

    function renderStepsEditor() {
      if (!editingSteps.length) {
        stepsEditorEl.innerHTML = '<div style="font-size:0.75rem;color:#7a5a3b;font-style:italic;padding:4px 0;">No sub-steps. Add some below if this quest is a bigger adventure.</div>';
        return;
      }
      stepsEditorEl.innerHTML = editingSteps.map((s, i) => `
        <div class="step-row">
          <input type="text" value="${escapeHtml(s.text)}" data-step-index="${i}" placeholder="Step — or start with # for a phase heading">
          <button type="button" data-remove-step="${i}" title="Remove">×</button>
        </div>
      `).join('');
      stepsEditorEl.querySelectorAll('input[data-step-index]').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.stepIndex, 10);
          editingSteps[idx].text = e.target.value;
        });
      });
      stepsEditorEl.querySelectorAll('button[data-remove-step]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.removeStep, 10);
          editingSteps.splice(idx, 1);
          renderStepsEditor();
        });
      });
    }

    document.getElementById('addStepBtn').addEventListener('click', () => {
      editingSteps.push({ text: '', done: false });
      renderStepsEditor();
      const inputs = stepsEditorEl.querySelectorAll('input[data-step-index]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });

    const questModal = document.getElementById('questModal');
    const questModalTitle = document.getElementById('questModalTitle');
    const questIdEl = document.getElementById('questId');
    const questTitleEl = document.getElementById('questTitle');
    const questEmojiEl = document.getElementById('questEmoji');
    const questRankEl = document.getElementById('questRank');
    const questDescEl = document.getElementById('questDesc');
    const questRewardEl = document.getElementById('questReward');
    const questDeadlineEl = document.getElementById('questDeadline');
    const questDayEl = document.getElementById('questDay');
    const rewardPresetsEl = document.getElementById('rewardPresets');
    const rewardSelectedDisplay = document.getElementById('rewardSelectedText');

    buildRewardPresets(rewardPresetsEl, rewardSelectedDisplay, questRewardEl);
    questRewardEl.addEventListener('input', () => {
      rewardSelectedDisplay.textContent = questRewardEl.value || 'No reward chosen yet';
      rewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
    });

    document.getElementById('randomRewardBtn').addEventListener('click', () => {
      const pick = ALL_REWARDS[Math.floor(Math.random() * ALL_REWARDS.length)];
      const label = `${pick.emoji} ${pick.text}`;
      questRewardEl.value = label;
      rewardSelectedDisplay.textContent = label;
      rewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
      showToast(`🎲 ${label}`);
    });

    function openQuestModal(quest) {
      if (quest) {
        questModalTitle.textContent = '✏️ Edit Quest';
        questIdEl.value = quest.id;
        questTitleEl.value = quest.title || '';
        questEmojiEl.value = quest.emoji || '';
        questRankEl.value = quest.rank || 'common';
        questDescEl.value = (typeof quest.desc === 'string' ? quest.desc : '');
        questRewardEl.value = quest.reward || '';
        rewardSelectedDisplay.textContent = quest.reward || 'No reward chosen yet';
        questDeadlineEl.value = quest.deadline || '';
        questDayEl.value = quest.day || '';
        buildStepsEditor(Array.isArray(quest.steps) ? quest.steps : []);
      } else {
        questModalTitle.textContent = '⚔️ New Quest';
        questIdEl.value = '';
        questTitleEl.value = '';
        questEmojiEl.value = '';
        questRankEl.value = 'rare';
        questDescEl.value = '';
        questRewardEl.value = '';
        rewardSelectedDisplay.textContent = 'No reward chosen yet';
        questDeadlineEl.value = '';
        questDayEl.value = '';
        buildStepsEditor([]);
      }
      rewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
      questModal.classList.add('active');
      setTimeout(() => questTitleEl.focus(), 50);
    }

    function closeQuestModal() { questModal.classList.remove('active'); }

    document.getElementById('addQuestBtn').addEventListener('click', () => openQuestModal(null));
    document.getElementById('questCancel').addEventListener('click', closeQuestModal);
    questModal.addEventListener('click', (e) => { if (e.target === questModal) closeQuestModal(); });

    document.getElementById('questSave').addEventListener('click', () => {
      const title = questTitleEl.value.trim();
      if (!title) { showToast('⚠️ Quest needs a title'); questTitleEl.focus(); return; }
      const dayNum = parseInt(questDayEl.value, 10);
      const existing = questIdEl.value ? state.quests.find(q => q.id === questIdEl.value) : null;

      const newSteps = editingSteps
        .map(s => s.text.trim())
        .filter(Boolean)
        .map(text => {
          if (existing && Array.isArray(existing.steps)) {
            const match = existing.steps.find(es => es.text === text);
            if (match) return { text, done: !!match.done };
          }
          return { text, done: false };
        });

      const quest = {
        id: questIdEl.value || uid(),
        title,
        emoji: questEmojiEl.value.trim() || '⚔️',
        rank: questRankEl.value,
        desc: questDescEl.value.trim(),
        steps: newSteps,
        reward: questRewardEl.value.trim(),
        deadline: questDeadlineEl.value.trim(),
        day: isNaN(dayNum) ? null : Math.min(31, Math.max(1, dayNum)),
        completed: existing ? existing.completed : false,
        completedAt: existing ? existing.completedAt : null,
        pinned: existing ? (existing.pinned !== undefined ? existing.pinned : true) : true,
        stepsExpanded: existing ? !!existing.stepsExpanded : false
      };
      if (questIdEl.value) {
        const i = state.quests.findIndex(q => q.id === questIdEl.value);
        if (i >= 0) state.quests[i] = quest;
        showToast('✓ Quest updated');
      } else {
        state.quests.unshift(quest);
        showToast('⚔️ Quest forged');
      }
      saveState(); renderAll(); closeQuestModal();
    });

    const noticeModal = document.getElementById('noticeModal');
    const noticeModalTitle = document.getElementById('noticeModalTitle');
    const noticeIdEl = document.getElementById('noticeId');
    const noticeTextEl = document.getElementById('noticeText');
    const noticeEmojiEl = document.getElementById('noticeEmoji');
    const noticeWhenEl = document.getElementById('noticeWhen');
    const noticeXpEl = document.getElementById('noticeXp');
    const noticeDayEl = document.getElementById('noticeDay');
    const noticeDailyEl = document.getElementById('noticeDaily');
    const noticeRewardEl = document.getElementById('noticeReward');
    const noticeRewardPresetsEl = document.getElementById('noticeRewardPresets');
    const noticeRewardSelectedDisplay = document.getElementById('noticeRewardSelectedText');

    buildRewardPresets(noticeRewardPresetsEl, noticeRewardSelectedDisplay, noticeRewardEl);
    noticeRewardEl.addEventListener('input', () => {
      noticeRewardSelectedDisplay.textContent = noticeRewardEl.value || 'No reward chosen';
      noticeRewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
    });

    document.getElementById('noticeRandomRewardBtn').addEventListener('click', () => {
      const pick = REWARD_PRESETS.quick[Math.floor(Math.random() * REWARD_PRESETS.quick.length)];
      const label = `${pick.emoji} ${pick.text}`;
      noticeRewardEl.value = label;
      noticeRewardSelectedDisplay.textContent = label;
      noticeRewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
      showToast(`🎲 ${label}`);
    });

    function openNoticeModal(notice) {
      if (notice) {
        noticeModalTitle.textContent = '✏️ Edit Notice';
        noticeIdEl.value = notice.id;
        noticeTextEl.value = notice.text || '';
        noticeEmojiEl.value = notice.emoji || '';
        noticeWhenEl.value = notice.when || '';
        noticeXpEl.value = notice.xp || 15;
        noticeDayEl.value = notice.day || '';
        noticeDailyEl.checked = !!notice.daily;
        noticeRewardEl.value = notice.reward || '';
        noticeRewardSelectedDisplay.textContent = notice.reward || 'No reward chosen';
      } else {
        noticeModalTitle.textContent = '📜 New Notice';
        noticeIdEl.value = '';
        noticeTextEl.value = '';
        noticeEmojiEl.value = '';
        noticeWhenEl.value = '';
        noticeXpEl.value = 15;
        noticeDayEl.value = '';
        noticeDailyEl.checked = false;
        noticeRewardEl.value = '';
        noticeRewardSelectedDisplay.textContent = 'No reward chosen';
      }
      noticeRewardPresetsEl.querySelectorAll('.reward-chip').forEach(c => c.classList.remove('selected'));
      noticeModal.classList.add('active');
      setTimeout(() => noticeTextEl.focus(), 50);
    }

    function closeNoticeModal() { noticeModal.classList.remove('active'); }

    document.getElementById('addNoticeBtn').addEventListener('click', () => openNoticeModal(null));
    document.getElementById('noticeCancel').addEventListener('click', closeNoticeModal);
    noticeModal.addEventListener('click', (e) => { if (e.target === noticeModal) closeNoticeModal(); });

    document.getElementById('noticeSave').addEventListener('click', () => {
      const text = noticeTextEl.value.trim();
      if (!text) { showToast('⚠️ Notice needs some text'); noticeTextEl.focus(); return; }
      const dayNum = parseInt(noticeDayEl.value, 10);
      const xpVal = parseInt(noticeXpEl.value, 10);
      const existing = noticeIdEl.value ? state.notices.find(n => n.id === noticeIdEl.value) : null;
      const notice = {
        id: noticeIdEl.value || uid(),
        text,
        emoji: noticeEmojiEl.value.trim() || '📌',
        when: noticeWhenEl.value.trim(),
        xp: isNaN(xpVal) ? 15 : Math.min(500, Math.max(1, xpVal)),
        day: isNaN(dayNum) ? null : Math.min(31, Math.max(1, dayNum)),
        daily: noticeDailyEl.checked,
        completed: existing ? existing.completed : false,
        completedAt: existing ? existing.completedAt : null,
        lastCompletedDate: existing ? existing.lastCompletedDate : null,
        reward: noticeRewardEl.value.trim()
      };
      if (noticeIdEl.value) {
        const i = state.notices.findIndex(n => n.id === noticeIdEl.value);
        if (i >= 0) state.notices[i] = notice;
        showToast('✓ Notice updated');
      } else {
        state.notices.unshift(notice);
        showToast('📌 Notice pinned');
      }
      saveState(); renderAll(); closeNoticeModal();
    });

    questPostersEl.addEventListener('click', (e) => {
      const toggleEl = e.target.closest('[data-action="toggle-steps"]');
      if (toggleEl) {
        e.stopPropagation();
        const poster = toggleEl.closest('.quest-poster-wrap');
        if (!poster) return;
        const id = poster.dataset.id;
        const quest = state.quests.find(q => q.id === id);
        if (!quest) return;
        quest.stepsExpanded = !quest.stepsExpanded;
        saveState();
        renderQuests();
        return;
      }

      const splitEl = e.target.closest('[data-action="split-step"]');
      if (splitEl) {
        e.stopPropagation();
        const wrap = splitEl.closest('.quest-poster-wrap');
        const quest = wrap && state.quests.find(q => q.id === wrap.dataset.id);
        const idx = parseInt(splitEl.closest('.poster-step').dataset.stepIdx, 10);
        if (!quest || !quest.steps[idx]) return;
        const txt = prompt('Break this step into smaller ones (separate with ; or new lines)', '');
        const parts = (txt || '').split(/[;\n]/).map(t => t.trim()).filter(Boolean);
        if (!parts.length) return;

        const beforeSteps = JSON.parse(JSON.stringify(quest.steps));
        const originalText = quest.steps[idx].text;
        quest.steps.splice(idx, 1,
          { text: '# ' + originalText, done: false },
          ...parts.map(t => ({ text: t, done: false }))
        );
        saveState(); renderQuests();

        showToastWithUndo(`🧩 Split into ${parts.length} smaller steps`, () => {
          quest.steps = beforeSteps;
          saveState(); renderQuests();
          showToast('↩️ Split undone');
        });
        return;
      }

      const stepEl = e.target.closest('.poster-step');
      if (stepEl) {
        e.stopPropagation();
        const poster = stepEl.closest('.quest-poster-wrap');
        if (!poster) return;
        const id = poster.dataset.id;
        const quest = state.quests.find(q => q.id === id);
        if (!quest || quest.completed) return;
        const idx = parseInt(stepEl.dataset.stepIdx, 10);
        if (isNaN(idx) || !quest.steps || !quest.steps[idx]) return;
        const st = quest.steps[idx]; st.done = !st.done;
        if (st.done && !st.xpGiven) {
          st.xpGiven = true;
          awardXP(STEP_XP, null);
        }
        saveState();
        renderQuests();
        if (quest.steps[idx].done) {
          const remaining = quest.steps.filter(s => !s.done && !isPhase(s)).length;
          if (remaining === 0) showToast(`🧭 All steps done! Claim the reward.`);
          else showToast(`✓ Step done — ${remaining} left`);
        }
        return;
      }

      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const poster = actionEl.closest('.quest-poster-wrap');
      if (!poster) return;
      const id = poster.dataset.id;
      const quest = state.quests.find(q => q.id === id);
      if (!quest) return;
      const action = actionEl.dataset.action;

      if (action === 'toggle-focus') { e.stopPropagation(); quest.focus = !quest.focus; saveState(); renderQuests(); }
      else if (action === 'toggle-pin') {
        e.stopPropagation();
        quest.pinned = !quest.pinned;
        saveState(); renderQuests();
        showToast(quest.pinned ? '📌 Quest pinned' : '📌 Quest unpinned');
      }
      else if (action === 'edit') { e.stopPropagation(); openQuestModal(quest); }
      else if (action === 'delete') {
        e.stopPropagation();
        if (confirm(`Delete quest "${quest.title}"?`)) {
          state.quests = state.quests.filter(q => q.id !== id);
          saveState(); renderAll();
          showToast('🗑️ Quest removed');
        }
      } else if (action === 'complete') {
        e.stopPropagation();
        if (quest.completed) return;
        if (Array.isArray(quest.steps) && quest.steps.length) {
          const remaining = quest.steps.filter(s => !s.done && !isPhase(s)).length;
          if (remaining > 0) {
            showToast(`🧭 ${remaining} step${remaining === 1 ? '' : 's'} left — you are nearly there`);
            return;
          }
        }
        quest.completed = true;
        quest.completedAt = new Date().toISOString();
        saveState();
        renderQuests();
        const xp = RANK_XP[quest.rank] || 50;
        setTimeout(() => {
          const r = awardXP(xp, null);
          showRewardCeremony(quest.title, quest.reward, xp, r.gold, quest.emoji || '🏆');
        }, 30);
      }
    });

    questPostersEl.addEventListener('contextmenu', (e) => {
      const poster = e.target.closest('.quest-poster-wrap');
      if (!poster) return;
      if (e.target.closest('[data-action]') || e.target.closest('.poster-step')) return;
      e.preventDefault();
      const id = poster.dataset.id;
      const quest = state.quests.find(q => q.id === id);
      if (!quest) return;
      quest.pinned = !quest.pinned;
      saveState();
      renderQuests();
      showToast(quest.pinned ? '📌 Quest pinned' : '📌 Quest unpinned');
    });

    noticesGridEl.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const sticky = e.target.closest('.notice-sticky');
      if (!sticky) return;
      const id = sticky.dataset.id;
      const notice = state.notices.find(n => n.id === id);
      if (!notice) return;
      const action = actionEl.dataset.action;

      if (action === 'edit') { e.stopPropagation(); openNoticeModal(notice); }
      else if (action === 'delete') {
        e.stopPropagation();
        if (confirm(`Delete notice "${notice.text}"?`)) {
          state.notices = state.notices.filter(n => n.id !== id);
          saveState(); renderAll();
          showToast('🗑️ Notice removed');
        }
      } else if (action === 'complete') {
        e.stopPropagation();
        if (notice.completed) return;
        notice.completed = true;
        notice.completedAt = new Date().toISOString();
        if (notice.daily) notice.lastCompletedDate = todayKey();
        saveState();
        renderNotices();
        const xp = notice.xp || 15;
        setTimeout(() => {
          const r = awardXP(xp, null, { isSmallTask: true });
          if (notice.reward && !notice.daily) {
            showRewardCeremony(notice.text, notice.reward, xp, r.gold, notice.emoji || '📌');
          } else if (notice.reward && notice.daily) {
            showToast(`✓ ${notice.text} · 🎁 ${notice.reward} · +${r.gold} 🪙`);
          } else {
            showToast(`✓ ${notice.text} done! +${xp} XP · +${r.gold} 🪙`);
          }
        }, 30);
      }
    });

    document.getElementById('ceremonyAccept').addEventListener('click', closeRewardCeremony);
    document.getElementById('rewardOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'rewardOverlay') closeRewardCeremony();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      const dataStr = JSON.stringify({ ...state, _extras: { scratchpad: noticeBoard.scratchpad || '', theme: currentTheme } }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `quest-board-backup-${stamp}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📤 Backup downloaded');
    });

    const importFile = document.getElementById('importFile');
    document.getElementById('importBtn').addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!parsed || !Array.isArray(parsed.quests) || !Array.isArray(parsed.notices)) throw new Error('Invalid format');
          if (confirm(`Import ${parsed.quests.length} quests and ${parsed.notices.length} notices?`)) {
            state = parsed;
            if (parsed._extras) { noticeBoard.scratchpad = parsed._extras.scratchpad || ''; saveNoticeBoard(noticeBoard); renderScratchpad(); if (parsed._extras.theme) applyTheme(parsed._extras.theme); delete state._extras; }
            if (!Array.isArray(state.events)) state.events = [];
            if (!state.meta) state.meta = { xpTotal: 0, level: 1, streak: 0, lastActiveDate: null, lastStreakDate: null, streakEnabled: false, streakGraceDays: 2 };
            if (state.meta.streakEnabled === undefined) state.meta.streakEnabled = false;
            if (state.meta.streakGraceDays === undefined) state.meta.streakGraceDays = 2;
            ensureEconomy();
            saveState(); renderAll();
            showToast('📥 Board imported');
          }
        } catch (err) {
          console.error(err);
          alert('⚠️ Could not read that file.');
        }
        importFile.value = '';
      };
      reader.readAsText(file);
    });

    document.getElementById('resetXpBtn').addEventListener('click', () => {
      if (confirm('Reset XP, level, and streak to zero?\n\nYour tasks and notices will stay. Gold is kept.')) {
        state.meta.xpTotal = 0;
        state.meta.level = 1;
        state.meta.streak = 0;
        state.meta.lastStreakDate = null;
        saveState(); renderHeroPanel();
        showToast('↺ Progress reset');
      }
    });

    const streakToggleEl = document.getElementById('streakToggle');
    if (streakToggleEl) {
      streakToggleEl.addEventListener('click', () => {
        state.meta.streakEnabled = false;
        saveState();
        renderAll();
        showToast('🔥 Streak hidden — no pressure!');
      });
    }

    const showStreakBtnEl = document.getElementById('showStreakBtn');
    if (showStreakBtnEl) {
      showStreakBtnEl.addEventListener('click', () => {
        state.meta.streakEnabled = true;
        saveState();
        renderAll();
        showToast('🔥 Streak visible again');
      });
    }

    const themePickerEl = document.getElementById('themePicker');
    function buildThemeOptions() {
      if (!themePickerEl) return;
      themePickerEl.innerHTML = Object.keys(THEME_SHOP).map(id => `<option value="${id}">${state.meta.ownedThemes.includes(id) ? '' : '🔒 '}${THEME_SHOP[id].label}</option>`).join('');
      themePickerEl.value = currentTheme;
    }
    buildThemeOptions();
    function applyTheme(theme) {
      if (!['medieval','pirate','forest','scifi','neon','redalert'].includes(theme)) theme = 'medieval';
      currentTheme = theme;
      document.body.setAttribute('data-theme', theme);
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
      if (themePickerEl) themePickerEl.value = theme;
      renderAll();
    }
    if (themePickerEl) {
      themePickerEl.value = currentTheme;
      themePickerEl.addEventListener('change', (e) => {
        const chosen = e.target.value;
        if (!state.meta.ownedThemes.includes(chosen)) {
          if (!spend(THEME_SHOP[chosen].price)) { e.target.value = currentTheme; return; }
          state.meta.ownedThemes.push(chosen);
          saveState();
        }
        applyTheme(chosen);
        showToast('🎨 Theme changed');
      });
    }

    const toastEl = document.getElementById('toast');
    let toastTimer = null;
    let toastUndoHandler = null;

    function showToast(msg) {
      toastUndoHandler = null;
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
    }

    function showToastWithUndo(msg, undoFn) {
      if (!toastEl) return;
      toastEl.innerHTML = '';
      const span = document.createElement('span');
      span.textContent = msg + ' ';
      toastEl.appendChild(span);
      const btn = document.createElement('button');
      btn.textContent = 'Undo';
      btn.style.cssText = 'margin-left:10px;background:#7a3b1e;color:#f5e8d0;border:2px solid #3d1c0a;border-radius:3px;padding:3px 10px;font-family:inherit;font-size:0.75rem;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase;box-shadow:0 2px 0 #3d1c0a;';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (toastUndoHandler) toastUndoHandler();
        toastUndoHandler = null;
        toastEl.classList.remove('show');
      });
      toastEl.appendChild(btn);

      toastUndoHandler = undoFn;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
        toastUndoHandler = null;
        setTimeout(() => { if (toastEl && !toastEl.classList.contains('show')) toastEl.textContent = ''; }, 400);
      }, 5000);
    }

    let lastRenderedDateKey = todayKey();
    function checkDateRollover() {
      const now = todayKey();
      if (now !== lastRenderedDateKey) {
        lastRenderedDateKey = now;
        applyDailyReset();
        renderAll();
      }
    }
    window.addEventListener('focus', checkDateRollover);
    setInterval(checkDateRollover, 60000);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeQuestModal(); closeNoticeModal(); closeEventModal(); closeRewardCeremony();
        const lib = document.getElementById('libraryModal');
        if (lib) lib.classList.remove('active');
      }
    });

    function enableSort(container, sel, key) {
      let dragId = null;
      container.addEventListener('dragstart', e => {
        const it = e.target.closest(sel); if (!it) return;
        dragId = it.dataset.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId);
        setTimeout(() => { it.style.opacity = '.4'; }, 0);
      });
      container.addEventListener('dragover', e => {
        const it = e.target.closest(sel); if (!dragId || !it) return;
        e.preventDefault();
        container.querySelectorAll('.drop-target').forEach(x => x.classList.remove('drop-target'));
        if (it.dataset.id !== dragId) it.classList.add('drop-target');
      });
      container.addEventListener('drop', e => {
        const it = e.target.closest(sel); if (!dragId || !it || it.dataset.id === dragId) return;
        e.preventDefault();
        const arr = state[key], from = arr.findIndex(x => x.id === dragId), to = arr.findIndex(x => x.id === it.dataset.id);
        if (from < 0 || to < 0) return;
        arr.splice(to, 0, arr.splice(from, 1)[0]);
        saveState(); dragId = null; renderAll();
      });
      container.addEventListener('dragend', () => { dragId = null; renderAll(); });
    }
    function miniModal(title, html, onMount) {
      let ov = document.getElementById('miniModal');
      if (!ov) { ov = document.createElement('div'); ov.id = 'miniModal'; ov.className = 'modal-overlay'; ov.style.zIndex = 1200; document.body.appendChild(ov);
        ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('active'); }); }
      ov.innerHTML = `<div class="modal library-modal"><h3>${title}</h3><div>${html}</div><div class="modal-actions"><button class="btn-cancel" data-close="1">Close</button></div></div>`;
      ov.querySelector('[data-close]').onclick = () => ov.classList.remove('active');
      ov.classList.add('active'); if (onMount) onMount(ov);
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = document.getElementById('miniModal'); if (o) o.classList.remove('active'); } });
    function spend(n) {
      if ((state.meta.gold || 0) < n) { showToast(`🪙 You need ${n - state.meta.gold} more gold`); return false; }
      state.meta.gold -= n; saveState(); renderHeroPanel(); return true;
    }
    function openShop() {
      const m = state.meta;
      const row = (l, r) => `<div class="dv-item" style="align-items:center"><div class="dv-item-body">${l}</div><div style="display:flex;gap:4px">${r}</div></div>`;
      const rewards = state.shopItems.map(it => row(`<div class="dv-item-title">${escapeHtml(it.emoji || '🎁')} ${escapeHtml(it.text)}</div>`,
        `<button class="shop-btn" data-buy="${escapeHtml(it.id)}">${it.price ? it.price + ' 🪙' : 'Free ✓'}</button><button class="shop-btn ghost" data-del="${escapeHtml(it.id)}" title="Remove">✕</button>`)).join('');
      const themes = Object.keys(THEME_SHOP).map(id => { const own = m.ownedThemes.includes(id);
        return row(`<div class="dv-item-title">${THEME_SHOP[id].label}</div>`, `<button class="shop-btn" data-theme="${id}" ${id === currentTheme ? 'disabled' : ''}>${id === currentTheme ? 'In use' : own ? 'Use' : THEME_SHOP[id].price + ' 🪙'}</button>`); }).join('');
      const perks = PERKS.map(p => { const own = p.once && m.perks[p.id];
        return row(`<div class="dv-item-title">${p.emoji} ${p.name}${p.once ? '' : ' (have ' + m.shields + ')'}</div><div class="dv-item-meta">${p.desc}</div>`, `<button class="shop-btn" data-perk="${p.id}" ${own ? 'disabled' : ''}>${own ? 'Owned ✓' : p.price + ' 🪙'}</button>`); }).join('');
      miniModal('🛒 The Shop — 🪙 ' + m.gold,
        `<div class="shop-h">🎁 Rewards <span style="font-weight:600;letter-spacing:0;text-transform:none">(free = basics, always yours)</span></div>${rewards}<button class="shop-btn" data-add="1" style="margin-top:6px">＋ Add your own reward</button>
         <div class="shop-h">🎨 Themes</div>${themes}<div class="shop-h">✨ Upgrades</div>${perks}`,
        ov => { ov.onclick = e => {
          if (e.target === ov) { ov.classList.remove('active'); return; }
          const b = e.target.closest('button'); if (!b) return;
          if (b.dataset.buy) { const it = state.shopItems.find(x => x.id === b.dataset.buy); if (!it) return; if (it.price && !spend(it.price)) return; showToast(it.price ? `🎁 Enjoy: ${it.text}` : `💗 Always free. Enjoy: ${it.text}`); openShop(); }
          else if (b.dataset.del) { if (confirm('Remove this from the shop?')) { state.shopItems = state.shopItems.filter(x => x.id !== b.dataset.del); saveState(); openShop(); } }
          else if (b.dataset.theme) { const id = b.dataset.theme; if (!m.ownedThemes.includes(id)) { if (!spend(THEME_SHOP[id].price)) return; m.ownedThemes.push(id); saveState(); } applyTheme(id); buildThemeOptions(); openShop(); }
          else if (b.dataset.perk) { const p = PERKS.find(x => x.id === b.dataset.perk); if (!p || !spend(p.price)) return; if (p.once) m.perks[p.id] = true; else m.shields++; saveState(); showToast(`${p.emoji} ${p.name} acquired`); openShop(); }
          else if (b.dataset.add) { const text = (prompt('Reward name?') || '').trim(); if (!text) return; const price = Math.max(0, parseInt(prompt('Price in gold (0 = free)?', '30'), 10) || 0); state.shopItems.push({ id: uid(), emoji: '🎁', text, price }); saveState(); openShop(); }
        }; });
    }
    function openCardEditor(editId) {
      const cards = state.customCards, ed = cards.find(c => c.id === editId) || {};
      const list = cards.map(c => `<div class="dv-item"><div class="dv-item-body"><div class="dv-item-title">${escapeHtml(c.title || '(no title)')}</div><div class="dv-item-meta">${escapeHtml(c.body.slice(0, 80))}</div></div><div class="dv-item-actions"><button data-edit="${c.id}">✏️</button><button class="danger" data-delc="${c.id}">🗑️</button></div></div>`).join('') || '<div class="dv-empty">No cards of your own yet.</div>';
      miniModal('✏️ Your Notice Cards', `${list}<div class="shop-h">${ed.id ? 'Edit card' : 'New card'}</div>
        <label>Title (optional)</label><input type="text" id="ccTitle" maxlength="40" value="${escapeHtml(ed.title || '')}">
        <label>Text</label><textarea id="ccBody" maxlength="400">${escapeHtml(ed.body || '')}</textarea>
        <label>Attribution (optional)</label><input type="text" id="ccAttr" maxlength="60" value="${escapeHtml(ed.attribution || '')}">
        <button class="shop-btn" style="margin-top:10px" data-savec="${ed.id || ''}">💾 Save card</button>`,
        ov => { ov.onclick = e => {
          if (e.target === ov) { ov.classList.remove('active'); return; }
          const b = e.target.closest('button'); if (!b) return;
          if (b.dataset.edit) openCardEditor(b.dataset.edit);
          else if (b.dataset.delc) { if (confirm('Delete this card?')) { state.customCards = state.customCards.filter(c => c.id !== b.dataset.delc); saveState(); openCardEditor(); } }
          else if ('savec' in b.dataset) {
            const body = document.getElementById('ccBody').value.trim(); if (!body) { showToast('⚠️ The card needs some text'); return; }
            const data = { title: document.getElementById('ccTitle').value.trim(), body, attribution: document.getElementById('ccAttr').value.trim() };
            const ex = state.customCards.find(c => c.id === b.dataset.savec);
            if (ex) Object.assign(ex, data); else state.customCards.push({ id: uid(), cat: 'custom', emoji: '📌', ...data });
            saveState(); showToast('📌 Card saved — it joins the daily draw'); openCardEditor();
          } }; });
    }
    const shopBtn = document.getElementById('openShopBtn'); if (shopBtn) shopBtn.addEventListener('click', openShop);
    const editBtn = document.getElementById('nbEditBtn');
    if (editBtn) editBtn.addEventListener('click', () => { if (!state.meta.perks.quill) { showToast("🔒 Buy the Scribe's Quill in the Shop (50 🪙)"); return; } openCardEditor(); });

    enableSort(questPostersEl, '.quest-poster-wrap', 'quests');
    enableSort(noticesGridEl, '.notice-sticky', 'notices');

    document.body.setAttribute('data-theme', currentTheme);

    bindNoticeBoard();
    applyDailyReset();
    renderAll();

  })();
