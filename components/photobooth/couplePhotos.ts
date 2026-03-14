export interface CouplePhoto {
  id: string;
  src: string;
  labelCs: string;
  labelEn: string;
  category: 'together' | 'groom' | 'bride';
}

export const couplePhotos: CouplePhoto[] = [
  // Together
  {
    id: 'together-1',
    src: '/photobooth/couple/together-1.jpg',
    labelCs: 'Klára & Michal',
    labelEn: 'Klára & Michal',
    category: 'together',
  },
  {
    id: 'together-2',
    src: '/photobooth/couple/together-2.jpg',
    labelCs: 'Klára & Michal',
    labelEn: 'Klára & Michal',
    category: 'together',
  },
  // Groom
  {
    id: 'groom-1',
    src: '/photobooth/couple/groom-1.jpg',
    labelCs: 'Michal',
    labelEn: 'Michal',
    category: 'groom',
  },
  {
    id: 'groom-2',
    src: '/photobooth/couple/groom-2.jpg',
    labelCs: 'Michal',
    labelEn: 'Michal',
    category: 'groom',
  },
  // Bride
  {
    id: 'bride-1',
    src: '/photobooth/couple/bride-1.jpg',
    labelCs: 'Klára',
    labelEn: 'Klára',
    category: 'bride',
  },
  {
    id: 'bride-2',
    src: '/photobooth/couple/bride-2.jpg',
    labelCs: 'Klára',
    labelEn: 'Klára',
    category: 'bride',
  },
];
