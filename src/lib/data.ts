export interface Photo {
  id: string;
  url: string;
  alt: string;
  event: string;   // matches Event.id (e.g. 'ceremony', not 'The Ceremony')
  date: string;
  people?: string[];
  isHighlight?: boolean;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  eventId: string;     // which event this album belongs to
  photoIds: string[];  // explicit photo list
}

export interface Event {
  id: string;
  title: string;
  photoCount: number;
  coverUrl: string;
  date: string;
  likes: number;
}

export const EVENTS: Event[] = [
  {
    id: 'haldi',
    title: 'Haldi',
    photoCount: 42,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANx0TDDqSu2q-2Q2Hf0qjmvsa2JlQO09lIaGGZw6C8sPxPVOKh3i6UV3akEFmT0z8g5yNlkKOWFR1gTTyFHUH9XtaT8rpSkWUgoogXjVG7WLkJrXpti7hXfYUC_pK1IZ2bk0B_cuFaIqUe6HjHg3M7jhsI9GE44Vs7m43rVcdHkZLi9fXSTyHFfjXzAzXHfdd_y8cWy4WdBQOAr-HGxdw2uY83Vhza5XK_TAb-dGmQVjVUf0255c3gqc6u-CEw7xTzs_4ODa97zlR-',
    date: 'Dec 10, 2025',
    likes: 23
  },
  {
    id: 'mehendi',
    title: 'Mehendi',
    photoCount: 88,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAQo6wpBjb6xU38HAljjMRxSF9njit_QuBuM9Hchlzg0KOu-nS9C6QH0Bk7zYg9sOIeN_2zKcD-9lAF3N11z9RdcpqWg-2cG3xTc6rbZCC1H4s9H6Ynv57nEagsfUo2C4fGBOi72kvGfpCF1yv-ice-Cr86LdmwCGWV86vAHS0ii7AOMTKB7SpDHRS22GbBr5DFTZAQmwTmiz04CQ0yPD3L_cNPDClTSIP7HVB1ybZ4IlA2PrAZcgcgWRAcAMcNPt-MmRI7qYmwNTU',
    date: 'Dec 11, 2025',
    likes: 45
  },
  {
    id: 'sangeet',
    title: 'Sangeet',
    photoCount: 134,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCckfvxw3pCDaEECOZCZkU_fD1_rE5008AaShb6E4egboYP0B9oMDgGTw6QgAuTs-1w5jQJpN_lr_GQAbsXFwr54s6y-2ctoF9IoLJYbBjLWF1Dzi3heWMrym3wLU0iimtGbgBwFdZbloD6c2KxYV4v4vz1NtdTJb7r_ZqKPM8DWwDCJr1kqubaCRgYyMwpwbazgEVvRzkZK5D9KdFX0NaCKT5lPjaI_1cBIthA4h2reSiTRaM6TXlTN0Q8jx8efgmvaHb9uc1hBQUm',
    date: 'Dec 11, 2025',
    likes: 67
  },
  {
    id: 'ceremony',
    title: 'The Ceremony',
    photoCount: 180,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUiEpHrLILXEgIVMKb1CrYD1ai3GpbmPxnFHx8R8LcAVWPYFXYWc2kKHHRr5ueCqpgYYnTvwy3N2a1jT5xzlchz0CCD41x1XcDE6KdNXDNxQlj41HdoNdSrRi6MoqLrX8unVYHLflQdFOk3DSYmPebHi7uNRIOJg80j616d1MU3MUJ1sRw53dVMnnlGkAodMiLQ3m9FUcxnuvRygcrWNjV2OVCfhHjd3bBrIBx7JFmmbSaZY1FwOcGpXCPz8kUkyeSeOExfeu2UuoG',
    date: 'Dec 12, 2025',
    likes: 89
  },
  {
    id: 'reception',
    title: 'Reception',
    photoCount: 96,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU1v1kFKXpbkQET-21Y4ORRjGEu6A0IPSQ7e76H66ITNOsIgAu4G2qY9xeSEk5DVvpB5xrocJyvwWDCi7rzCZrdGwSun2lBDsrK8mgRqF7A8lcZYi1n7mYUop0HoDMQsQZxA1DpvYgooCA7dC9gDCuZCsBXtr4oaXefMYHf58f5bgljqOsrYRa6BarvAZzcPdYqtyagg0pjKZpL9e35At6JBLjwIX_7_Bn9MXTWqMqtLUne6ywQgBbS15bX-jC_v31YOhmdyFIMSNO',
    date: 'Dec 12, 2025',
    likes: 54
  }
];

export const PHOTOS: Photo[] = [
  // Haldi
  {
    id: 'h1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANx0TDDqSu2q-2Q2Hf0qjmvsa2JlQO09lIaGGZw6C8sPxPVOKh3i6UV3akEFmT0z8g5yNlkKOWFR1gTTyFHUH9XtaT8rpSkWUgoogXjVG7WLkJrXpti7hXfYUC_pK1IZ2bk0B_cuFaIqUe6HjHg3M7jhsI9GE44Vs7m43rVcdHkZLi9fXSTyHFfjXzAzXHfdd_y8cWy4WdBQOAr-HGxdw2uY83Vhza5XK_TAb-dGmQVjVUf0255c3gqc6u-CEw7xTzs_4ODa97zlR-',
    alt: 'Bride laughing during haldi ceremony with yellow turmeric paste',
    event: 'haldi',
    date: 'Dec 10, 2025',
    people: ['Shruti'],
    isHighlight: true
  },
  {
    id: 'h2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCckfvxw3pCDaEECOZCZkU_fD1_rE5008AaShb6E4egboYP0B9oMDgGTw6QgAuTs-1w5jQJpN_lr_GQAbsXFwr54s6y-2ctoF9IoLJYbBjLWF1Dzi3heWMrym3wLU0iimtGbgBwFdZbloD6c2KxYV4v4vz1NtdTJb7r_ZqKPM8DWwDCJr1kqubaCRgYyMwpwbazgEVvRzkZK5D9KdFX0NaCKT5lPjaI_1cBIthA4h2reSiTRaM6TXlTN0Q8jx8efgmvaHb9uc1hBQUm',
    alt: 'Family applying haldi on groom with joyful expressions',
    event: 'haldi',
    date: 'Dec 10, 2025',
    people: ['Umesh']
  },
  {
    id: 'h3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU1v1kFKXpbkQET-21Y4ORRjGEu6A0IPSQ7e76H66ITNOsIgAu4G2qY9xeSEk5DVvpB5xrocJyvwWDCi7rzCZrdGwSun2lBDsrK8mgRqF7A8lcZYi1n7mYUop0HoDMQsQZxA1DpvYgooCA7dC9gDCuZCsBXtr4oaXefMYHf58f5bgljqOsrYRa6BarvAZzcPdYqtyagg0pjKZpL9e35At6JBLjwIX_7_Bn9MXTWqMqtLUne6ywQgBbS15bX-jC_v31YOhmdyFIMSNO',
    alt: 'Close up of turmeric paste on hands during haldi ritual',
    event: 'haldi',
    date: 'Dec 10, 2025'
  },
  {
    id: 'h4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZuDZ0I1fjxkY5USd1ExG_VJioBrPvkPc4M6bapCvbDBf3XRatrwVO2aVUwfCJ8I-MeFBzRTHmIAfxUaZ3u0GSjpA3kBrOWA0PKN9GmK71-nvjBN2-ejqEwDdtrIuzsno0KtwXUt4Eyyc_O-yvL1LKr7f02DSUHzu-_FrtTYcnmojIPx2p_1e1wWcU8vur9dRnUrA5XJBU85I06ZlH5lyva0WiaKRT41lDxqUGhABkqK3ucyZAOQ3ZIfQ9F2X5iYPdwkWu506UGgx',
    alt: 'Siblings laughing and smearing haldi on each other',
    event: 'haldi',
    date: 'Dec 10, 2025',
    people: ['Shruti', 'Umesh']
  },

  // Mehendi
  {
    id: 'm1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAQo6wpBjb6xU38HAljjMRxSF9njit_QuBuM9Hchlzg0KOu-nS9C6QH0Bk7zYg9sOIeN_2zKcD-9lAF3N11z9RdcpqWg-2cG3xTc6rbZCC1H4s9H6Ynv57nEagsfUo2C4fGBOi72kvGfpCF1yv-ice-Cr86LdmwCGWV86vAHS0ii7AOMTKB7SpDHRS22GbBr5DFTZAQmwTmiz04CQ0yPD3L_cNPDClTSIP7HVB1ybZ4IlA2PrAZcgcgWRAcAMcNPt-MmRI7qYmwNTU',
    alt: 'Intricate mehendi design on bride\'s hands',
    event: 'mehendi',
    date: 'Dec 11, 2025',
    people: ['Shruti'],
    isHighlight: true
  },
  {
    id: 'm2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFTGgZ5k9brmHDOGdTXUglgONzEyQtzAzRBZWGzio3xkfTEpe3O9pw0cPHoRLWto7p5l5o7l_LUyACExoTnSRQNtM8AbN2v9KDLlZhPyzkeat3eOdZqfQxJvFPXAxxQr5Lvqc9lxQSXZWk2G0PlpUgEbjK8CWKPqebCJxuRcVFNlyuCQoOiX2YUoQl8leivQs56OlH3jktJylwrx3d82u275AT1p7BemrEGdYIgozst-RPraAgzZPAEBwIJr313oPv-WoJ9VPofjto',
    alt: 'Artist drawing delicate mehendi patterns',
    event: 'mehendi',
    date: 'Dec 11, 2025'
  },
  {
    id: 'm3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGMqjzD-ns1ky6SYvp-vgbUknqbUaYW61sXRAsFd_NLF9JDgMcbu66aGbi8-TadgzrDDA8Ac2cJzkt0MCXAib4XqN8lJKC6ffCNijf6o4h58Gc1Kz71a3AMGZ_8fqFAcdENw_nAdPzK5-QCFbFzM1r3mrX-IAdVdT48nG7AjJmHAqlJJKAtRYYyx2HJ1cvOaQ8jaTlaQp2qde5wL2b_rVKWG7e2iFfqcmtx3USmwr5eVBY0SlvsUhX7LqvzTfPOdFgHALuhDRyC_Ab',
    alt: 'Women sitting together during mehendi ceremony',
    event: 'mehendi',
    date: 'Dec 11, 2025',
    people: ['Shruti']
  },
  {
    id: 'm4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBOD5i9zk7V7UqKg_5fuB4J6p47-HQJ5DiWKTSdUx2BGQYWNxsRk7PnMRrMgCLIkucHKS-zpXjLJrTaa8fsERbjRLgrVzS1tZYdum8Qp5R45rLusbH6DYlKqKaZ2S3Jg3E3QKFK-UOzLKoy0rPTC3pziXsxbowGfDy4XirQsI0mPeeMvpv3SUwPs5KzW8KEKRH-ASSSftdOwUnPK8kOeH6d2BhrNAmesdjhtVAYod3qRUH7ZZjonc3XBrBmDkdtKh-X9Zrmb-a8JWz',
    alt: 'Close up of finished mehendi on both hands',
    event: 'mehendi',
    date: 'Dec 11, 2025'
  },

  // Sangeet
  {
    id: 's1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGsiYLxfLctKBonf6F-PZdhnFAAL_j_tNDN6PRI_OFpb0oLutAGDh1KIf6bFDDP6xvmChzmVdBcqm4bI7cAwCbgbbsZCCbfYyMRfjtX0qh8hyws-nURUpraUGjomNQUjWiXXo_Jb1WCtwKqCDfCOfALu7AWlLdeqmrhWCby5dJa4qkr1KXJmwwg34XUvh2FsH39fJ4ykTgudbmL6FvpGRY_4kPxW5WbWkpIYnyNd3qt3Vtx48ZL4qdh5utlc1Q6FYZcuMFf7IS96sa',
    alt: 'Bride dancing on stage during sangeet night',
    event: 'sangeet',
    date: 'Dec 11, 2025',
    people: ['Shruti'],
    isHighlight: true
  },
  {
    id: 's2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9HA0KRXuVeWqzUo_WyarKu-qHUCKWzlZNsd43mOD6VMMlp-irmzBqd70L-wp0J-Fvx-_B7NsIcaSwUsZIW_-IewzgstelpuJTq-pzI9e3u1Xa3CEdVD7sqAJ_Dj3qZRXY3ta7Vx7PF3kZkf0cRECJoIyJtvSJ-1SCS-mKUJqZgwqFe8Q1NNrltewdYNVENx3mWU9UbAtLjE7_pd2oftVWkp3BNLURzjAXijqIf0rPibfZ4Po-6hHhlq9WohwmlZt7_9sJig4WDSp-',
    alt: 'Groom with friends performing choreographed dance',
    event: 'sangeet',
    date: 'Dec 11, 2025',
    people: ['Umesh']
  },
  {
    id: 's3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2qZr6hZjHEkFwf8dyTic9t3adinPJk3vwlUt3QW_9Kx5PmZk1f7jueRaAUkCnD8Rlu2qH2-lAfpz5BizLRyOSGykcAH3ZF6h1i90F_D09fuB0zes8RWfhOMCa6NTvJVfi2woVVCpni11FlCM8un6VT0YNJUO3_md95cJ0UkT5uo7OPmnBstlXvw6LXBAsm0IxfRPYuAJMwrY1OBvyOGY6Kcy-hABRyp_z9cxfFgYudzlTkskt8ijlJkt1NBANIHb-Aig4ruwKrJAu',
    alt: 'Both families dancing together on stage at sangeet',
    event: 'sangeet',
    date: 'Dec 11, 2025',
    people: ['Shruti', 'Umesh']
  },
  {
    id: 's4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSIneS-D7kgpvrDdbK97JFG4dv7IcyB3mUI4TmUE21H5tPwim35Ayu1_tJcJhS0Em0f_IE5UWUUOg4yOShX1xYcABvoTEvg_708bt6H-ahJg5QDdzThM49BLhFLO3kRQwWidVSHNTOctw75hN3c-7g4itttf_8Q3jDC5ijyHy8MUtH2kdU0sWJQFOIHyBmY5CzdJjUx43g8MEfRrGvPfG-3IOF8Cg74yBQrzZpbZVPrY4Js31qdagloM1_PVm6qzDMzPsZU2m1g0su',
    alt: 'Candlelit sangeet stage with floral arrangements',
    event: 'sangeet',
    date: 'Dec 11, 2025'
  },

  // Ceremony
  {
    id: 'c1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_L-yJFBj27uWSRw0GW1H-_y_kPsUmFW1pbttxjxoj81T5rM-MouBIVeLe14EevXgNjnBiJbLWk3-5ygZZkdAg41HbFNEjFYfRKfaVfVHD7A1cRdJRoeplg3p_B0PC3Y2IdCsqTohtCr25CkOJBjLPDPkBbhjaj2DguhcEoXVlK_AaXUFtotBobf-o7NZnq3uymsANGEgMcA_kqwwfukuS7aeB2r71Y9Swccx_TQiYHKEuZUVkXTT2mnkjuu8L8iVTNPUpDbUJCtuC',
    alt: 'Bride and groom exchanging vows at an altar inside a hall with warm candlelight',
    event: 'ceremony',
    date: 'Dec 12, 2025',
    people: ['Shruti', 'Umesh'],
    isHighlight: true
  },
  {
    id: 'c2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGsiYLxfLctKBonf6F-PZdhnFAAL_j_tNDN6PRI_OFpb0oLutAGDh1KIf6bFDDP6xvmChzmVdBcqm4bI7cAwCbgbbsZCCbfYyMRfjtX0qh8hyws-nURUpraUGjomNQUjWiXXo_Jb1WCtwKqCDfCOfALu7AWlLdeqmrhWCby5dJa4qkr1KXJmwwg34XUvh2FsH39fJ4ykTgudbmL6FvpGRY_4kPxW5WbWkpIYnyNd3qt3Vtx48ZL4qdh5utlc1Q6FYZcuMFf7IS96sa',
    alt: 'Traditional wedding family portrait',
    event: 'ceremony',
    date: 'Dec 12, 2025'
  },
  {
    id: 'c3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9HA0KRXuVeWqzUo_WyarKu-qHUCKWzlZNsd43mOD6VMMlp-irmzBqd70L-wp0J-Fvx-_B7NsIcaSwUsZIW_-IewzgstelpuJTq-pzI9e3u1Xa3CEdVD7sqAJ_Dj3qZRXY3ta7Vx7PF3kZkf0cRECJoIyJtvSJ-1SCS-mKUJqZgwqFe8Q1NNrltewdYNVENx3mWU9UbAtLjE7_pd2oftVWkp3BNLURzjAXijqIf0rPibfZ4Po-6hHhlq9WohwmlZt7_9sJig4WDSp-',
    alt: 'Emotional groom with family',
    event: 'ceremony',
    date: 'Dec 12, 2025',
    people: ['Umesh']
  },
  {
    id: 'c4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2qZr6hZjHEkFwf8dyTic9t3adinPJk3vwlUt3QW_9Kx5PmZk1f7jueRaAUkCnD8Rlu2qH2-lAfpz5BizLRyOSGykcAH3ZF6h1i90F_D09fuB0zes8RWfhOMCa6NTvJVfi2woVVCpni11FlCM8un6VT0YNJUO3_md95cJ0UkT5uo7OPmnBstlXvw6LXBAsm0IxfRPYuAJMwrY1OBvyOGY6Kcy-hABRyp_z9cxfFgYudzlTkskt8ijlJkt1NBANIHb-Aig4ruwKrJAu',
    alt: 'Grandparents at wedding ceremony',
    event: 'ceremony',
    date: 'Dec 12, 2025'
  },
  {
    id: 'c5',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSIneS-D7kgpvrDdbK97JFG4dv7IcyB3mUI4TmUE21H5tPwim35Ayu1_tJcJhS0Em0f_IE5UWUUOg4yOShX1xYcABvoTEvg_708bt6H-ahJg5QDdzThM49BLhFLO3kRQwWidVSHNTOctw75hN3c-7g4itttf_8Q3jDC5ijyHy8MUtH2kdU0sWJQFOIHyBmY5CzdJjUx43g8MEfRrGvPfG-3IOF8Cg74yBQrzZpbZVPrY4Js31qdagloM1_PVm6qzDMzPsZU2m1g0su',
    alt: 'Parents emotional embrace during ceremony',
    event: 'ceremony',
    date: 'Dec 12, 2025'
  },
  {
    id: 'c6',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkV2do0z5R-v1_1moqIKqgzvAYErD21hIjOUqqizmtwmj02l9YfQpZDqQpB_4-e81dcgocmUBnT98pNuz0DSfz86_H8gM2xmz9igiIAeL1rAlfwEuEL4X5n3CAC1UbmBC9jVZqYvl_6GbaWYT7UUPGzuP6-VNBn5stawP0SiCiSlIBw6XK3Qtiw6sNwzvX4BNrMR6A8buue6l2mycto_0hD-OqMRSlGEKKgM_P2L8zd_xtPbRDL75bmL3L90bp_UeFux8kdVckrGZ3',
    alt: 'Floral mandap decorated with marigolds and roses',
    event: 'ceremony',
    date: 'Dec 12, 2025',
    people: ['Shruti', 'Umesh']
  },

  // Reception
  {
    id: 'r1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU1v1kFKXpbkQET-21Y4ORRjGEu6A0IPSQ7e76H66ITNOsIgAu4G2qY9xeSEk5DVvpB5xrocJyvwWDCi7rzCZrdGwSun2lBDsrK8mgRqF7A8lcZYi1n7mYUop0HoDMQsQZxA1DpvYgooCA7dC9gDCuZCsBXtr4oaXefMYHf58f5bgljqOsrYRa6BarvAZzcPdYqtyagg0pjKZpL9e35At6JBLjwIX_7_Bn9MXTWqMqtLUne6ywQgBbS15bX-jC_v31YOhmdyFIMSNO',
    alt: 'Couple\'s first dance at reception under warm lighting',
    event: 'reception',
    date: 'Dec 12, 2025',
    people: ['Shruti', 'Umesh'],
    isHighlight: true
  },
  {
    id: 'r2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFTGgZ5k9brmHDOGdTXUglgONzEyQtzAzRBZWGzio3xkfTEpe3O9pw0cPHoRLWto7p5l5o7l_LUyACExoTnSRQNtM8AbN2v9KDLlZhPyzkeat3eOdZqfQxJvFPXAxxQr5Lvqc9lxQSXZWk2G0PlpUgEbjK8CWKPqebCJxuRcVFNlyuCQoOiX2YUoQl8leivQs56OlH3jktJylwrx3d82u275AT1p7BemrEGdYIgozst-RPraAgzZPAEBwIJr313oPv-WoJ9VPofjto',
    alt: 'Reception hall decorated with fairy lights and flowers',
    event: 'reception',
    date: 'Dec 12, 2025'
  },
  {
    id: 'r3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGMqjzD-ns1ky6SYvp-vgbUknqbUaYW61sXRAsFd_NLF9JDgMcbu66aGbi8-TadgzrDDA8Ac2cJzkt0MCXAib4XqN8lJKC6ffCNijf6o4h58Gc1Kz71a3AMGZ_8fqFAcdENw_nAdPzK5-QCFbFzM1r3mrX-IAdVdT48nG7AjJmHAqlJJKAtRYYyx2HJ1cvOaQ8jaTlaQp2qde5wL2b_rVKWG7e2iFfqcmtx3USmwr5eVBY0SlvsUhX7LqvzTfPOdFgHALuhDRyC_Ab',
    alt: 'Guests celebrating and dancing at reception',
    event: 'reception',
    date: 'Dec 12, 2025'
  },
  {
    id: 'r4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBOD5i9zk7V7UqKg_5fuB4J6p47-HQJ5DiWKTSdUx2BGQYWNxsRk7PnMRrMgCLIkucHKS-zpXjLJrTaa8fsERbjRLgrVzS1tZYdum8Qp5R45rLusbH6DYlKqKaZ2S3Jg3E3QKFK-UOzLKoy0rPTC3pziXsxbowGfDy4XirQsI0mPeeMvpv3SUwPs5KzW8KEKRH-ASSSftdOwUnPK8kOeH6d2BhrNAmesdjhtVAYod3qRUH7ZZjonc3XBrBmDkdtKh-X9Zrmb-a8JWz',
    alt: 'Wedding cake cutting at reception dinner',
    event: 'reception',
    date: 'Dec 12, 2025',
    people: ['Shruti', 'Umesh']
  }
];

export const ALBUMS: Album[] = [
  {
    id: 'family-portraits',
    title: 'Family Blessings',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFTGgZ5k9brmHDOGdTXUglgONzEyQtzAzRBZWGzio3xkfTEpe3O9pw0cPHoRLWto7p5l5o7l_LUyACExoTnSRQNtM8AbN2v9KDLlZhPyzkeat3eOdZqfQxJvFPXAxxQr5Lvqc9lxQSXZWk2G0PlpUgEbjK8CWKPqebCJxuRcVFNlyuCQoOiX2YUoQl8leivQs56OlH3jktJylwrx3d82u275AT1p7BemrEGdYIgozst-RPraAgzZPAEBwIJr313oPv-WoJ9VPofjto',
    eventId: 'ceremony',
    photoIds: ['c2', 'c3', 'c4', 'c5']
  },
  {
    id: 'bride-groom',
    title: 'Just the Two of Them',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGMqjzD-ns1ky6SYvp-vgbUknqbUaYW61sXRAsFd_NLF9JDgMcbu66aGbi8-TadgzrDDA8Ac2cJzkt0MCXAib4XqN8lJKC6ffCNijf6o4h58Gc1Kz71a3AMGZ_8fqFAcdENw_nAdPzK5-QCFbFzM1r3mrX-IAdVdT48nG7AjJmHAqlJJKAtRYYyx2HJ1cvOaQ8jaTlaQp2qde5wL2b_rVKWG7e2iFfqcmtx3USmwr5eVBY0SlvsUhX7LqvzTfPOdFgHALuhDRyC_Ab',
    eventId: 'ceremony',
    photoIds: ['c1', 'c6']
  },
  {
    id: 'haldi-moments',
    title: 'Turmeric & Laughter',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANx0TDDqSu2q-2Q2Hf0qjmvsa2JlQO09lIaGGZw6C8sPxPVOKh3i6UV3akEFmT0z8g5yNlkKOWFR1gTTyFHUH9XtaT8rpSkWUgoogXjVG7WLkJrXpti7hXfYUC_pK1IZ2bk0B_cuFaIqUe6HjHg3M7jhsI9GE44Vs7m43rVcdHkZLi9fXSTyHFfjXzAzXHfdd_y8cWy4WdBQOAr-HGxdw2uY83Vhza5XK_TAb-dGmQVjVUf0255c3gqc6u-CEw7xTzs_4ODa97zlR-',
    eventId: 'haldi',
    photoIds: ['h1', 'h2', 'h3', 'h4']
  },
  {
    id: 'dance-floor',
    title: 'Sangeet After Dark',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGsiYLxfLctKBonf6F-PZdhnFAAL_j_tNDN6PRI_OFpb0oLutAGDh1KIf6bFDDP6xvmChzmVdBcqm4bI7cAwCbgbbsZCCbfYyMRfjtX0qh8hyws-nURUpraUGjomNQUjWiXXo_Jb1WCtwKqCDfCOfALu7AWlLdeqmrhWCby5dJa4qkr1KXJmwwg34XUvh2FsH39fJ4ykTgudbmL6FvpGRY_4kPxW5WbWkpIYnyNd3qt3Vtx48ZL4qdh5utlc1Q6FYZcuMFf7IS96sa',
    eventId: 'sangeet',
    photoIds: ['s1', 's2', 's3']
  }
];
