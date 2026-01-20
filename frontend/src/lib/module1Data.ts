export interface Task {
  number: number;
  title: string;
  type: 'content' | 'case-study' | 'game' | 'diagram' | 'test' | 'emotion-station';
  content?: string[];
  videos?: string[];
  caseStudy?: {
    scenario: string;
    question: string;
    options: Array<{
      letter: string;
      title: string;
      description: string[];
      isCorrect: boolean;
    }>;
    explanation: string[];
  };
  game?: {
    instruction: string;
    // for older game types
    pairs?: Array<{
      term: string;
      definition: string;
    }>;
    questions?: Array<{
      question: string;
      options: Array<{
        letter: string;
        text: string;
        isCorrect: boolean;
      }>;
    }>;
    // new stations flow (module-specific games)
    stations?: Array<{
      id: string;
      title: string;
      developing?: string[];
      description?: string[];
      techniques?: Array<{
        name: string;
        steps: string[];
        benefits?: string[];
      }>;
      examples?: string[];
      sampleAnswers?: string[];
    }>;
  };
  emotionStation?: {
    instruction: string;
    promptText: string;
    emotions: Array<{
      id: string;
      title: string;
      imageUrl: string;
      description?: string;
    }>;
    techniques: Array<{
      id: string;
      name: string;
      icon?: string;
      shortDescription: string;
      steps: string[];
      benefits: string[];
      duration?: string;
    }>;
  };
  decisionStation?: {
    title: string;
    description: string;
    scenarios: Array<{
      id: string;
      text: string;
    }>;
    options: Array<{
      value: string;
      label: string;
      points: number;
    }>;
  };
  creativeStation?: {
    title: string;
    description: string;
    imageUrl?: string;
    headerImageUrl?: string;
    items: string[];
    question: string;
    options: Array<{
      letter: string;
      text: string;
      isCorrect: boolean;
    }>;
  };
  reflectionStation?: {
    title: string;
    description: string;
    questions: Array<{
      id: string;
      question: string;
      options: Array<{
        letter: string;
        text: string;
      }>;
    }>;
  };
  globalStation?: {
    title: string;
    description: string;
    stations: Array<{
      id: string;
      type: 'selection' | 'matching';
      title: string;
      description: string;
      options?: Array<{
        id: string;
        title: string;
        description: string[];
        isCorrect?: boolean;
      }>;
      matchingItems?: Array<{
        id: string;
        text: string;
        matchId: string;
      }>;
      matchingTargets?: Array<{
        id: string;
        text: string;
      }>;
    }>;
  };

  diagram?: {
    instruction: string;
    categories: Array<{
      id: string;
      name: string;
      description: string;
      correctItems: string[];
    }>;
    items: string[];
  };
  test?: Array<{
    question: string;
    options: Array<{
      letter: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export const module1Data: Task[] = [
  {
    number: 1,
    title: "Matnni o‘qib o‘rganing",
    type: 'content',
    content: [
      "[CENTER]Tanqidiy va innovatsion fikrlash",
      "Tanqidiy fikrlash – bu ma'lumotni ko'r-ko'rona qabul qilmasdan, uni tahlil qilish, savol berish, dalillarni solishtirish, mustaqil xulosa chiqarish va qaror qabul qilish jarayonidir. Bo'lajak tarbiyachi uchun tanqidiy fikrlash mashg'ulotlarni rejalashtirishda, bolalar rivojlanishidagi muammolarni aniqlashda, har bir pedagogik vaziyatga bir nechta tomondan qaray olishda namoyon bo'ladi.",
      "Innovatsion fikrlash – mavjud muammo yoki vaziyatga yangicha, noan'anaviy, ijodiy yechim topish qobiliyatidir. Bo'lajak tarbiyachi innovatsion fikrlash orqali bolalar bilan ishlashda odatiy usullardan tashqari interfaol o'yinlar, raqamli texnologiyalar, loyiha usullarini qo'llaydi.",
      "Tanqidiy va innovatsion fikrlashning bo'lajak tarbiyachilar kasbiy transversal kompetensiyasidagi o'rni:",
      "• Turli axborot manbalarini solishtirish, asossiz fikrni tan olish emas;",
      "• Bolalarning xatti-harakati va rivojlanish dinamikasini kuzatib, pedagogik xulosaga kelish;",
      "• Mashg'ulotlar mazmunini takomillashtirish uchun yangi usullarni sinab ko'rish;",
      "• \"Hamma shunday qiladi\" degan stereotipdan voz kechib, ilmiy asoslangan yangiliklarni amaliyotga joriy etish;",
      "• Bolalarda ham tanqidiy va ijodiy fikrlashni uyg'otish (savol berishga undash, mustaqil tahlil, o'z fikrini himoya qilishga rag'batlantirish).",
      "Tanqidiy fikrlashning asosiy komponentlari:",
      "• Tahlil (ma'lumotni qismlarga ajratish, muhim va ikkinchi darajali jihatlarni farqlash);",
      "• Dalillash (fikrni dalillar bilan asoslab berish);",
      "• Mantiqiy xulosa (sabab–oqibatni aniqlash);",
      "• Savol berish madaniyati (to'g'ri savol qo'yish, \"nega?\", \"qanday?\", \"natijasi nima?\").",
      "Innovatsion fikrlashning asosiy komponentlari:",
      "• Kreativlik (yangicha g'oyalarni ilgari surish);",
      "• Moslashuvchan fikrlash (stereotipdan chiqish, vaziyatga qarab usulni o'zgartira olish);",
      "• Riskni baholash (yangi g'oyaning ijobiy va salbiy tomonlarini ko'ra bilish);",
      "• Eksperiment qilishga tayyorlik (sinovdan o'tmagan ish usullarini ehtiyotkorlik bilan sinab ko'rish).",
      "Bo'lajak tarbiyachi uchun tanqidiy va innovatsion fikrlash – bu faqat intellektual ko'nikma emas, balki kasbiy mas'uliyat va pedagogik pozitsiya ifodasidir.",
    ],
    videos: [
      "https://youtu.be/bF6T5FCm3EE?si=XUApYQT4VzfVTc-v",
      "https://youtu.be/7pAifd2X56g?si=UWrorBhcMz7VVPnh",
      "https://youtu.be/rGbN9xGnsAc?si=JCqvKlxfoi4GR6Dd",
      "https://youtu.be/GuaQLgNn4bQ?si=OI_p4rv2mR7QzQDH",
      "https://youtu.be/JJvwrxaXeew?si=GfNX2x4mGCn66DCe"
    ]
  },
  {
    number: 2,
    title: "CASE STUDY – Muammoli vaziyat",
    type: 'case-study',
    caseStudy: {
      scenario: "Maktabgacha ta'lim tashkilotida 5–6 yoshli bolalar bilan mashg'ulot o'tkazilmoqda. Tarbiyachi \"Ranglar uyg'unligi\" mavzusida ijodiy mashg'ulot tashkil qilgan. Mashg'ulot vaqtida 4 nafar bola faol ishtirok etmayotgani, materiallardan foydalanishda qiynalayotgani sezildi. Guruhda quyidagi muammolar kuzatildi:\n1. Ikki bola ranglarni adashtiryapti, berilgan namunaga mos rang tanlay olmayapti.\n2. Bir bola materiallar yetishmayapti deb shikoyat qiladi, boshqa bolalardan tortib oladi.\n3. Bir bola esa mashg'ulotga umuman qiziqmayapti, chetda o'tirib qo'llanmani ko'rmoqda.\n4. Natijada mashg'ulotning umumiy ritmi buzilayapti, guruhdagi iqlim esa keskinlashmoqda.",
      question: "Tarbiyachi ushbu vaziyatda qanday tanqidiy tahlil qiladi va innovatsion yechim taklif qiladi?",
      options: [
        {
          letter: 'A',
          title: "Muammoni yuzaki hal qilish",
          description: [
            "Tarbiyachi butun guruhni to'xtatadi, muammoga sababchi bolalarni ogohlantiradi, qolganlarini faollikka chaqiradi. Mashg'ulot rejaga muvofiq davom etadi, biroq individual yordam ko'rsatilmaydi.",
            "(Bu yechim tanqidiy tahlilsiz — sababni emas, faqat oqibatni bartaraf etadi.)"
          ],
          isCorrect: false
        },
        {
          letter: 'B',
          title: "Tanqidiy tahlil + moslashuvchan strategiya",
          description: [
            "Tarbiyachi muammoning sababini aniqlaydi:",
            "• ranglarni adashtirayotgan bolalarga alohida vizual kartochkalar beradi;",
            "• material yetishmasligi muammosini mini-markazlar orqali hal qiladi;",
            "• qiziqmayotgan bolaga tanlov beriladi (model qurish, ranglarni aralashtirish tajribasi).",
            "Mashg'ulot shaxsiy yondashuv orqali davom etadi."
          ],
          isCorrect: false
        },
        {
          letter: 'C',
          title: "Innovatsion yondashuv (STEAM mini-loyiha)",
          description: [
            "Tarbiyachi vaziyatdan ijodiy foydalanadi va guruhni kichik jamoalarga bo'ladi.",
            "Har bir jamoa quyidagi mini-innovatsion vazifani bajaradi:",
            "• \"Ranglar laboratoriyasi\" – yangi rang chiqarish tajribasi",
            "• \"Ijodiy komanda\" – bitta umumiy poster yaratish",
            "• \"Tartib guruhi\" – materiallarni taqsimlash va boshqarish",
            "Bolalar o'z rollariga mos faoliyat tanlaydi. Qiziqmayotgan bola rollardan birini tanlab qo'shiladi.",
            "Bu yechim bolalarda:",
            "• muammoni tahlil qilish,",
            "• ijodiy fikrlash,",
            "• jamoaviy muloqot,",
            "• mas'uliyatni bo'lishish,",
            "• innovatsion tajriba qilish ko'nikmalarini rivojlantiradi."
          ],
          isCorrect: true
        }
      ],
      explanation: [
        "✅ TO'G'RI JAVOB: C varianti",
        "Nega?",
        "• Vaziyatni chuqur tanqidiy tahlil qilgan;",
        "• Individual ehtiyojlar hisobga olingan;",
        "• Innovatsion STEAM faoliyati orqali muammo o'yinlashgan tarzda hal qilingan;",
        "• Transversal kompetensiyalar: tanqidiy fikrlash, innovatsion fikrlash, jamoada ishlash, media-savodxonlik elementlari birlashtirilgan."
      ]
    }
  },
  {
    number: 3,
    title: "Tanqidiy va innovatsion fikrlashga doir o'yin",
    type: 'game',
    game: {
      instruction: "O'yin sharti: Berilgan jumlalarga mos izohni (ta'rifni) toping.",
      questions: [
        {
          question: "Tanqidiy fikrlash — bu ...",
          options: [
            { letter: "A", text: "ma'lumot, fikr va vaziyatlarni yuzaki qabul qilmay, ularni mantiqiy tahlil qilish, fakt va fikrni farqlash, dalillar asosida baholash, sabab–oqibat aloqalarini aniqlash, bir nechta alternativ nuqtai nazardan ko'rib chiqish va mustaqil, asosli xulosa chiqarishga qaratilgan intellektual jarayondir.", isCorrect: true },
            { letter: "B", text: "mavjud vaziyat yoki muammoni odatiy ilk qarashlardan farqli tarzda baholash, yangi g'oyalar yaratish, noodatiy yo'nalishlarni taklif etish, jarayonlarni yaxshilash uchun kreativ, samarali, amaliy yechimlar ishlab chiqish qobiliyatidir.", isCorrect: false },
            { letter: "C", text: "berilgan ma'lumotlar orasidagi o'xshashlik va farqlarni aniqlash, ularni obyektiv mezonlar asosida taqqoslab, real holatni tushunishga yordam beruvchi tanqidiy tahlil jarayoni.", isCorrect: false },
            { letter: "D", text: "vaziyatning tub mohiyatini aniqlash, sabab va oqibatlarni ajratish, muammo tarkibini qismlarga bo'lib, uning asosiy tarkibiy jihatlarini o'rganish jarayoni.", isCorrect: false }
          ]
        },
        {
          question: "Innovatsion fikrlash — bu ...",
          options: [
            { letter: "A", text: "ma'lumot, fikr va vaziyatlarni yuzaki qabul qilmay, ularni mantiqiy tahlil qilish, fakt va fikrni farqlash, dalillar asosida baholash, sabab–oqibat aloqalarini aniqlash, bir nechta alternativ nuqtai nazardan ko'rib chiqish va mustaqil, asosli xulosa chiqarishga qaratilgan intellektual jarayondir.", isCorrect: false },
            { letter: "B", text: "mavjud vaziyat yoki muammoni odatiy ilk qarashlardan farqli tarzda baholash, yangi g'oyalar yaratish, noodatiy yo'nalishlarni taklif etish, jarayonlarni yaxshilash uchun kreativ, samarali, amaliy yechimlar ishlab chiqish qobiliyatidir.", isCorrect: true },
            { letter: "C", text: "berilgan ma'lumotlar orasidagi o'xshashlik va farqlarni aniqlash, ularni obyektiv mezonlar asosida taqqoslab, real holatni tushunishga yordam beruvchi tanqidiy tahlil jarayoni.", isCorrect: false },
            { letter: "D", text: "vaziyatning tub mohiyatini aniqlash, sabab va oqibatlarni ajratish, muammo tarkibini qismlarga bo'lib, uning asosiy tarkibiy jihatlarini o'rganish jarayoni.", isCorrect: false }
          ]
        },
        {
          question: "Faktlarni solishtirish — bu ...",
          options: [
             { letter: "A", text: "ma'lumot, fikr va vaziyatlarni yuzaki qabul qilmay, ularni mantiqiy tahlil qilish, fakt va fikrni farqlash, dalillar asosida baholash", isCorrect: false },
             { letter: "B", text: "mavjud vaziyat yoki muammoni odatiy ilk qarashlardan farqli tarzda baholash, yangi g'oyalar yaratish", isCorrect: false },
             { letter: "C", text: "berilgan ma'lumotlar orasidagi o'xshashlik va farqlarni aniqlash, ularni obyektiv mezonlar asosida taqqoslab, real holatni tushunishga yordam beruvchi tanqidiy tahlil jarayoni.", isCorrect: true },
             { letter: "D", text: "fikrni mantiqiy asoslar, dalillar, ishonchli faktlar va xulosalar bilan mustahkamlash; aytilgan fikrning to'g'riligini ob'ektiv ravishda isbotlash ko'nikmasi.", isCorrect: false }
          ]
        },
        {
          question: "Muammoni tahlil qilish — bu ...",
          options: [
            { letter: "A", text: "vaziyatning tub mohiyatini aniqlash, sabab va oqibatlarni ajratish, muammo tarkibini qismlarga bo'lib, uning asosiy tarkibiy jihatlarini o'rganish jarayoni.", isCorrect: true },
            { letter: "B", text: "fikrni mantiqiy asoslar, dalillar, ishonchli faktlar va xulosalar bilan mustahkamlash; aytilgan fikrning to'g'riligini ob'ektiv ravishda isbotlash ko'nikmasi.", isCorrect: false },
            { letter: "C", text: "berilgan mavzu yoki vaziyatni yuzaki emas, balki keng qamrovli, tizimli va izchil o'rganish; yashirin sabablarni aniqlash va ularni mantiqan izohlashdan iborat jarayon.", isCorrect: false },
            { letter: "D", text: "mavjud vaziyat yoki jarayonga noodatiy, ilg'or, kreativ yechimlar taklif etish; muammoni yangi nuqtai nazardan ko'ra olish qobiliyati.", isCorrect: false }
          ]
        },
        {
           question: "Mantiqiy dalillash — bu ...",
           options: [
            { letter: "A", text: "vaziyatning tub mohiyatini aniqlash, sabab va oqibatlarni ajratish, muammo tarkibini qismlarga bo'lib, uning asosiy tarkibiy jihatlarini o'rganish jarayoni.", isCorrect: false },
            { letter: "B", text: "fikrni mantiqiy asoslar, dalillar, ishonchli faktlar va xulosalar bilan mustahkamlash; aytilgan fikrning to'g'riligini ob'ektiv ravishda isbotlash ko'nikmasi.", isCorrect: true },
            { letter: "C", text: "stereotipdan holi, erkin, noodatiy tarzda fikr yuritish; mavjud g'oyalarni yangicha shaklga keltirish, yangilik yaratishga intilish va fikrda moslashuvchanlikni namoyon etish.", isCorrect: false },
            { letter: "D", text: "muammoni chuqurroq ochib beruvchi, fikr yuritishga undovchi, mantiqiy yoki ijodiy tahlilni boshlovchi savollarni mustaqil ravishda yaratish ko'nikmasi.", isCorrect: false }
           ]
        },
        {
           question: "Vaziyatni chuqur tahlil qilish — bu ...",
           options: [
            { letter: "A", text: "berilgan mavzu yoki vaziyatni yuzaki emas, balki keng qamrovli, tizimli va izchil o'rganish; yashirin sabablarni aniqlash va ularni mantiqan izohlashdan iborat jarayon.", isCorrect: true },
            { letter: "B", text: "birgina variant bilan cheklanmasdan, muammoni hal qilish uchun bir nechta turli yo'nalishdagi yechimlar yaratish va ulardan eng samaralisini tanlay olish jarayoni.", isCorrect: false },
            { letter: "C", text: "stereotipdan holi, erkin, noodatiy tarzda fikr yuritish; mavjud g'oyalarni yangicha shaklga keltirish, yangilik yaratishga intilish va fikrda moslashuvchanlikni namoyon etish.", isCorrect: false },
            { letter: "D", text: "mavjud vaziyat yoki jarayonga noodatiy, ilg'or, kreativ yechimlar taklif etish; muammoni yangi nuqtai nazardan ko'ra olish qobiliyati.", isCorrect: false }
           ]
        },
        {
           question: "Yangi g'oya taklif qilish — bu ...",
           options: [
            { letter: "A", text: "mavjud vaziyat yoki jarayonga noodatiy, ilg'or, kreativ yechimlar taklif etish; muammoni yangi nuqtai nazardan ko'ra olish qobiliyati.", isCorrect: true },
            { letter: "B", text: "birgina variant bilan cheklanmasdan, muammoni hal qilish uchun bir nechta turli yo'nalishdagi yechimlar yaratish va ulardan eng samaralisini tanlay olish jarayoni.", isCorrect: false },
            { letter: "C", text: "fikrni mantiqiy asoslar, dalillar, ishonchli faktlar va xulosalar bilan mustahkamlash; aytilgan fikrning to'g'riligini ob'ektiv ravishda isbotlash ko'nikmasi.", isCorrect: false },
            { letter: "D", text: "muammoni chuqurroq ochib beruvchi, fikr yuritishga undovchi, mantiqiy yoki ijodiy tahlilni boshlovchi savollarni mustaqil ravishda yaratish ko'nikmasi.", isCorrect: false }
           ]
        },
        {
           question: "Muqobil yechim ishlab chiqish — bu ...",
           options: [
            { letter: "A", text: "birgina variant bilan cheklanmasdan, muammoni hal qilish uchun bir nechta turli yo'nalishdagi yechimlar yaratish va ulardan eng samaralisini tanlay olish jarayoni.", isCorrect: true },
            { letter: "B", text: "mavjud vaziyat yoki jarayonga noodatiy, ilg'or, kreativ yechimlar taklif etish; muammoni yangi nuqtai nazardan ko'ra olish qobiliyati.", isCorrect: false },
            { letter: "C", text: "stereotipdan holi, erkin, noodatiy tarzda fikr yuritish; mavjud g'oyalarni yangicha shaklga keltirish, yangilik yaratishga intilish va fikrda moslashuvchanlikni namoyon etish.", isCorrect: false },
            { letter: "D", text: "vaziyatning tub mohiyatini aniqlash, sabab va oqibatlarni ajratish, muammo tarkibini qismlarga bo'lib, uning asosiy tarkibiy jihatlarini o'rganish jarayoni.", isCorrect: false }
           ]
        },
        {
           question: "Ijodiy fikrlash — bu ...",
           options: [
            { letter: "A", text: "stereotipdan holi, erkin, noodatiy tarzda fikr yuritish; mavjud g'oyalarni yangicha shaklga keltirish, yangilik yaratishga intilish va fikrda moslashuvchanlikni namoyon etish.", isCorrect: true },
            { letter: "B", text: "birgina variant bilan cheklanmasdan, muammoni hal qilish uchun bir nechta turli yo'nalishdagi yechimlar yaratish va ulardan eng samaralisini tanlay olish jarayoni.", isCorrect: false },
            { letter: "C", text: "muammoni chuqurroq ochib beruvchi, fikr yuritishga undovchi, mantiqiy yoki ijodiy tahlilni boshlovchi savollarni mustaqil ravishda yaratish ko'nikmasi.", isCorrect: false },
            { letter: "D", text: "vaziyatning tub mohiyatini aniqlash, sabab va oqibatlarni ajratish, muammo tarkibini qismlarga bo'lib, uning asosiy tarkibiy jihatlarini o'rganish jarayoni.", isCorrect: false }
           ]
        },
        {
           question: "Savollar yaratish (ijodiy savollar) — bu ...",
           options: [
            { letter: "A", text: "muammoni chuqurroq ochib beruvchi, fikr yuritishga undovchi, mantiqiy yoki ijodiy tahlilni boshlovchi savollarni mustaqil ravishda yaratish ko'nikmasi.", isCorrect: true },
            { letter: "B", text: "stereotipdan holi, erkin, noodatiy tarzda fikr yuritish; mavjud g'oyalarni yangicha shaklga keltirish, yangilik yaratishga intilish va fikrda moslashuvchanlikni namoyon etish.", isCorrect: false },
            { letter: "C", text: "birgina variant bilan cheklanmasdan, muammoni hal qilish uchun bir nechta turli yo'nalishdagi yechimlar yaratish va ulardan eng samaralisini tanlay olish jarayoni.", isCorrect: false },
            { letter: "D", text: "mavjud vaziyat yoki jarayonga noodatiy, ilg'or, kreativ yechimlar taklif etish; muammoni yangi nuqtai nazardan ko'ra olish qobiliyati.", isCorrect: false }
           ]
        }
      ]
    }
  },
  {
    number: 4,
    title: "Diagrammalar bilan ishlash – Interaktiv drag-and-drop",
    type: 'diagram',
    diagram: {
      instruction: "\"Bilim – Ko'nikma – Munosabat\" diagrammasini to'ldiring. Quyida tanqidiy va innovatsion fikrlashga oid tushunchalar berilgan. Ularni mos bo'limga (BILIM, KO'NIKMA, MUNOSABAT) drag-and-drop usulida joylashtiring.",
      categories: [
        {
          id: 'bilim',
          name: 'BILIM',
          description: 'Nazariy tushunchalar, tahliliy kategoriyalar',
          correctItems: ['Tahlil', 'Muammoni ko\'ra bilish', 'Mantiqiy tahlil']
        },
        {
          id: 'konikma',
          name: 'KO\'NIKMA',
          description: 'Amaliy bajariladigan fikrlash harakatlari',
          correctItems: ['Tanqidiy savollar berish', 'Dalillash', 'Fikrni asoslash']
        },
        {
          id: 'munosabat',
          name: 'MUNOSABAT',
          description: 'Ichki kayfiyat, munosabat, tayyorlik',
          correctItems: ['Kreativ yondashuv', 'Moslashuvchan fikrlash', 'Innovatsion yechimga ochiqlik']
        }
      ],
      items: [
        'Tahlil',
        'Muammoni ko\'ra bilish',
        'Mantiqiy tahlil',
        'Tanqidiy savollar berish',
        'Dalillash',
        'Fikrni asoslash',
        'Kreativ yondashuv',
        'Moslashuvchan fikrlash',
        'Innovatsion yechimga ochiqlik'
      ]
    }
  },
  {
    number: 5,
    title: "Modul yuzasidan test",
    type: 'test',
    test: [
      {
        question: "Tanqidiy fikrlash jarayonida birinchi navbatda qaysi harakat amalga oshiriladi?",
        options: [
          { letter: 'A', text: "Muammoni qayta yodlash", isCorrect: false },
          { letter: 'B', text: "Ma'lumotni tahlil qilish", isCorrect: true },
          { letter: 'C', text: "Tayyor xulosani qabul qilish", isCorrect: false },
          { letter: 'D', text: "Fikrni himoya qilish", isCorrect: false }
        ]
      },
      {
        question: "Innovatsion fikrlash qaysi vaziyatda yaqqol namoyon bo'ladi?",
        options: [
          { letter: 'A', text: "Odatiy pedagogik usullarni qo'llashda davom etish", isCorrect: false },
          { letter: 'B', text: "Yangi g'oyani amaliyotda sinab ko'rish va moslashtirish", isCorrect: true },
          { letter: 'C', text: "Hech qanday o'zgarish kiritmasdan ishlash", isCorrect: false },
          { letter: 'D', text: "Mashg'ulotlarni bir xil ssenariy asosida o'tkazish", isCorrect: false }
        ]
      },
      {
        question: "Tanqidiy fikrlashning asosiy belgisini toping:",
        options: [
          { letter: 'A', text: "Fikrni ifodalash tezligi", isCorrect: false },
          { letter: 'B', text: "Tahlil va solishtirish orqali xulosa chiqarish", isCorrect: true },
          { letter: 'C', text: "Ko'proq yodlash", isCorrect: false },
          { letter: 'D', text: "Qoidalarni eslab qolish", isCorrect: false }
        ]
      },
      {
        question: "Innovatsion yondashuv pedagogik faoliyatda qanday natija beradi?",
        options: [
          { letter: 'A', text: "Stereotiplarni kuchaytirish", isCorrect: false },
          { letter: 'B', text: "Faoliyatni bir yo'nalishda saqlab qolish", isCorrect: false },
          { letter: 'C', text: "Yangi metod va shakllarni qo'llashga zamin yaratadi", isCorrect: true },
          { letter: 'D', text: "O'quv yuklamasini kamaytiradi", isCorrect: false }
        ]
      },
      {
        question: "Tanqidiy fikrlashda \"savol berish\"ning o'rni qanday?",
        options: [
          { letter: 'A', text: "Jarayonni sekinlashtiradi", isCorrect: false },
          { letter: 'B', text: "Muammoning tub mohiyatini ochib beradi", isCorrect: true },
          { letter: 'C', text: "O'quvchini chalg'itadi", isCorrect: false },
          { letter: 'D', text: "Faqat bahslashish uchun kerak", isCorrect: false }
        ]
      },
      {
        question: "Bo'lajak tarbiyachi innovatsion fikrlashga ega bo'lsa, u:",
        options: [
          { letter: 'A', text: "Yangilikni o'rganishga ehtiyoj sezmaydi", isCorrect: false },
          { letter: 'B', text: "Imkon bo'lsa yangi metodlarni sinab ko'radi", isCorrect: true },
          { letter: 'C', text: "O'z fikrini doimiy o'zgartirmaydi", isCorrect: false },
          { letter: 'D', text: "O'quvchilardan faqat yod olishni talab qiladi", isCorrect: false }
        ]
      },
      {
        question: "Tanqidiy fikrlovchi tarbiyachi pedagogik vaziyatga qanday yondashadi?",
        options: [
          { letter: 'A', text: "Vaziyatni yuzaki baholaydi", isCorrect: false },
          { letter: 'B', text: "O'tmishdagi usullarni qo'llashni afzal ko'radi", isCorrect: false },
          { letter: 'C', text: "Voqelikni tahlil qilib, sabab-oqibatni aniqlaydi", isCorrect: true },
          { letter: 'D', text: "Boshqalarning fikriga tayanadi", isCorrect: false }
        ]
      },
      {
        question: "Innovatsion fikrlashni shakllantirish uchun eng samarali sharoitni belgilang:",
        options: [
          { letter: 'A', text: "Takroriy mashg'ulotlar", isCorrect: false },
          { letter: 'B', text: "Muammoli vaziyatlar asosida ijodiy izlanish", isCorrect: true },
          { letter: 'C', text: "Faqat ma'ruza tinglash", isCorrect: false },
          { letter: 'D', text: "Bir xil topshiriqlarni bajarish", isCorrect: false }
        ]
      },
      {
        question: "Tanqidiy va innovatsion fikrlashning umumiy jihati nimada?",
        options: [
          { letter: 'A', text: "Ikkalasi ham yodlash ko'nikmasini kuchaytiradi", isCorrect: false },
          { letter: 'B', text: "Ijodiy izlanish va tahliliy qarashlarni shakllantiradi", isCorrect: true },
          { letter: 'C', text: "Mashg'ulotlar sonini ko'paytiradi", isCorrect: false },
          { letter: 'D', text: "Tayyor javoblarni yod olishga yordam beradi", isCorrect: false }
        ]
      },
      {
        question: "Bo'lajak tarbiyachi mashg'ulotda bolalarning tanqidiy fikrlashini shakllantirish uchun:",
        options: [
          { letter: 'A', text: "Fikr bildirishni cheklaydi", isCorrect: false },
          { letter: 'B', text: "Turli savollar beradi va mustaqil tahlilga yo'naltiradi", isCorrect: true },
          { letter: 'C', text: "Faqat to'g'ri javobni aytishni talab qiladi", isCorrect: false },
          { letter: 'D', text: "Faqat yodlashga doir topshiriqlar beradi", isCorrect: false }
        ]
      }
    ]
  }
];

import { module2Data } from './module2Data';
import { module3Data } from './module3Data';
import { module4Data } from './module4Data';
import { module5Data } from './module5Data';

export function getTask(moduleId: number, taskNumber: number): Task | undefined {
  if (moduleId === 1) {
    return module1Data.find(t => t.number === taskNumber);
  }
  if (moduleId === 2) {
    return module2Data.find(t => t.number === taskNumber);
  }
  if (moduleId === 3) {
    return module3Data.find(t => t.number === taskNumber);
  }
  if (moduleId === 4) {
    return module4Data.find(t => t.number === taskNumber);
  }
  if (moduleId === 5) {
    return module5Data.find(t => t.number === taskNumber);
  }
  return undefined;
}

export function getTasksByModule(moduleId: number): Task[] {
  if (moduleId === 1) {
    return module1Data;
  }
  if (moduleId === 2) {
    return module2Data;
  }
  if (moduleId === 3) {
    return module3Data;
  }
  if (moduleId === 4) {
    return module4Data;
  }
  if (moduleId === 5) {
    return module5Data;
  }
  return [];
}
