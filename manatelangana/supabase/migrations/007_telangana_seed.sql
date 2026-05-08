-- ============================================
-- SEED: 17 Telangana MPs (2024 Lok Sabha)
-- ============================================

INSERT INTO mp (name_en, name_te, party, constituency_en, constituency_te,
  lok_sabha_seat_number) VALUES
('Gaddam Vamsi Krishna','గడ్డం వంశీకృష్ణ','INC','Adilabad','ఆదిలాబాద్',1),
('Athram Suguna','అత్రం సుగుణ','BJP','Peddapalle','పెద్దపల్లి',2),
('Bandi Sanjay Kumar','బండి సంజయ్ కుమార్','BJP','Karimnagar','కరీంనగర్',3),
('Dharmapuri Arvind','ధర్మపురి అరవింద్','BJP','Nizamabad','నిజామాబాద్',4),
('B.B. Patil','బి.బి. పాటిల్','INC','Zahirabad','జహీరాబాద్',5),
('Raghu Rama Krishna Raju','రాఘురామ కృష్ణ రాజు','INC','Medak','మెదక్',6),
('G. Kishan Reddy','జి. కిషన్ రెడ్డి','BJP','Secunderabad','సికింద్రాబాద్',7),
('Asaduddin Owaisi','అసదుద్దీన్ ఒవైసీ','AIMIM','Hyderabad','హైదరాబాద్',8),
('Raghuveer Kunduru','రఘువీర్ కుందురు','INC','Nalgonda','నల్గొండ',9),
('Chamala Kiran Kumar Reddy','చామల కిరణ్ కుమార్ రెడ్డి','INC','Bhongir','భోంగీర్',10),
('Kadiyam Kavya','కాడియం కావ్య','INC','Warangal','వరంగల్',11),
('Balram Naik Pohuluri','బాలరాం నాయక్ పోహులూరి','INC','Mahabubabad','మహబూబాబాద్',12),
('Tummala Nageswara Rao','తుమ్మల నాగేశ్వర రావు','INC','Khammam','ఖమ్మం',13),
('Mallu Ravi','మల్లు రవి','INC','Nagarkurnool','నాగర్‌కర్నూల్',14),
('Suresh Kumar Shetkar','సురేష్ కుమార్ శెట్కర్','BJP','Adilabad','ఆదిలాబాద్',1),
('Boora Narsaiah Goud','బూర నర్సయ్య గౌడ్','INC','Bhongir','భోంగీర్',10),
('Komatireddy Venkat Reddy','కొమటిరెడ్డి వెంకట్ రెడ్డి','INC','Nalgonda','నల్గొండ',9);

-- ============================================
-- SEED: Nalgonda district MLAs (2023 Assembly)
-- ============================================

-- First get the Nalgonda MP id for linking
DO $$
DECLARE
  nalgonda_mp_id uuid;
  bhongir_mp_id uuid;
BEGIN
  SELECT id INTO nalgonda_mp_id FROM mp
    WHERE constituency_en = 'Nalgonda' LIMIT 1;
  SELECT id INTO bhongir_mp_id FROM mp
    WHERE constituency_en = 'Bhongir' LIMIT 1;

  INSERT INTO mla (name_en, name_te, party, constituency_en, constituency_te,
    constituency_number, mp_id) VALUES
  ('Komatireddy Venkat Reddy','కొమటిరెడ్డి వెంకట్ రెడ్డి','INC',
    'Nalgonda','నల్గొండ',92, nalgonda_mp_id),
  ('Vemula Veeresham','వేముల వీరేశం','INC',
    'Nakrekal','నాక్రేకల్',93, nalgonda_mp_id),
  ('P. Sudarshan Reddy','పి. సుదర్శన్ రెడ్డి','INC',
    'Devarakonda','దేవరకొండ',94, nalgonda_mp_id),
  ('Komatireddy Rajgopal Reddy','కొమటిరెడ్డి రాజ్‌గోపాల్ రెడ్డి','INC',
    'Munugode','మునుగోడు',95, nalgonda_mp_id),
  ('N. Uttam Kumar Reddy','ఎన్. ఉత్తమ్ కుమార్ రెడ్డి','INC',
    'Huzurnagar','హుజూర్‌నగర్',96, nalgonda_mp_id),
  ('S. Rajender Reddy','ఎస్. రాజేందర్ రెడ్డి','INC',
    'Kodad','కోడాడ్',97, nalgonda_mp_id),
  ('G. Lasya Nanditha','జి. లాస్య నందిత','INC',
    'Miryalaguda','మిర్యాలగూడ',98, nalgonda_mp_id),
  ('B. Mahesh Kumar Goud','బి. మహేష్ కుమార్ గౌడ్','INC',
    'Nagarjunasagar','నాగార్జున సాగర్',99, nalgonda_mp_id),
  ('Jagadish Reddy','జగదీశ్ రెడ్డి','BRS',
    'Suryapet','సూర్యాపేట',100, nalgonda_mp_id),
  ('T. Jayaprakash Reddy','టి. జయప్రకాష్ రెడ్డి','INC',
    'Nalgonda','నల్గొండ',92, nalgonda_mp_id),
  ('V. Sunitha Lakshma Reddy','వి. సునీత లక్ష్మా రెడ్డి','INC',
    'Bhongir','భోంగీర్',88, bhongir_mp_id),
  ('Nagarjuna Yadav','నాగార్జున యాదవ్','INC',
    'Yadagirigutta','యాదగిరిగుట్ట',47, bhongir_mp_id);
END $$;

-- ============================================
-- LINK existing wards to mla table
-- ============================================

UPDATE wards w
SET mla_id = m.id
FROM mla m
WHERE w.mla_name = m.name_en;

-- ============================================
-- VERIFY: show counts after seeding
-- ============================================

SELECT 'MPs inserted' as check, COUNT(*) as count FROM mp
UNION ALL
SELECT 'MLAs inserted', COUNT(*) FROM mla
UNION ALL
SELECT 'Wards linked to MLA', COUNT(*) FROM wards WHERE mla_id IS NOT NULL;
