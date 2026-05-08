-- ============================================================
-- TEMPORARY WARD DATA — Nalgonda District
-- Approximate ward data to keep the app functional while
-- accurate ward-level data is being collected.
-- Replace rows with verified data as it becomes available.
-- ============================================================

insert into public.wards
  (ward_number, ward_name_en, ward_name_te, mandal_en, mandal_te,
   constituency_en, mla_name, mla_party, mp_name, mp_constituency,
   district, lat, lng)
values
  -- Nalgonda Mandal / Constituency
  (1,  'Nalgonda Ward 1',   'నల్గొండ వార్డు 1',   'Nalgonda',    'నల్గొండ',    'Nalgonda',      'Kancharla Bhupal Reddy', 'BRS', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.05490000, 79.26730000),
  (2,  'Nalgonda Ward 2',   'నల్గొండ వార్డు 2',   'Nalgonda',    'నల్గొండ',    'Nalgonda',      'Kancharla Bhupal Reddy', 'BRS', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.05800000, 79.27100000),
  (3,  'Nalgonda Ward 3',   'నల్గొండ వార్డు 3',   'Nalgonda',    'నల్గొండ',    'Nalgonda',      'Kancharla Bhupal Reddy', 'BRS', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.04900000, 79.26200000),
  (4,  'Nalgonda Ward 4',   'నల్గొండ వార్డు 4',   'Nalgonda',    'నల్గొండ',    'Nalgonda',      'Kancharla Bhupal Reddy', 'BRS', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.06100000, 79.26500000),
  (5,  'Nalgonda Ward 5',   'నల్గొండ వార్డు 5',   'Nalgonda',    'నల్గొండ',    'Nalgonda',      'Kancharla Bhupal Reddy', 'BRS', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.05200000, 79.27400000),

  -- Miryalaguda Mandal / Constituency
  (1,  'Miryalaguda Ward 1',  'మిర్యాలగూడ వార్డు 1',  'Miryalaguda', 'మిర్యాలగూడ', 'Miryalaguda',   'Bandi Srinivas Rao',     'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.87080000, 79.56280000),
  (2,  'Miryalaguda Ward 2',  'మిర్యాలగూడ వార్డు 2',  'Miryalaguda', 'మిర్యాలగూడ', 'Miryalaguda',   'Bandi Srinivas Rao',     'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.87400000, 79.56600000),
  (3,  'Miryalaguda Ward 3',  'మిర్యాలగూడ వార్డు 3',  'Miryalaguda', 'మిర్యాలగూడ', 'Miryalaguda',   'Bandi Srinivas Rao',     'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.86700000, 79.55900000),
  (4,  'Miryalaguda Ward 4',  'మిర్యాలగూడ వార్డు 4',  'Miryalaguda', 'మిర్యాలగూడ', 'Miryalaguda',   'Bandi Srinivas Rao',     'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.87200000, 79.57000000),

  -- Huzurnagar Mandal / Constituency
  (1,  'Huzurnagar Ward 1',   'హుజూర్‌నగర్ వార్డు 1',  'Huzurnagar',  'హుజూర్‌నగర్',  'Huzurnagar',    'Saidi Reddy Padma',      'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.89790000, 79.88780000),
  (2,  'Huzurnagar Ward 2',   'హుజూర్‌నగర్ వార్డు 2',  'Huzurnagar',  'హుజూర్‌నగర్',  'Huzurnagar',    'Saidi Reddy Padma',      'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.90100000, 79.89100000),
  (3,  'Huzurnagar Ward 3',   'హుజూర్‌నగర్ వార్డు 3',  'Huzurnagar',  'హుజూర్‌నగర్',  'Huzurnagar',    'Saidi Reddy Padma',      'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.89400000, 79.88300000),

  -- Nakrekal Mandal / Constituency
  (1,  'Nakrekal Ward 1',     'నాకరేకల్ వార్డు 1',   'Nakrekal',    'నాకరేకల్',   'Nakrekal',      'Chirumarthi Lingaiah',   'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.73250000, 79.28560000),
  (2,  'Nakrekal Ward 2',     'నాకరేకల్ వార్డు 2',   'Nakrekal',    'నాకరేకల్',   'Nakrekal',      'Chirumarthi Lingaiah',   'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.73600000, 79.28900000),
  (3,  'Nakrekal Ward 3',     'నాకరేకల్ వార్డు 3',   'Nakrekal',    'నాకరేకల్',   'Nakrekal',      'Chirumarthi Lingaiah',   'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 16.72900000, 79.28200000),

  -- Devarakonda Mandal / Constituency
  (1,  'Devarakonda Ward 1',  'దేవరకొండ వార్డు 1',  'Devarakonda', 'దేవరకొండ',  'Devarakonda',   'G. Vivek Venkateswara Rao', 'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.68870000, 78.91850000),
  (2,  'Devarakonda Ward 2',  'దేవరకొండ వార్డు 2',  'Devarakonda', 'దేవరకొండ',  'Devarakonda',   'G. Vivek Venkateswara Rao', 'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.69200000, 78.92200000),
  (3,  'Devarakonda Ward 3',  'దేవరకొండ వార్డు 3',  'Devarakonda', 'దేవరకొండ',  'Devarakonda',   'G. Vivek Venkateswara Rao', 'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.68500000, 78.91400000),

  -- Munugode Mandal / Constituency
  (1,  'Munugode Ward 1',     'మునుగోడు వార్డు 1',   'Munugode',    'మునుగోడు',   'Munugode',      'Komatireddy Rajgopal Reddy', 'BJP', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.80410000, 78.97690000),
  (2,  'Munugode Ward 2',     'మునుగోడు వార్డు 2',   'Munugode',    'మునుగోడు',   'Munugode',      'Komatireddy Rajgopal Reddy', 'BJP', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.80800000, 78.98100000),
  (3,  'Munugode Ward 3',     'మునుగోడు వార్డు 3',   'Munugode',    'మునుగోడు',   'Munugode',      'Komatireddy Rajgopal Reddy', 'BJP', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.80000000, 78.97200000),

  -- Bhongir Mandal / Yadadri Constituency
  (1,  'Bhongir Ward 1',      'భువనగిరి వార్డు 1',   'Bhongir',     'భువనగిరి',   'Bhongir',       'Mynampally Rohith Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.51280000, 78.88200000),
  (2,  'Bhongir Ward 2',      'భువనగిరి వార్డు 2',   'Bhongir',     'భువనగిరి',   'Bhongir',       'Mynampally Rohith Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.51600000, 78.88600000),
  (3,  'Bhongir Ward 3',      'భువనగిరి వార్డు 3',   'Bhongir',     'భువనగిరి',   'Bhongir',       'Mynampally Rohith Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.50900000, 78.87800000),

  -- Yadagirigutta Mandal / Yadadri Constituency
  (1,  'Yadagirigutta Ward 1', 'యాదగిరిగుట్ట వార్డు 1', 'Yadagirigutta', 'యాదగిరిగుట్ట', 'Yadadri',  'Mynampally Rohith Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.27780000, 79.01980000),
  (2,  'Yadagirigutta Ward 2', 'యాదగిరిగుట్ట వార్డు 2', 'Yadagirigutta', 'యాదగిరిగుట్ట', 'Yadadri',  'Mynampally Rohith Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.28100000, 79.02300000),

  -- Alair Mandal / Alair Constituency
  (1,  'Alair Ward 1',        'అలైర్ వార్డు 1',      'Alair',       'అలైర్',      'Alair',         'Sanjay Kumar',           'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.32890000, 79.13490000),
  (2,  'Alair Ward 2',        'అలైర్ వార్డు 2',      'Alair',       'అలైర్',      'Alair',         'Sanjay Kumar',           'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir',   'Nalgonda', 17.33200000, 79.13800000),

  -- Suryapet Mandal / Constituency
  (1,  'Suryapet Ward 1',     'సూర్యాపేట వార్డు 1',  'Suryapet',    'సూర్యాపేట',  'Suryapet',      'G. Niranjan',            'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.13940000, 79.62030000),
  (2,  'Suryapet Ward 2',     'సూర్యాపేట వార్డు 2',  'Suryapet',    'సూర్యాపేట',  'Suryapet',      'G. Niranjan',            'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.14300000, 79.62400000),
  (3,  'Suryapet Ward 3',     'సూర్యాపేట వార్డు 3',  'Suryapet',    'సూర్యాపేట',  'Suryapet',      'G. Niranjan',            'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.13600000, 79.61700000),
  (4,  'Suryapet Ward 4',     'సూర్యాపేట వార్డు 4',  'Suryapet',    'సూర్యాపేట',  'Suryapet',      'G. Niranjan',            'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda',  'Nalgonda', 17.13200000, 79.61200000),

  -- Kodad Mandal / Kodad Constituency
  (1,  'Kodad Ward 1',        'కోదాడ వార్డు 1',      'Kodad',       'కోదాడ',      'Kodad',         'Beeram Harshavardhan Reddy', 'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.99790000, 79.96440000),
  (2,  'Kodad Ward 2',        'కోదాడ వార్డు 2',      'Kodad',       'కోదాడ',      'Kodad',         'Beeram Harshavardhan Reddy', 'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 17.00100000, 79.96800000),
  (3,  'Kodad Ward 3',        'కోదాడ వార్డు 3',      'Kodad',       'కోదాడ',      'Kodad',         'Beeram Harshavardhan Reddy', 'INC', 'Nalamada Uttam Kumar Reddy', 'Nalgonda', 'Nalgonda', 16.99400000, 79.96000000),

  -- Turkapally / Choutuppal Constituency
  (1,  'Choutuppal Ward 1',   'చౌటుప్పల్ వార్డు 1',  'Choutuppal',  'చౌటుప్పల్',  'Choutuppal',    'Lakshmareddy Surender Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir', 'Nalgonda', 17.25020000, 78.92340000),
  (2,  'Choutuppal Ward 2',   'చౌటుప్పల్ వార్డు 2',  'Choutuppal',  'చౌటుప్పల్',  'Choutuppal',    'Lakshmareddy Surender Reddy', 'INC', 'Chamala Kiran Kumar Reddy', 'Bhongir', 'Nalgonda', 17.25400000, 78.92700000);
