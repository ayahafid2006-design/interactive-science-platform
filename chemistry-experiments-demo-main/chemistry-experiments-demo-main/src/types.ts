export interface Experiment {
  id: string;
  title: string;
  reagents: string[];
  colors: string[];
  productColor: string;
  type: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  experiments?: Experiment[];
  isComingSoon?: boolean;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "thermodynamics",
    number: 1,
    title: "علم الثرموداينمك",
    description: "دراسة الطاقة وتحولاتها، وقوانين الديناميكا الحرارية",
    color: "#FF5722",
    icon: "Flame",
    isComingSoon: true,
    experiments: []
  },
  {
    id: "chemical-equilibrium",
    number: 2,
    title: "الاتزان الكيميائي",
    experiments: [
      { id: 'exp_eq1', title: 'التجربة الأولى: الاتزان الديناميكي (حركة تصادم الجزيئات)', reagents: ['المتفاعلات [A]', 'النواتج [B]', 'معدل السرعة'], colors: ['#38bdf8', '#f97316'], productColor: '#4caf50', type: 'dynamic-equilibrium' }
    ],
    description: "حالة التوازن في التفاعلات الانعكاسية وقاعدة لوشاتليه",
    color: "#4CAF50",
    icon: "Scale",
    isComingSoon: false
  },
  {
    id: "ionic-equilibrium",
    number: 3,
    title: "الاتزان الايوني",
    description: "توازن الايونات في المحاليل المائية، الحوامض والقواعد",
    color: "#2196F3",
    icon: "Droplet",
    isComingSoon: false,
    experiments: [
      {
        id: 'exp_cond1',
        title: 'التجربة الأولى: محاكي التوصيل الكهربائي (الإلكتروليتات)',
        reagents: ['NaCl / HCl', 'CH₃COOH / NH₄OH', 'سكر / كحول'],
        colors: ['#2196F3', '#00BCD4'],
        productColor: '#4CAF50',
        type: 'conductivity'
      }
    ]
  },
  {
    id: "electrochemistry",
    number: 4,
    title: "الكيمياء الكهربائية",
    description: "الخلايا الكلفانية والالكتروليتية، قوانين فاراداي",
    color: "#FFEB3B",
    icon: "Zap",
    isComingSoon: true,
    experiments: []
  },
  {
    id: "coordination",
    number: 5,
    title: "الكيمياء التناسقية",
    description: "المركبات التناسقية ونظرية آصرة التكافؤ",
    color: "#9C27B0",
    icon: "Network",
    isComingSoon: true,
    experiments: []
  },
  {
    id: "analytical",
    number: 6,
    title: "الكيمياء التحليلية",
    description: "طرق التحليل الوصفي والكمي والحجمي",
    color: "#00BCD4",
    icon: "TestTubes",
    isComingSoon: true,
    experiments: []
  },
  {
    id: "organic",
    number: 7,
    title: "الكيمياء العضوية",
    description: "دراسة المركبات العضوية وتفاعلاتها",
    color: "#8BC34A",
    icon: "Hexagon",
    isComingSoon: true,
    experiments: []
  },
  {
    id: "bio",
    number: 8,
    title: "الكيمياء الحياتية",
    description: "كيمياء الكربوهيدرات والبروتينات والانزيمات",
    color: "#E91E63",
    icon: "Dna",
    isComingSoon: true,
    experiments: []
  }
];
