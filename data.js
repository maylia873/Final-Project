/* =========================================================
   DATA FOR THE MAP
   - RULERS: the colour + name for each ruling power
   - STATES: each state's shape, history periods and story
   - KEY_MOMENTS: the dates shown under the slider
   Edit the history here — script.js reads everything from this file.
   ========================================================= */

const RULERS = {
  local:       { label: 'Local Malay rule',    color: '#6B665C' },
  portuguese:  { label: 'Portuguese',          color: '#8E5FA6' },
  dutch:       { label: 'Dutch',               color: '#D9773A' },
  british:     { label: 'British',             color: '#3F72AF' },
  siam:        { label: 'Siam',                color: '#D4A03C' },
  brooke:      { label: 'Brooke Rajahs',       color: '#8BA06A' },
  japan:       { label: 'Japanese occupation', color: '#B5402F' },
  independent: { label: 'Independent',         color: '#EDE3CF' }
};

/* Shared border points [latitude, longitude].
   Neighbouring states use the same points so their borders line up.
   Shapes are simplified on purpose — this is a graphic, not a survey map. */
const N = {
  P1: [6.72, 100.17], P2: [6.68, 100.36], P3: [6.42, 100.40], P4: [6.27, 100.18],
  T0: [6.48, 100.65], T1: [6.25, 100.90], T2: [5.82, 101.02], T3: [5.88, 101.32],
  KP1: [5.50, 100.85], K1: [5.58, 100.40], K2: [5.45, 100.55], K3: [5.15, 100.52], K4: [5.12, 100.42],
  KK: [5.30, 101.38], KPP: [4.75, 101.45], PH1: [4.30, 101.38], PPS: [3.80, 101.60],
  PS2: [3.70, 101.30], SB: [3.83, 100.83],
  KT: [6.24, 102.09], KTr: [5.83, 102.55], KT2: [5.30, 102.50], KTP: [4.80, 102.45], KP2: [4.55, 101.90],
  TPc: [4.22, 103.43], TP1: [4.40, 103.05], TP2: [4.60, 102.70],
  PJc: [2.65, 103.60], PJ1: [2.65, 103.20], PJ2: [2.55, 102.85], PJN: [2.62, 102.60],
  PN1: [2.90, 102.40], PNS: [3.05, 101.95], PS1: [3.40, 101.80], PS3: [3.70, 101.70],
  SN1: [2.85, 101.85], SNc: [2.62, 101.72],
  NMc: [2.42, 101.98], NM1: [2.50, 102.15], NM2: [2.45, 102.40], MNJ: [2.35, 102.50],
  MJ1: [2.20, 102.55], MJc: [2.07, 102.55],
  SST: [4.00, 115.60], SS1: [4.60, 115.62], SSc: [4.98, 115.55]
};

// Each period: [start year, ruler, short note]. A period lasts until the next one starts.
const POSTWAR = 'British Military Administration, then the Malayan Union (1946) and the Federation of Malaya (1948)';
const MERDEKA = 'Merdeka: part of the independent Federation of Malaya';

const STATES = [
  {
    id: 'perlis', name: 'Perlis', label: [6.90, 100.27], small: true,
    shape: [[N.P1, N.P2, N.P3, N.P4, [6.43, 100.13]]],
    periods: [
      [1500, 'local', 'Part of the Kedah sultanate'],
      [1821, 'siam', 'Siam invades Kedah; Perlis is made a separate state in 1842'],
      [1909, 'british', 'Anglo-Siamese Treaty passes Perlis to Britain'],
      [1941, 'japan', 'Japanese occupation'],
      [1943, 'siam', 'Japan hands the state to Thailand'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'Perlis began as the northern part of Kedah. After Siam invaded Kedah in 1821, it split Perlis off as a separate state in 1842 and kept both under its control. The 1909 Anglo-Siamese Treaty handed Perlis to Britain, which ruled it as one of the Unfederated Malay States.'
  },
  {
    id: 'kedah', name: 'Kedah', label: [6.00, 100.62],
    shape: [
      [N.P4, N.P3, N.P2, N.T0, N.T1, N.T2, N.KP1, N.K2, N.K1, [5.80, 100.37], [6.10, 100.30]],
      [[6.45, 99.68], [6.43, 99.88], [6.30, 99.92], [6.24, 99.75], [6.33, 99.65]] // Langkawi
    ],
    periods: [
      [1500, 'local', 'Kedah sultanate, sending tribute to Siam'],
      [1821, 'siam', 'Siam invades and rules directly until 1842, then through the sultan'],
      [1909, 'british', 'Anglo-Siamese Treaty passes Kedah to Britain'],
      [1941, 'japan', 'Japanese occupation'],
      [1943, 'siam', 'Japan hands the state to Thailand'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'One of the oldest Malay kingdoms, Kedah long sent the bunga emas (golden flowers) to Siam as tribute. Hoping for British protection, its sultan let the East India Company take Penang in 1786, but no help came when Siam invaded in 1821. Siam stayed in control until the 1909 Anglo-Siamese Treaty passed Kedah to Britain.'
  },
  {
    id: 'penang', name: 'Penang', label: [5.20, 100.08], labelAnchor: 'end', small: true,
    shape: [
      [N.K1, N.K2, N.K3, N.K4, [5.40, 100.40]], // Seberang Perai (mainland)
      [[5.49, 100.22], [5.47, 100.32], [5.36, 100.34], [5.24, 100.29], [5.26, 100.18], [5.40, 100.16]] // island (drawn a little larger so it can be clicked)
    ],
    periods: [
      [1500, 'local', 'Part of the Kedah sultanate'],
      [1786, 'british', 'British East India Company; one of the Straits Settlements from 1826'],
      [1941, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'In 1786 Francis Light of the British East India Company set up a trading post on Penang Island, with the agreement of the Sultan of Kedah. The mainland strip, Province Wellesley (now Seberang Perai), followed in 1800. From 1826 Penang was one of the three Straits Settlements, alongside Melaka and Singapore.'
  },
  {
    id: 'perak', name: 'Perak', label: [4.75, 101.00],
    shape: [[N.K4, N.K3, N.K2, N.KP1, N.T2, N.T3, N.KK, N.KPP, N.PH1, N.PPS, N.PS2, N.SB,
             [3.98, 100.75], [4.23, 100.60], [4.50, 100.62], [4.90, 100.48]]],
    periods: [
      [1500, 'local', 'Malay rule (the Perak sultanate is founded around 1528)'],
      [1874, 'british', 'Pangkor Treaty puts a British Resident in charge'],
      [1941, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: "Perak's tin made it a prize. A fight over the throne, and clashes between Chinese mining societies, gave Britain an opening: the 1874 Pangkor Treaty put a British Resident in charge of everything except Malay religion and custom. Resistance followed, and the first Resident, J.W.W. Birch, was killed at Pasir Salak in 1875."
  },
  {
    id: 'kelantan', name: 'Kelantan', label: [5.40, 101.95],
    shape: [[N.T3, [6.05, 101.75], N.KT, [6.20, 102.20], [6.05, 102.38], N.KTr, N.KT2, N.KTP, N.KP2, N.KPP, N.KK]],
    periods: [
      [1500, 'local', 'Kelantan sultanate, sending tribute to Siam'],
      [1902, 'siam', 'Siam places an adviser in the state'],
      [1909, 'british', 'Anglo-Siamese Treaty passes Kelantan to Britain'],
      [1941, 'japan', 'Japanese troops land at Kota Bharu, 8 December 1941'],
      [1943, 'siam', 'Japan hands the state to Thailand'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'Kelantan paid tribute to Siam for much of the 1800s, and in 1902 Siam placed an adviser in the state. The 1909 Anglo-Siamese Treaty moved Kelantan to Britain. On 8 December 1941, Japanese troops landed at Kota Bharu, starting the invasion of Malaya.'
  },
  {
    id: 'terengganu', name: 'Terengganu', label: [4.92, 102.93], labelSize: 8,
    shape: [[N.KTr, [5.60, 102.80], [5.33, 103.14], [5.05, 103.35], [4.76, 103.42], N.TPc, N.TP1, N.TP2, N.KTP, N.KT2]],
    periods: [
      [1500, 'local', 'Terengganu sultanate, sending tribute to Siam'],
      [1909, 'british', 'Passed to Britain; accepts a British Adviser only in 1919'],
      [1941, 'japan', 'Japanese occupation'],
      [1943, 'siam', 'Japan hands the state to Thailand'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'Terengganu also sent tribute to Siam until the 1909 treaty transferred it to Britain, though it held out until 1919 before accepting a British Adviser. In 1928 farmers rose against new colonial land and forest rules, an uprising linked to the religious teacher Haji Abdul Rahman Limbong.'
  },
  {
    id: 'pahang', name: 'Pahang', label: [3.75, 102.65],
    shape: [[N.KPP, N.KP2, N.KTP, N.TP2, N.TP1, N.TPc, [3.80, 103.33], [3.49, 103.40], [3.05, 103.45],
             N.PJc, N.PJ1, N.PJ2, N.PJN, N.PN1, N.PNS, N.PS1, N.PS3, N.PPS, N.PH1]],
    periods: [
      [1500, 'local', 'Pahang sultanate'],
      [1888, 'british', 'A British Resident is appointed'],
      [1942, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: "Pahang accepted a British Resident in 1888 under heavy pressure. Local chiefs rose against the new rules in the Pahang War (1891–1895), led by figures such as Dato' Bahaman and Mat Kilau."
  },
  {
    id: 'selangor', name: 'Selangor', label: [3.30, 101.10], labelAnchor: 'end', labelOutside: true,
    shape: [[N.PPS, N.PS3, N.PS1, N.PNS, N.SN1, N.SNc, [3.00, 101.39], [3.34, 101.25], [3.55, 101.05], N.SB, N.PS2]],
    periods: [
      [1500, 'local', 'Malay chiefs (the Selangor sultanate begins in 1766)'],
      [1874, 'british', 'A British Resident is placed after the Klang War'],
      [1942, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'Tin mining around Klang and Kuala Lumpur set off the Klang War (1867–1874) between rival Malay chiefs. Britain used the unrest to place a Resident in Selangor in 1874, and Kuala Lumpur later became the capital of the Federated Malay States (1896).'
  },
  {
    id: 'ns', name: 'Negeri Sembilan', label: [2.47, 101.76], labelAnchor: 'end', labelOutside: true,
    shape: [[N.PNS, N.PN1, N.PJN, N.MNJ, N.NM2, N.NM1, N.NMc, [2.52, 101.80], N.SNc, N.SN1]],
    periods: [
      [1500, 'local', 'A confederation of small Malay states'],
      [1895, 'british', 'The whole confederation is under British control (Sungai Ujong first, in 1874)'],
      [1942, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: "Negeri Sembilan, 'nine states', is a confederation with Minangkabau roots and its own adat perpatih customs. Britain took control piece by piece: Sungai Ujong accepted a Resident in 1874, and by 1895 the whole confederation was under British control."
  },
  {
    id: 'melaka', name: 'Melaka', label: [2.02, 102.12], labelAnchor: 'end', small: true,
    shape: [[N.NMc, N.NM1, N.NM2, N.MNJ, N.MJ1, N.MJc, [2.19, 102.25], [2.30, 102.10]]],
    periods: [
      [1500, 'local', 'The Melaka Sultanate at its height'],
      [1511, 'portuguese', 'Portuguese capture Melaka'],
      [1641, 'dutch', 'Dutch take Melaka, with help from Johor'],
      [1795, 'british', 'Britain takes over during the Napoleonic Wars'],
      [1818, 'dutch', 'Returned to the Dutch'],
      [1824, 'british', 'Anglo-Dutch Treaty hands Melaka to Britain; a Straits Settlement from 1826'],
      [1942, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'Melaka was the great port of the region until the Portuguese captured it in 1511. The Dutch, with help from Johor, took it in 1641. Britain held it during the Napoleonic Wars, and the Anglo-Dutch Treaty of 1824 handed it to Britain for good.'
  },
  {
    id: 'johor', name: 'Johor', label: [1.95, 103.40],
    shape: [[N.PJc, [2.43, 103.84], [2.00, 104.10], [1.60, 104.25], [1.38, 104.28], [1.47, 104.00], [1.50, 103.76],
             [1.42, 103.58], [1.27, 103.48], [1.49, 103.36], [1.85, 102.93], [2.00, 102.70],
             N.MJc, N.MJ1, N.MNJ, N.PJN, N.PJ2, N.PJ1]],
    periods: [
      [1500, 'local', 'Part of the Melaka Sultanate, then the Johor sultanate from 1528'],
      [1914, 'british', 'The sultan accepts a British General Adviser'],
      [1942, 'japan', 'Japanese occupation'],
      [1945, 'british', POSTWAR],
      [1957, 'independent', MERDEKA]
    ],
    story: 'Johor rose from the remains of the Melaka Sultanate after 1511 and stayed independent the longest. Sultan Abu Bakar modernised the state and dealt with Britain as a partner, but in 1914 Johor had to accept a British General Adviser.'
  },
  {
    id: 'singapore', name: 'Singapore', label: [1.06, 103.83], small: true,
    shape: [[[1.40, 103.66], [1.40, 103.92], [1.35, 104.02], [1.27, 103.92], [1.24, 103.75], [1.30, 103.63]]],
    periods: [
      [1500, 'local', 'Part of the Melaka, then Johor, sultanates'],
      [1819, 'british', 'Raffles sets up a British trading post; a Straits Settlement from 1826'],
      [1942, 'japan', 'Falls to Japan on 15 February 1942'],
      [1945, 'british', 'British rule returns; a separate Crown colony from 1946'],
      [1963, 'independent', 'Joins Malaysia (leaves in 1965)']
    ],
    story: 'Stamford Raffles set up a British trading post in 1819, and Singapore soon became the busiest of the Straits Settlements, and their capital from 1832. It fell to Japan in February 1942. Singapore joined Malaysia in 1963 but left in 1965 to become an independent country.'
  },
  {
    id: 'sarawak', name: 'Sarawak', label: [2.35, 113.00],
    shape: [[[2.08, 109.64], [1.65, 109.80], [1.35, 110.20], [1.10, 110.55], [1.00, 111.20], [0.95, 111.80],
             [1.25, 112.30], [1.50, 112.90], [1.55, 113.60], [2.00, 114.20], [2.50, 114.60], [3.10, 115.00],
             N.SST, N.SS1, N.SSc, [5.02, 115.10], [4.60, 114.10], [4.40, 113.98], [3.85, 113.70],
             [3.20, 113.05], [2.90, 112.10], [2.60, 111.55], [2.20, 111.25], [1.70, 111.30],
             [1.65, 110.95], [1.70, 110.40], [1.90, 109.95]]],
    periods: [
      [1500, 'local', 'Part of the Brunei Sultanate'],
      [1841, 'brooke', 'James Brooke becomes Rajah; a British protectorate from 1888'],
      [1941, 'japan', 'Japanese occupation'],
      [1945, 'british', 'British rule; ceded to Britain as a Crown colony in 1946'],
      [1963, 'independent', 'Joins Malaysia']
    ],
    story: "Sarawak was part of the Brunei Sultanate until 1841, when the English adventurer James Brooke was made Rajah for helping end a local revolt. Three 'White Rajahs' ruled for a century, pushing the borders outward. In 1946 the last Rajah ceded Sarawak to Britain despite strong local protest."
  },
  {
    id: 'sabah', name: 'Sabah', label: [5.35, 117.05],
    shape: [[N.SSc, [5.30, 115.45], [5.60, 115.70], [5.98, 116.05], [6.40, 116.40], [7.00, 116.75], [6.80, 117.15],
             [6.30, 117.50], [6.05, 117.75], [5.84, 118.12], [5.75, 118.60], [5.35, 119.25], [5.05, 119.10],
             [5.03, 118.40], [4.48, 118.62], [4.25, 117.95], [4.17, 117.70], [4.20, 117.10], [4.30, 116.20],
             [4.25, 115.80], N.SST, N.SS1]],
    periods: [
      [1500, 'local', 'Claimed by the Brunei and Sulu sultanates'],
      [1881, 'british', 'British North Borneo Chartered Company; a protectorate from 1888'],
      [1942, 'japan', 'Japanese occupation'],
      [1945, 'british', 'British rule; a Crown colony from 1946'],
      [1963, 'independent', 'Joins Malaysia']
    ],
    story: 'Sabah was claimed by the sultanates of Brunei and Sulu. After leases to Western traders in 1877–78, the British North Borneo Chartered Company took control in 1881 and ran it as a business. Mat Salleh led a rebellion against company rule from 1894 to 1900.'
  }
];

// Brunei is shown for context only (not part of Malaysia, not clickable)
const BRUNEI = {
  label: [4.42, 114.55],
  shape: [
    [[4.58, 114.10], [4.95, 114.95], [4.85, 115.03], [4.30, 114.85], [4.00, 114.62], [4.25, 114.25]],
    [[4.98, 115.15], [4.98, 115.35], [4.60, 115.35], [4.62, 115.15]]
  ]
};

const KEY_MOMENTS = [
  { year: 1511, text: 'Portuguese capture Melaka' },
  { year: 1641, text: 'Dutch take Melaka' },
  { year: 1786, text: 'British take Penang' },
  { year: 1841, text: 'Brooke family begins rule of Sarawak' },
  { year: 1874, text: 'Pangkor Treaty brings Perak under British control' },
  { year: 1881, text: 'British company takes over North Borneo (Sabah)' },
  { year: 1909, text: 'Siam hands northern states to Britain' },
  { year: 1941, text: 'Japanese occupation begins' },
  { year: 1957, text: 'Merdeka: Malaya becomes independent' },
  { year: 1963, text: 'Malaysia is formed with Sabah and Sarawak' }
];

// Shown before the first key moment
const START_MOMENT = { year: 1500, text: 'The Melaka Sultanate controls trade through the Strait of Melaka' };
